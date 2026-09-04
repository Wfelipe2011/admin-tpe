"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle, Users, ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { apiClient } from "@/lib/api-client"
import { getUserFromToken } from "@/lib/auth-utils"
import { ParticipantProfile } from "@/types/auth"
import { useGroupStore } from "@/lib/stores/use-group-store"
import { DatePicker } from "@/components/ui/date-picker"

const fmtDate = (d?: Date) => (d ? format(d, "yyyy-MM-dd") : "")

interface IncidentRow {
  id: string
  date: string
  reason: string
  status: string
  participant: { id: string; name: string; profilePhoto: string | null }
  reporter: { id: string; name: string }
  group: { id: string; name: string }
  designation: { id: string; name: string }
}

interface IncidentsList {
  page: number
  pageSize: number
  total: number
  data: IncidentRow[]
}

interface IncidentsSummary {
  total: number
  byParticipant: { participantId: string; name: string; count: number }[]
  byGroup: { groupId: string; name: string; count: number }[]
}

interface HealthGroup {
  groupId: string
  name: string
  incidents: number
  designations: number
  avgPerDesignation: number | null
  vsOverall: "above" | "below" | "equal" | null
  deltaPct: number | null
}

interface IncidentsHealth {
  overallAvgPerDesignation: number
  groupsConsidered: number
  groups: HealthGroup[]
}

const nf1 = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })

const PAGE_SIZE = 50
const RANKING_PAGE_SIZE = 50
const PIE_COLORS = [
  "#374192", "#5A67B8", "#7C89D9", "#929BD2", "#46607F",
  "#6B8CAE", "#3F7CAC", "#5FA8D3", "#8FC1E3", "#B5D5EA",
  "#2E5266", "#4C7A9E", "#6FA3C0", "#A3C9DE", "#CBB7D9",
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR")
}

export function IncidentsPanel() {
  const user = useMemo(() => getUserFromToken(), [])
  const canSeeAllGroups =
    user?.profile === ParticipantProfile.COORDINATOR ||
    user?.profile === ParticipantProfile.ADMIN_ANALYST

  const [tab, setTab] = useState<"resumo" | "grupos">("resumo")

  // Grupo/dia sincroniza com o seletor global do menu lateral (mesmo store do
  // GroupSelector). O <select> de grupo no painel escreve nesse mesmo store.
  const { selectedGroupId, setSelectedGroupId } = useGroupStore()
  const groupParam = selectedGroupId && selectedGroupId !== "todos" ? selectedGroupId : ""
  // mostra a coluna "Grupo" na lista de faltas quando não há um dia específico selecionado
  const showGroupCol = groupParam === ""

  // filtros locais
  const [nameInput, setNameInput] = useState("")
  const [nameFilter, setNameFilter] = useState("")
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([])
  // participante selecionado no ranking (drill-down do painel de faltas)
  const [selected, setSelected] = useState<{ id: string; name: string; count: number } | null>(null)

  // dados
  const [summary, setSummary] = useState<IncidentsSummary | null>(null)
  const [health, setHealth] = useState<IncidentsHealth | null>(null)
  const [list, setList] = useState<IncidentsList | null>(null)
  const [page, setPage] = useState(1)
  const [rankingPage, setRankingPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // debounce do filtro de nome — mexer no nome limpa a seleção
  useEffect(() => {
    const t = setTimeout(() => {
      setNameFilter(nameInput.trim())
      setPage(1)
      setRankingPage(1)
      setSelected(null)
    }, 400)
    return () => clearTimeout(t)
  }, [nameInput])

  // trocar grupo/dia ou o intervalo de data reseta paginação e a seleção do ranking
  useEffect(() => {
    setSelected(null)
    setPage(1)
    setRankingPage(1)
  }, [selectedGroupId, dateFrom, dateTo])

  // lista de grupos pro <select> do coordenador (mesma fonte do GroupSelector)
  useEffect(() => {
    if (!canSeeAllGroups) return
    apiClient
      .get<{ id: string; name: string }[]>("/groups", { endpoint: "new" })
      .then((data) => setGroups(Array.isArray(data) ? data.map((g) => ({ id: g.id, name: g.name })) : []))
      .catch(() => setGroups([]))
  }, [canSeeAllGroups])

  // parâmetros comuns (grupo do menu + nome + intervalo de data) — NÃO inclui a seleção do ranking
  const baseQuery = useCallback(() => {
    const p = new URLSearchParams()
    if (nameFilter) p.set("participantName", nameFilter)
    if (groupParam) p.set("groupId", groupParam)
    if (dateFrom) p.set("dateFrom", fmtDate(dateFrom))
    if (dateTo) p.set("dateTo", fmtDate(dateTo))
    return p
  }, [nameFilter, groupParam, dateFrom, dateTo])

  // summary (contador geral + ranking + por grupo) — reage a grupo + nome
  useEffect(() => {
    setLoading(true)
    setError(null)
    apiClient
      .get<IncidentsSummary>(`/incidents/summary?${baseQuery().toString()}`, { endpoint: "new" })
      .then((data) => setSummary(data))
      .catch((e) => setError(e?.response?.data?.message || "Erro ao carregar o resumo"))
      .finally(() => setLoading(false))
  }, [baseQuery])

  // saúde (média por grupo vs. média geral) — reage a grupo + intervalo de data (não ao nome)
  useEffect(() => {
    const p = new URLSearchParams()
    if (groupParam) p.set("groupId", groupParam)
    if (dateFrom) p.set("dateFrom", fmtDate(dateFrom))
    if (dateTo) p.set("dateTo", fmtDate(dateTo))
    apiClient
      .get<IncidentsHealth>(`/incidents/health?${p.toString()}`, { endpoint: "new" })
      .then((data) => setHealth(data))
      .catch(() => setHealth(null))
  }, [groupParam, dateFrom, dateTo])

  // lista paginada de faltas — reage a grupo + nome + participante selecionado
  useEffect(() => {
    const p = baseQuery()
    if (selected) p.set("participantId", selected.id)
    p.set("page", String(page))
    p.set("pageSize", String(PAGE_SIZE))
    apiClient
      .get<IncidentsList>(`/incidents?${p.toString()}`, { endpoint: "new" })
      .then((data) => setList(data))
      .catch(() => setList(null))
  }, [baseQuery, page, selected])

  const clearFilters = () => {
    setNameInput("")
    setNameFilter("")
    setDateFrom(undefined)
    setDateTo(undefined)
    if (canSeeAllGroups) setSelectedGroupId("todos")
    setSelected(null)
    setPage(1)
    setRankingPage(1)
  }

  const hasFilters =
    nameFilter !== "" || selected !== null || !!dateFrom || !!dateTo || groupParam !== ""

  const toggleSelected = (r: { participantId: string; name: string; count: number }) => {
    setSelected((cur) =>
      cur?.id === r.participantId ? null : { id: r.participantId, name: r.name, count: r.count },
    )
    setPage(1)
  }

  const rankingSlice = useMemo(() => {
    if (!summary) return []
    const start = (rankingPage - 1) * RANKING_PAGE_SIZE
    return summary.byParticipant.slice(start, start + RANKING_PAGE_SIZE)
  }, [summary, rankingPage])
  const rankingPages = summary ? Math.max(1, Math.ceil(summary.byParticipant.length / RANKING_PAGE_SIZE)) : 1
  const listPages = list ? Math.max(1, Math.ceil(list.total / PAGE_SIZE)) : 1

  // contador: se tem participante selecionado, mostra o dele; senão o total dos filtros
  const counter = selected ? selected.count : (summary?.total ?? 0)
  const counterLabel = selected ? `Ausências de ${selected.name}` : "Contador de ausências"

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-gray-100">
        <AlertCircle className="h-10 w-10 text-[#EF4444] mb-3" />
        <p className="text-[#333333] font-medium">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#181C43] to-[#374192] rounded-lg p-4 sm:p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">Lista de Atenção</h1>
            <p className="text-blue-100 text-xs sm:text-sm">
              {groupParam
                ? "Ausências do grupo selecionado no menu"
                : canSeeAllGroups
                  ? "Ausências de todos os grupos"
                  : "Ausências dos seus grupos"}
            </p>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setTab("resumo")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "resumo"
              ? "border-[#374192] text-[#374192]"
              : "border-transparent text-[#666666] hover:text-[#333333]"
          }`}
        >
          Resumo Geral
        </button>
        {canSeeAllGroups && (
          <button
            onClick={() => setTab("grupos")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === "grupos"
                ? "border-[#374192] text-[#374192]"
                : "border-transparent text-[#666666] hover:text-[#333333]"
            }`}
          >
            Grupos
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#666666]">Participante</label>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Filtrar por nome..."
            className="h-9 w-[200px] rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#374192]/30"
          />
        </div>

        {canSeeAllGroups && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#666666]">Grupo</label>
            <select
              value={selectedGroupId || "todos"}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="h-9 w-[200px] rounded-md border border-gray-200 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#374192]/30"
            >
              <option value="todos">Todos os grupos</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#666666]">Data inicial</label>
          <DatePicker
            selected={dateFrom}
            onSelect={setDateFrom}
            locale={ptBR}
            placeholder="Início"
            className="h-9 w-[170px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#666666]">Data final</label>
          <DatePicker
            selected={dateTo}
            onSelect={setDateTo}
            locale={ptBR}
            placeholder="Fim"
            className="h-9 w-[170px]"
          />
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="h-9 inline-flex items-center gap-1 rounded-md border border-[#929BD2] px-3 text-sm text-[#374192] hover:bg-[#374192]/10 ml-auto"
          >
            <X className="h-3.5 w-3.5" />
            Limpar filtros
          </button>
        )}
      </div>

      {/* Contador + saúde lado a lado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-[#374192]/10">
            <AlertCircle className="h-6 w-6 text-[#374192]" />
          </div>
          <div>
            <p className="text-3xl font-bold text-[#333333]">
              {loading && !summary ? "…" : counter.toLocaleString("pt-BR")}
            </p>
            <p className="text-sm text-[#666666]">{counterLabel}</p>
          </div>
        </div>

        {tab === "resumo" &&
          health &&
          (canSeeAllGroups ? (
            <BenchmarkCard health={health} />
          ) : (
            health.groups[0] && (
              <CaptainVsAvgCard g={health.groups[0]} overall={health.overallAvgPerDesignation} />
            )
          ))}
      </div>

      {/* Se o capitão tem mais de um grupo, os demais aparecem aqui */}
      {tab === "resumo" && health && !canSeeAllGroups && health.groups.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {health.groups.slice(1).map((g) => (
            <CaptainVsAvgCard key={g.groupId} g={g} overall={health.overallAvgPerDesignation} />
          ))}
        </div>
      )}

      {tab === "resumo" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Ranking por participante */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 border-b border-gray-200 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#929BD2]" />
              <h3 className="text-sm font-semibold text-[#333333]">Participantes por ausências</h3>
              <span className="text-xs text-[#929BD2] ml-auto">clique num nome para ver as faltas</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8F8F8] border-b border-gray-200 text-[#333333]">
                  <th className="px-4 py-2 text-left font-semibold w-10">#</th>
                  <th className="px-4 py-2 text-left font-semibold">Participante</th>
                  <th className="px-4 py-2 text-right font-semibold">Ausências</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rankingSlice.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-[#666666]">
                      {loading ? "Carregando..." : "Nenhum registro"}
                    </td>
                  </tr>
                ) : (
                  rankingSlice.map((r, i) => {
                    const isSel = selected?.id === r.participantId
                    return (
                      <tr
                        key={r.participantId}
                        onClick={() => toggleSelected(r)}
                        className={`cursor-pointer transition-colors ${
                          isSel ? "bg-[#374192]/10" : "hover:bg-gray-50/80"
                        }`}
                      >
                        <td className="px-4 py-2 text-[#666666]">
                          {(rankingPage - 1) * RANKING_PAGE_SIZE + i + 1}
                        </td>
                        <td className={`px-4 py-2 ${isSel ? "font-semibold text-[#374192]" : "text-[#333333]"}`}>
                          {r.name}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-[#333333]">{r.count}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
            {rankingPages > 1 && (
              <Pager
                page={rankingPage}
                pages={rankingPages}
                onPrev={() => setRankingPage((p) => Math.max(1, p - 1))}
                onNext={() => setRankingPage((p) => Math.min(rankingPages, p + 1))}
              />
            )}
          </div>

          {/* Lista de faltas */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 border-b border-gray-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[#929BD2]" />
              <h3 className="text-sm font-semibold text-[#333333]">
                {selected ? `Faltas de ${selected.name}` : "Faltas"}
              </h3>
              {selected && (
                <button
                  onClick={() => {
                    setSelected(null)
                    setPage(1)
                  }}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-[#374192] hover:underline"
                >
                  <X className="h-3 w-3" />
                  ver todas
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8F8F8] border-b border-gray-200 text-[#333333]">
                    <th className="px-4 py-2 text-left font-semibold whitespace-nowrap">Data da falta</th>
                    <th className="px-4 py-2 text-left font-semibold">Motivo</th>
                    {showGroupCol && <th className="px-4 py-2 text-left font-semibold">Grupo</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!list || list.data.length === 0 ? (
                    <tr>
                      <td colSpan={showGroupCol ? 3 : 2} className="px-4 py-8 text-center text-[#666666]">
                        {loading ? "Carregando..." : "Nenhuma falta encontrada"}
                      </td>
                    </tr>
                  ) : (
                    list.data.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/80 align-top">
                        <td className="px-4 py-2 text-[#333333] whitespace-nowrap">{formatDate(row.date)}</td>
                        <td className="px-4 py-2 text-[#666666]">
                          {!selected && (
                            <span className="block font-medium text-[#333333]">{row.participant.name}</span>
                          )}
                          {row.reason}
                        </td>
                        {showGroupCol && (
                          <td className="px-4 py-2 text-[#666666] whitespace-nowrap">{row.group.name}</td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {listPages > 1 && (
              <Pager
                page={page}
                pages={listPages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(listPages, p + 1))}
              />
            )}
          </div>
        </div>
      ) : (
        <GruposTab health={health} />
      )}
    </div>
  )
}

/** Rótulo colorido "acima/abaixo da média" a partir do deltaPct. */
function vsBadge(vsOverall: string | null, deltaPct: number | null) {
  if (!vsOverall || vsOverall === "equal" || deltaPct == null) {
    return <span className="text-xs text-[#666666]">na média</span>
  }
  const above = vsOverall === "above"
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        above ? "bg-[#FEF2F2] text-[#B91C1C]" : "bg-[#ECFDF5] text-[#047857]"
      }`}
    >
      {above ? "▲" : "▼"} {Math.abs(deltaPct).toFixed(0)}% {above ? "acima" : "abaixo"}
    </span>
  )
}

/** Card compacto (mesma altura do contador) — saúde do grupo do capitão vs. a média geral. */
function CaptainVsAvgCard({ g, overall }: { g: HealthGroup; overall: number }) {
  const avg = g.avgPerDesignation
  const above = g.vsOverall === "above"
  const equalOrNull = g.vsOverall === "equal" || g.deltaPct == null || avg == null
  const accent = equalOrNull ? "border-gray-200" : above ? "border-[#FCA5A5]" : "border-[#6EE7B7]"
  const iconBg = equalOrNull ? "bg-gray-100" : above ? "bg-[#FEF2F2]" : "bg-[#ECFDF5]"
  const iconColor = equalOrNull ? "text-[#666666]" : above ? "text-[#B91C1C]" : "text-[#047857]"

  return (
    <div className={`bg-white rounded-lg border-2 ${accent} shadow-sm p-5 flex items-center gap-4`}>
      <div className={`p-3 rounded-lg ${iconBg}`}>
        {equalOrNull ? (
          <Minus className={`h-6 w-6 ${iconColor}`} />
        ) : above ? (
          <TrendingUp className={`h-6 w-6 ${iconColor}`} />
        ) : (
          <TrendingDown className={`h-6 w-6 ${iconColor}`} />
        )}
      </div>
      <div>
        <p className={`text-3xl font-bold ${equalOrNull ? "text-[#333333]" : above ? "text-[#B91C1C]" : "text-[#047857]"}`}>
          {equalOrNull ? "Na média" : `${Math.abs(g.deltaPct as number).toFixed(0)}% ${above ? "acima" : "abaixo"}`}
        </p>
        <p className="text-sm text-[#666666]">
          {avg == null ? (
            "Sem dias trabalhados registrados"
          ) : (
            <>
              da média — seu grupo faz <strong>{nf1(avg)}</strong> faltas/dia trabalhado, o normal é{" "}
              <strong>{nf1(overall)}</strong>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

/** Card compacto de benchmark geral para o coordenador (detalhe por grupo na aba Grupos). */
function BenchmarkCard({ health }: { health: IncidentsHealth }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className="p-3 rounded-lg bg-[#374192]/10">
        <TrendingUp className="h-6 w-6 text-[#374192]" />
      </div>
      <div>
        <p className="text-3xl font-bold text-[#333333]">{nf1(health.overallAvgPerDesignation)}</p>
        <p className="text-sm text-[#666666]">
          Média geral: faltas por dia trabalhado ({health.groupsConsidered}{" "}
          {health.groupsConsidered === 1 ? "grupo" : "grupos"}) · comparação por grupo na aba{" "}
          <strong>Grupos</strong>
        </p>
      </div>
    </div>
  )
}

function Pager({
  page,
  pages,
  onPrev,
  onNext,
}: {
  page: number
  pages: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 text-sm text-[#666666]">
      <span>
        Página {page} de {pages}
      </span>
      <div className="flex gap-1">
        <button
          onClick={onPrev}
          disabled={page <= 1}
          className="h-7 w-7 inline-flex items-center justify-center rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onNext}
          disabled={page >= pages}
          className="h-7 w-7 inline-flex items-center justify-center rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function GruposTab({ health }: { health: IncidentsHealth | null }) {
  if (!health) {
    return <div className="bg-white rounded-lg border border-gray-100 p-8 text-center text-[#666666]">Carregando...</div>
  }
  const data = health.groups
  const total = data.reduce((s, g) => s + g.incidents, 0)
  if (data.length === 0) {
    return <div className="bg-white rounded-lg border border-gray-100 p-8 text-center text-[#666666]">Sem dados de grupos</div>
  }
  const pieData = data.filter((g) => g.incidents > 0)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 text-sm text-[#666666]">
        <strong className="text-[#333333]">Média geral (o "normal"):</strong>{" "}
        <strong className="text-[#374192]">{nf1(health.overallAvgPerDesignation)}</strong> faltas por dia trabalhado
        {" "}— média das médias de {health.groupsConsidered}{" "}
        {health.groupsConsidered === 1 ? "grupo" : "grupos"} com dias trabalhados registrados.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-[#333333] mb-3">Distribuição de faltas por grupo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="incidents"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                strokeWidth={1}
                isAnimationActive={false}
                label={(e: { percent?: number }) =>
                  e.percent != null ? `${(e.percent * 100).toFixed(0)}%` : ""
                }
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} (${total ? ((value / total) * 100).toFixed(1) : 0}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#666666]">
            {pieData.map((g, i) => (
              <span key={g.groupId} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                {g.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-[#333333]">Saúde por grupo</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8F8F8] border-b border-gray-200 text-[#333333]">
                  <th className="px-3 py-2 text-left font-semibold">Grupo</th>
                  <th className="px-3 py-2 text-right font-semibold">Faltas</th>
                  <th className="px-3 py-2 text-right font-semibold">Dias trab.</th>
                  <th className="px-3 py-2 text-right font-semibold">Média</th>
                  <th className="px-3 py-2 text-right font-semibold">vs. normal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((g, i) => (
                  <tr key={g.groupId} className="hover:bg-gray-50/80">
                    <td className="px-3 py-2 text-[#333333] flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      {g.name}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-[#333333]">{g.incidents}</td>
                    <td className="px-3 py-2 text-right text-[#666666]">{g.designations}</td>
                    <td className="px-3 py-2 text-right font-semibold text-[#333333]">
                      {g.avgPerDesignation == null ? "—" : nf1(g.avgPerDesignation)}
                    </td>
                    <td className="px-3 py-2 text-right">{vsBadge(g.vsOverall, g.deltaPct)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-[#F8F8F8]">
                  <td className="px-3 py-2 font-semibold text-[#333333]">Total / normal</td>
                  <td className="px-3 py-2 text-right font-bold text-[#374192]">{total}</td>
                  <td className="px-3 py-2" />
                  <td className="px-3 py-2 text-right font-bold text-[#374192]">
                    {nf1(health.overallAvgPerDesignation)}
                  </td>
                  <td className="px-3 py-2" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
