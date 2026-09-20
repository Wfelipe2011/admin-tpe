"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  Users,
  Phone,
  MessageCircle,
  UserPlus,
  Search,
  X,
  AlertTriangle,
  GraduationCap,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AvailabilityItem {
  weekDay: number
  morning: boolean
  afternoon: boolean
  evening: boolean
  updatedAt?: string
}

interface WaitlistCandidate {
  participantId: string
  name: string
  sex: "MALE" | "FEMALE"
  phone: string
  profilePhoto: string | null
  congregation: { id: number; name: string; city: string | null } | null
  availability: AvailabilityItem[]
  waitingSince: string
}

interface WaitlistGroup {
  groupId: string
  name: string
  type: "MAIN" | "ADDITIONAL" | "SPECIAL"
  weekday: string
  period: "morning" | "afternoon" | "evening"
  configStartHour: string
  configEndHour: string
  configMin: number
  configMax: number
  currentMembers: number
  vacancies: number
  needsHelp: boolean
  candidates: WaitlistCandidate[]
}

interface WaitlistResponse {
  summary: { groupsNeedingHelp: number; waitlistTotal: number; bySex: { MALE: number; FEMALE: number } }
  groups: WaitlistGroup[]
}

interface Congregation {
  id: number
  name: string
  city: string | null
}

const WEEKDAY_PT: Record<string, string> = {
  SUNDAY: "Domingo",
  MONDAY: "Segunda",
  TUESDAY: "Terça",
  WEDNESDAY: "Quarta",
  THURSDAY: "Quinta",
  FRIDAY: "Sexta",
  SATURDAY: "Sábado",
}
const WEEKDAY_ABBR: Record<number, string> = { 0: "Dom", 1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex", 6: "Sáb" }
const WEEKDAY_LIST: { num: number; label: string }[] = [
  { num: 0, label: "Domingo" },
  { num: 1, label: "Segunda" },
  { num: 2, label: "Terça" },
  { num: 3, label: "Quarta" },
  { num: 4, label: "Quinta" },
  { num: 5, label: "Sexta" },
  { num: 6, label: "Sábado" },
]
const PERIOD_PT: Record<string, string> = { morning: "de manhã", afternoon: "à tarde", evening: "à noite" }
const PERIODS: { key: "morning" | "afternoon" | "evening"; label: string }[] = [
  { key: "morning", label: "Manhã" },
  { key: "afternoon", label: "Tarde" },
  { key: "evening", label: "Noite" },
]

function waMessage(name: string, weekday: string, period: string) {
  const dia = WEEKDAY_PT[weekday] || weekday
  const per = PERIOD_PT[period] || ""
  return `Olá ${name}, tudo bem? Sou do TPE. Abriu uma vaga no grupo de ${dia} ${per} e vi que você está disponível. Podemos conversar?`
}
function waLink(phone: string, msg: string) {
  const digits = (phone || "").replace(/\D/g, "")
  return `https://wa.me/55${digits}?text=${encodeURIComponent(msg)}`
}
function availableDaysLabel(availability: AvailabilityItem[]) {
  const days = availability.filter((a) => a.morning || a.afternoon || a.evening).map((a) => WEEKDAY_ABBR[a.weekDay])
  return days.length ? days.join(", ") : "—"
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR")
}
function daysSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  return Math.max(0, Math.floor(diff / 86_400_000))
}
function initial(name: string) {
  return (name.trim().charAt(0) || "?").toUpperCase()
}

export function WaitlistPanel() {
  const [nameInput, setNameInput] = useState("")
  const [nameFilter, setNameFilter] = useState("")
  const [sex, setSex] = useState<"" | "MALE" | "FEMALE">("")
  const [congregationId, setCongregationId] = useState<number | "">("")
  const [congInput, setCongInput] = useState("")
  const [congOptions, setCongOptions] = useState<Congregation[]>([])
  const [congOpen, setCongOpen] = useState(false)
  const [groupId, setGroupId] = useState("")
  const [hasTraining, setHasTraining] = useState(false)

  const [data, setData] = useState<WaitlistResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<WaitlistCandidate | null>(null)
  const [addTarget, setAddTarget] = useState<{ candidate: WaitlistCandidate; group: WaitlistGroup } | null>(null)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [mainOpen, setMainOpen] = useState(true)
  const [additionalOpen, setAdditionalOpen] = useState(true)

  // debounce do nome
  useEffect(() => {
    const t = setTimeout(() => setNameFilter(nameInput.trim()), 400)
    return () => clearTimeout(t)
  }, [nameInput])

  // busca de congregação (AJAX, debounced)
  useEffect(() => {
    if (!congOpen) return
    const t = setTimeout(() => {
      apiClient
        .get<Congregation[]>(`/congregations?name=${encodeURIComponent(congInput)}`, { endpoint: "new" })
        .then((res) => setCongOptions(Array.isArray(res) ? res.slice(0, 30) : []))
        .catch(() => setCongOptions([]))
    }, 300)
    return () => clearTimeout(t)
  }, [congInput, congOpen])

  const query = useCallback(() => {
    const p = new URLSearchParams()
    if (nameFilter) p.set("name", nameFilter)
    if (sex) p.set("sex", sex)
    if (congregationId !== "") p.set("congregationId", String(congregationId))
    if (groupId) p.set("groupId", groupId)
    if (hasTraining) p.set("hasTraining", "true")
    return p
  }, [nameFilter, sex, congregationId, groupId, hasTraining])

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)
    apiClient
      .get<WaitlistResponse>(`/waitlist?${query().toString()}`, { endpoint: "new" })
      .then((res) => setData(res))
      .catch((e) => setError(e?.response?.data?.message || "Erro ao carregar a lista de espera"))
      .finally(() => setLoading(false))
  }, [query])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const clearFilters = () => {
    setNameInput("")
    setNameFilter("")
    setSex("")
    setCongregationId("")
    setCongInput("")
    setGroupId("")
    setHasTraining(false)
  }
  const hasFilters = nameFilter !== "" || sex !== "" || congregationId !== "" || groupId !== "" || hasTraining

  const allGroupsForSelect = useMemo(() => data?.groups ?? [], [data])
  const summary = data?.summary ?? { groupsNeedingHelp: 0, waitlistTotal: 0, bySex: { MALE: 0, FEMALE: 0 } }

  // O que vale é o máximo do grupo: abaixo dele = tem vagas. Quem tem mais vagas vem
  // primeiro; os lotados mantêm a ordem original (dia da semana / horário).
  const sortByNeed = (list: WaitlistGroup[]) =>
    [...list].sort((a, b) => b.vacancies - a.vacancies)
  const mainGroups = useMemo(() => sortByNeed((data?.groups ?? []).filter((g) => g.type === "MAIN")), [data])
  const additionalGroups = useMemo(() => sortByNeed((data?.groups ?? []).filter((g) => g.type !== "MAIN")), [data])

  const confirmAdd = async () => {
    if (!addTarget) return
    setAddingId(addTarget.candidate.participantId)
    try {
      await apiClient.patch(
        `/groups/${addTarget.group.groupId}/participants/${addTarget.candidate.participantId}`,
        {},
        { endpoint: "new" },
      )
      toast.success(`${addTarget.candidate.name} adicionado(a) ao grupo ${addTarget.group.name}`)
      setAddTarget(null)
      fetchData()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Não foi possível adicionar ao grupo")
    } finally {
      setAddingId(null)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-gray-100">
        <AlertTriangle className="h-10 w-10 text-[#EF4444] mb-3" />
        <p className="text-[#333333] font-medium">{error}</p>
      </div>
    )
  }

  const renderGroupColumn = (g: WaitlistGroup) => {
    const occupancyPct = g.configMax > 0 ? Math.min(100, (g.currentMembers / g.configMax) * 100) : 0
    return (
      <div
        key={g.groupId}
        className="w-[300px] flex-shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col max-h-[74vh]"
      >
        <div
          className={`p-3 rounded-t-xl border-b ${
            g.needsHelp ? "bg-gradient-to-r from-[#FEF2F2] to-white border-[#FCA5A5]" : "bg-gradient-to-r from-[#374192]/5 to-white border-gray-200"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm text-[#333333] truncate">{g.name}</p>
            <Badge variant={g.type === "MAIN" ? "default" : "secondary"} className="flex-shrink-0">
              {g.type === "MAIN" ? "Centro" : "Adicional"}
            </Badge>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            {WEEKDAY_PT[g.weekday]} · {g.configStartHour}–{g.configEndHour}
          </p>
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px] text-[#666666] mb-1">
              <span>
                {g.currentMembers}/{g.configMax} membros
              </span>
              {g.needsHelp && (
                <span className="text-[#B91C1C] font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {g.vacancies} {g.vacancies === 1 ? "vaga" : "vagas"}
                </span>
              )}
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${g.needsHelp ? "bg-[#EF4444]" : "bg-[#374192]"}`}
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {g.candidates.length === 0 ? (
            <p className="text-xs text-[#666666] text-center py-6">Ninguém disponível</p>
          ) : (
            g.candidates.map((c) => (
              <div
                key={c.participantId}
                className="border border-gray-100 rounded-xl p-2.5 hover:border-[#929BD2] hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${
                      c.sex === "MALE" ? "bg-[#3B82F6]" : "bg-[#EC4899]"
                    }`}
                  >
                    {initial(c.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => setSelected(c)}
                      className="text-sm font-medium text-[#374192] hover:underline text-left truncate block w-full"
                      title={c.name}
                    >
                      {c.name}
                    </button>
                    <p className="text-xs text-[#666666] truncate">{availableDaysLabel(c.availability)}</p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <a
                    href={waLink(c.phone, waMessage(c.name, g.weekday, g.period))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-[#25D366] hover:bg-[#1EBE57] rounded-lg px-2 py-1.5 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-auto py-1.5 px-2 text-xs"
                    disabled={addingId === c.participantId}
                    onClick={() => setAddTarget({ candidate: c, group: g })}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Adicionar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#181C43] to-[#374192] rounded-xl p-4 sm:p-6 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/15 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">Lista de Espera</h1>
            <p className="text-blue-100 text-xs sm:text-sm">Voluntários disponíveis, organizados por grupo</p>
          </div>
        </div>
      </div>

      {/* Resumo de necessidade */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 border-l-4 border-l-[#EF4444]">
          <div className="p-2.5 rounded-xl bg-[#FEF2F2]">
            <AlertTriangle className="h-5 w-5 text-[#B91C1C]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#333333]">{loading && !data ? "…" : summary.groupsNeedingHelp}</p>
            <p className="text-xs text-[#666666]">grupos com vagas</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 border-l-4 border-l-[#374192]">
          <div className="p-2.5 rounded-xl bg-[#374192]/10">
            <Users className="h-5 w-5 text-[#374192]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#333333]">{loading && !data ? "…" : summary.waitlistTotal}</p>
            <p className="text-xs text-[#666666]">na lista de espera</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-6 border-l-4 border-l-[#929BD2]">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
            <div>
              <p className="text-lg font-bold text-[#333333] leading-none">{loading && !data ? "…" : summary.bySex.MALE}</p>
              <p className="text-xs text-[#666666]">homens</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#EC4899]" />
            <div>
              <p className="text-lg font-bold text-[#333333] leading-none">{loading && !data ? "…" : summary.bySex.FEMALE}</p>
              <p className="text-xs text-[#666666]">mulheres</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros (AJAX) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#666666]">Nome</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#929BD2]" />
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Filtrar por nome..."
              className="h-9 w-[190px] rounded-lg border border-gray-200 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#374192]/30"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#666666]">Sexo</label>
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as "" | "MALE" | "FEMALE")}
            className="h-9 w-[130px] rounded-lg border border-gray-200 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#374192]/30"
          >
            <option value="">Todos</option>
            <option value="MALE">Masculino</option>
            <option value="FEMALE">Feminino</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 relative">
          <label className="text-xs font-medium text-[#666666]">Congregação</label>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#929BD2]" />
            <input
              value={congInput}
              onChange={(e) => {
                setCongInput(e.target.value)
                setCongregationId("")
              }}
              onFocus={() => setCongOpen(true)}
              onBlur={() => setTimeout(() => setCongOpen(false), 150)}
              placeholder="Buscar congregação..."
              className="h-9 w-[220px] rounded-lg border border-gray-200 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#374192]/30"
            />
          </div>
          {congOpen && congInput && (
            <div className="absolute z-20 top-[62px] w-[260px] max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {congOptions.length === 0 ? (
                <p className="px-3 py-2 text-xs text-[#666666]">Nenhuma congregação encontrada</p>
              ) : (
                congOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onMouseDown={() => {
                      setCongregationId(c.id)
                      setCongInput(`${c.name}${c.city ? " - " + c.city : ""}`)
                      setCongOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-[#374192]/10"
                  >
                    {c.name} {c.city ? <span className="text-xs text-[#666666]">— {c.city}</span> : null}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#666666]">Grupo</label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="h-9 w-[210px] rounded-lg border border-gray-200 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#374192]/30"
          >
            <option value="">Todos os grupos</option>
            {allGroupsForSelect.map((g) => (
              <option key={g.groupId} value={g.groupId}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 h-9 text-sm text-[#333333]">
          <Checkbox checked={hasTraining} onCheckedChange={(v) => setHasTraining(!!v)} />
          Com treinamento
        </label>
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          disabled={!hasFilters}
          className="h-9 ml-auto"
        >
          <X className="h-3.5 w-3.5" />
          Limpar filtros
        </Button>
      </div>

      {/* Kanban — dois painéis (Centro / Adicionais), cada um com quem precisa mais de gente na frente */}
      {loading && !data ? (
        <div className="text-[#666666] p-8">Carregando...</div>
      ) : !data || data.groups.length === 0 ? (
        <div className="text-[#666666] p-8">Nenhum grupo encontrado.</div>
      ) : (
        <div className="space-y-4">
          {mainGroups.length > 0 && (
            <GroupPanel
              title="Centro"
              count={mainGroups.length}
              needsHelpCount={mainGroups.filter((g) => g.needsHelp).length}
              badgeVariant="default"
              accentBorder="border-l-[#374192]"
              accentBg="bg-gradient-to-r from-[#374192]/10 via-[#374192]/5 to-white"
              open={mainOpen}
              onToggle={() => setMainOpen((v) => !v)}
            >
              {mainGroups.map(renderGroupColumn)}
            </GroupPanel>
          )}
          {additionalGroups.length > 0 && (
            <GroupPanel
              title="Adicionais"
              count={additionalGroups.length}
              needsHelpCount={additionalGroups.filter((g) => g.needsHelp).length}
              badgeVariant="secondary"
              accentBorder="border-l-[#929BD2]"
              accentBg="bg-gradient-to-r from-[#929BD2]/20 via-[#929BD2]/8 to-white"
              open={additionalOpen}
              onToggle={() => setAdditionalOpen((v) => !v)}
            >
              {additionalGroups.map(renderGroupColumn)}
            </GroupPanel>
          )}
        </div>
      )}

      <FichaModal candidate={selected} onClose={() => setSelected(null)} onSaved={fetchData} />

      {/* Confirmação de adicionar ao grupo */}
      <Dialog open={!!addTarget} onOpenChange={(open) => !open && setAddTarget(null)}>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-[#333333] font-semibold">Adicionar ao grupo</DialogTitle>
            <DialogDescription className="text-[#666666]">
              Adicionar <strong className="text-[#333333]">{addTarget?.candidate.name}</strong> ao grupo{" "}
              <strong className="text-[#333333]">{addTarget?.group.name}</strong>
              {addTarget && (
                <>
                  {" "}
                  ({WEEKDAY_PT[addTarget.group.weekday]} · {addTarget.group.configStartHour}–{addTarget.group.configEndHour})
                </>
              )}
              ? A petição da pessoa passa a ficar ativa nesse grupo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setAddTarget(null)} disabled={!!addingId}>
              Cancelar
            </Button>
            <Button onClick={confirmAdd} disabled={!!addingId} className="bg-[#374192] hover:bg-[#46607F]">
              {addingId ? "Adicionando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function GroupPanel({
  title,
  count,
  needsHelpCount,
  badgeVariant,
  accentBorder,
  accentBg,
  open,
  onToggle,
  children,
}: {
  title: string
  count: number
  needsHelpCount: number
  badgeVariant: "default" | "secondary"
  accentBorder: string
  accentBg: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden border-l-4 ${accentBorder}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 ${accentBg} hover:brightness-[0.97] transition-all text-left`}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge variant={badgeVariant} className="text-sm px-2.5 py-0.5">
            {title}
          </Badge>
          <span className="text-xs text-[#666666]">
            {count} grupo{count !== 1 ? "s" : ""}
          </span>
          {needsHelpCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold text-[#B91C1C] bg-white/70 rounded-full px-2 py-0.5">
              <AlertTriangle className="h-3 w-3" />
              {needsHelpCount} com necessidade
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-[#666666] flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#666666] flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="p-4 pt-3 overflow-x-auto border-t border-gray-100">
          <div className="flex gap-4 min-w-max">{children}</div>
        </div>
      )}
    </div>
  )
}

function FichaModal({
  candidate,
  onClose,
  onSaved,
}: {
  candidate: WaitlistCandidate | null
  onClose: () => void
  onSaved: () => void
}) {
  const [availability, setAvailability] = useState<AvailabilityItem[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (candidate) {
      const byDay = new Map(candidate.availability.map((a) => [a.weekDay, a]))
      setAvailability(
        WEEKDAY_LIST.map((w) => byDay.get(w.num) || { weekDay: w.num, morning: false, afternoon: false, evening: false }),
      )
    }
  }, [candidate])

  if (!candidate) return null

  const toggle = (weekDay: number, period: "morning" | "afternoon" | "evening") => {
    setAvailability((prev) => prev.map((a) => (a.weekDay === weekDay ? { ...a, [period]: !a[period] } : a)))
  }

  const save = async () => {
    setSaving(true)
    try {
      await apiClient.put(`/participants/${candidate.participantId}`, { availability }, { endpoint: "new" })
      toast.success("Disponibilidade atualizada")
      onSaved()
      onClose()
    } catch (e) {
      toast.error("Não foi possível salvar a disponibilidade")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!candidate} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`h-11 w-11 rounded-full flex items-center justify-center text-base font-semibold text-white flex-shrink-0 ${
                candidate.sex === "MALE" ? "bg-[#3B82F6]" : "bg-[#EC4899]"
              }`}
            >
              {initial(candidate.name)}
            </div>
            <div>
              <DialogTitle className="text-[#333333]">{candidate.name}</DialogTitle>
              <p className="text-xs text-[#666666]">{candidate.sex === "MALE" ? "Masculino" : "Feminino"}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="bg-[#F8F8F8] rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-[#333333]">
              <Phone className="h-4 w-4 text-[#929BD2] flex-shrink-0" />
              {candidate.phone}
            </div>
            <div className="flex items-center gap-2 text-[#333333]">
              <MapPin className="h-4 w-4 text-[#929BD2] flex-shrink-0" />
              {candidate.congregation
                ? `${candidate.congregation.name}${candidate.congregation.city ? " — " + candidate.congregation.city : ""}`
                : "Sem congregação cadastrada"}
            </div>
            <div className="flex items-center gap-2 text-[#333333]">
              <Clock className="h-4 w-4 text-[#929BD2] flex-shrink-0" />
              Na lista de espera desde {formatDate(candidate.waitingSince)} ({daysSince(candidate.waitingSince)} dias)
            </div>
            <div className="flex items-center gap-2 text-[#333333]">
              <GraduationCap className="h-4 w-4 text-[#929BD2] flex-shrink-0" />
              Sexo: {candidate.sex === "MALE" ? "Masculino" : "Feminino"}
            </div>
          </div>

          <div className="pt-1 border-t border-gray-100">
            <p className="font-medium text-[#333333] mb-2 pt-3">Disponibilidade</p>
            <div className="grid grid-cols-4 gap-x-2 gap-y-0.5 text-xs rounded-lg overflow-hidden">
              <span />
              {PERIODS.map((p) => (
                <span key={p.key} className="text-center font-medium text-[#666666] pb-1">
                  {p.label}
                </span>
              ))}
              {WEEKDAY_LIST.map((w, i) => {
                const item = availability.find((a) => a.weekDay === w.num)
                return (
                  <>
                    <span
                      key={`label-${w.num}`}
                      className={`text-[#333333] py-1.5 px-1 rounded-l-md ${i % 2 === 0 ? "bg-[#F8F8F8]" : ""}`}
                    >
                      {w.label}
                    </span>
                    {PERIODS.map((p, pi) => (
                      <span
                        key={`${w.num}-${p.key}`}
                        className={`flex justify-center py-1.5 ${i % 2 === 0 ? "bg-[#F8F8F8]" : ""} ${pi === PERIODS.length - 1 ? "rounded-r-md" : ""}`}
                      >
                        <Checkbox checked={!!item?.[p.key]} onCheckedChange={() => toggle(w.num, p.key)} />
                      </span>
                    ))}
                  </>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={saving} className="bg-[#374192] hover:bg-[#46607F]">
              {saving ? "Salvando..." : "Salvar disponibilidade"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
