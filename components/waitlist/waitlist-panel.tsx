"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  Users,
  Phone,
  MessageCircle,
  X,
  AlertTriangle,
  GraduationCap,
  MapPin,
  Clock,
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

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

export function WaitlistPanel() {
  const [nameInput, setNameInput] = useState("")
  const [nameFilter, setNameFilter] = useState("")
  const [sex, setSex] = useState<"" | "MALE" | "FEMALE">("")
  const [congregationId, setCongregationId] = useState<number | "">("")
  const [congInput, setCongInput] = useState("")
  const [congOptions, setCongOptions] = useState<Congregation[]>([])
  const [congOpen, setCongOpen] = useState(false)
  const [groupId, setGroupId] = useState("")
  const [trainingValid, setTrainingValid] = useState(false)

  const [data, setData] = useState<WaitlistResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<WaitlistCandidate | null>(null)

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
    if (trainingValid) p.set("trainingValid", "true")
    return p
  }, [nameFilter, sex, congregationId, groupId, trainingValid])

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
    setTrainingValid(false)
  }
  const hasFilters = nameFilter !== "" || sex !== "" || congregationId !== "" || groupId !== "" || trainingValid

  const allGroupsForSelect = useMemo(() => data?.groups ?? [], [data])
  const summary = data?.summary ?? { groupsNeedingHelp: 0, waitlistTotal: 0, bySex: { MALE: 0, FEMALE: 0 } }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-gray-100">
        <AlertTriangle className="h-10 w-10 text-[#EF4444] mb-3" />
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
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">Lista de Espera</h1>
            <p className="text-blue-100 text-xs sm:text-sm">
              Voluntários disponíveis, organizados por grupo
            </p>
          </div>
        </div>
      </div>

      {/* Resumo de necessidade */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#FEF2F2]">
            <AlertTriangle className="h-5 w-5 text-[#B91C1C]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#333333]">{loading && !data ? "…" : summary.groupsNeedingHelp}</p>
            <p className="text-xs text-[#666666]">grupos abaixo do mínimo</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#374192]/10">
            <Users className="h-5 w-5 text-[#374192]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#333333]">{loading && !data ? "…" : summary.waitlistTotal}</p>
            <p className="text-xs text-[#666666]">na lista de espera</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex items-center gap-6">
          <div>
            <p className="text-lg font-bold text-[#333333]">{loading && !data ? "…" : summary.bySex.MALE}</p>
            <p className="text-xs text-[#666666]">homens</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#333333]">{loading && !data ? "…" : summary.bySex.FEMALE}</p>
            <p className="text-xs text-[#666666]">mulheres</p>
          </div>
        </div>
      </div>

      {/* Filtros (AJAX) */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#666666]">Nome</label>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Filtrar por nome..."
            className="h-9 w-[190px] rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#374192]/30"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#666666]">Sexo</label>
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as "" | "MALE" | "FEMALE")}
            className="h-9 w-[130px] rounded-md border border-gray-200 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#374192]/30"
          >
            <option value="">Todos</option>
            <option value="MALE">Masculino</option>
            <option value="FEMALE">Feminino</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 relative">
          <label className="text-xs font-medium text-[#666666]">Congregação</label>
          <input
            value={congregationId !== "" ? congInput : congInput}
            onChange={(e) => {
              setCongInput(e.target.value)
              setCongregationId("")
            }}
            onFocus={() => setCongOpen(true)}
            onBlur={() => setTimeout(() => setCongOpen(false), 150)}
            placeholder="Buscar congregação..."
            className="h-9 w-[220px] rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#374192]/30"
          />
          {congOpen && congInput && (
            <div className="absolute z-20 top-[62px] w-[260px] max-h-56 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
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
            className="h-9 w-[210px] rounded-md border border-gray-200 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#374192]/30"
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
          <Checkbox checked={trainingValid} onCheckedChange={(v) => setTrainingValid(!!v)} />
          Treinamento válido
        </label>
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

      {/* Kanban */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max">
          {loading && !data ? (
            <div className="text-[#666666] p-8">Carregando...</div>
          ) : !data || data.groups.length === 0 ? (
            <div className="text-[#666666] p-8">Nenhum grupo encontrado.</div>
          ) : (
            data.groups.map((g) => (
              <div key={g.groupId} className="w-[300px] flex-shrink-0 bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col max-h-[70vh]">
                <div className={`p-3 rounded-t-lg border-b ${g.needsHelp ? "bg-[#FEF2F2] border-[#FCA5A5]" : "bg-gray-50 border-gray-200"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-[#333333]">{g.name}</p>
                      <p className="text-xs text-[#666666]">
                        {WEEKDAY_PT[g.weekday]} · {g.configStartHour}–{g.configEndHour} ·{" "}
                        {g.type === "MAIN" ? "Centro" : g.type === "ADDITIONAL" ? "Adicional" : "Especial"}
                      </p>
                    </div>
                    {g.needsHelp && <AlertTriangle className="h-4 w-4 text-[#B91C1C] flex-shrink-0 mt-0.5" />}
                  </div>
                  <p className={`text-xs mt-1 font-medium ${g.needsHelp ? "text-[#B91C1C]" : "text-[#666666]"}`}>
                    {g.currentMembers}/{g.configMax} membros (mín. {g.configMin})
                    {g.needsHelp && " · abaixo do mínimo"}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {g.candidates.length === 0 ? (
                    <p className="text-xs text-[#666666] text-center py-6">Ninguém disponível</p>
                  ) : (
                    g.candidates.map((c) => (
                      <div key={c.participantId} className="border border-gray-100 rounded-lg p-2.5 hover:border-[#929BD2] transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelected(c)}
                            className="text-sm font-medium text-[#374192] hover:underline text-left truncate"
                            title={c.name}
                          >
                            {c.name}
                          </button>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              c.sex === "MALE" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
                            }`}
                          >
                            {c.sex === "MALE" ? "M" : "F"}
                          </span>
                        </div>
                        <p className="text-xs text-[#666666] mt-0.5">{availableDaysLabel(c.availability)}</p>
                        <a
                          href={waLink(c.phone, waMessage(c.name, g.weekday, g.period))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#25D366] hover:bg-[#1EBE57] rounded-md px-2.5 py-1.5 transition-colors"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <FichaModal candidate={selected} onClose={() => setSelected(null)} onSaved={fetchData} />
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
      // garante as 7 linhas mesmo se a pessoa nunca marcou algum dia
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
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{candidate.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-[#333333]">
            <Phone className="h-4 w-4 text-[#929BD2]" />
            {candidate.phone}
          </div>
          <div className="flex items-center gap-2 text-[#333333]">
            <MapPin className="h-4 w-4 text-[#929BD2]" />
            {candidate.congregation ? `${candidate.congregation.name}${candidate.congregation.city ? " — " + candidate.congregation.city : ""}` : "Sem congregação cadastrada"}
          </div>
          <div className="flex items-center gap-2 text-[#333333]">
            <Clock className="h-4 w-4 text-[#929BD2]" />
            Na lista de espera desde {formatDate(candidate.waitingSince)} ({daysSince(candidate.waitingSince)} dias)
          </div>
          <div className="flex items-center gap-2 text-[#333333]">
            <GraduationCap className="h-4 w-4 text-[#929BD2]" />
            Sexo: {candidate.sex === "MALE" ? "Masculino" : "Feminino"}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="font-medium text-[#333333] mb-2">Disponibilidade</p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <span />
              {PERIODS.map((p) => (
                <span key={p.key} className="text-center font-medium text-[#666666]">
                  {p.label}
                </span>
              ))}
              {WEEKDAY_LIST.map((w) => {
                const item = availability.find((a) => a.weekDay === w.num)
                return (
                  <>
                    <span key={`label-${w.num}`} className="text-[#333333] py-1">
                      {w.label}
                    </span>
                    {PERIODS.map((p) => (
                      <span key={`${w.num}-${p.key}`} className="flex justify-center py-1">
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
