"use client"

import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Coffee, SprayCan, Trash2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"

type Task = "CAFE" | "LIMPEZA"
type Weekday = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY"

interface SupplyMonth {
  month: number
  weekday: Weekday | null
  morning: Task | null
  afternoon: Task | null
  groups: { groupId: string; name: string; startHour: string; period: "MORNING" | "AFTERNOON"; task: Task }[]
}
interface SupplyResponse {
  year: number
  weekdaysWithGroups: Weekday[]
  months: SupplyMonth[]
}

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
const DAYS: { value: Weekday; label: string }[] = [
  { value: "MONDAY", label: "Segunda" },
  { value: "TUESDAY", label: "Terça" },
  { value: "WEDNESDAY", label: "Quarta" },
  { value: "THURSDAY", label: "Quinta" },
  { value: "FRIDAY", label: "Sexta" },
  { value: "SATURDAY", label: "Sábado" },
]
const TASK_LABEL: Record<Task, string> = { CAFE: "Café", LIMPEZA: "Limpeza" }
const selectClass = "h-9 rounded-md border border-gray-200 bg-white px-2 text-sm text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#374192]/30"

/** Quadro oficial de 2026 (planilha), seguindo a regra: ao passar do sábado volta na segunda e inverte (agosto em diante: manhã = limpeza). Janeiro em diante o gerador continua. */
const QUADRO_2026: { month: number; weekday: Weekday; morning: Task }[] = [
  { month: 2, weekday: "MONDAY", morning: "CAFE" },
  { month: 3, weekday: "TUESDAY", morning: "CAFE" },
  { month: 4, weekday: "WEDNESDAY", morning: "CAFE" },
  { month: 5, weekday: "THURSDAY", morning: "CAFE" },
  { month: 6, weekday: "FRIDAY", morning: "CAFE" },
  { month: 7, weekday: "SATURDAY", morning: "CAFE" },
  { month: 8, weekday: "MONDAY", morning: "LIMPEZA" },
  { month: 9, weekday: "TUESDAY", morning: "LIMPEZA" },
  { month: 10, weekday: "WEDNESDAY", morning: "LIMPEZA" },
  { month: 11, weekday: "THURSDAY", morning: "LIMPEZA" },
  { month: 12, weekday: "FRIDAY", morning: "LIMPEZA" },
]

export function SupplyTab() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [data, setData] = useState<SupplyResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1)
  const [genDay, setGenDay] = useState<Weekday>("MONDAY")
  const [genMorning, setGenMorning] = useState<Task>("CAFE")
  const [genCount, setGenCount] = useState(6)

  const load = useCallback(() => {
    setError(null)
    apiClient
      .get<SupplyResponse>(`/coordination/supply?year=${year}`)
      .then(setData)
      .catch((e) => setError(e?.response?.data?.message || "Não foi possível carregar o rodízio"))
  }, [year])
  useEffect(load, [load])

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true)
    try {
      await fn()
      toast.success(ok)
      load()
    } catch (e: any) {
      const m = e?.response?.data?.message
      toast.error(Array.isArray(m) ? m.join(", ") : m || "Não foi possível salvar")
    } finally {
      setBusy(false)
    }
  }

  const setMonth = (month: number, weekday: Weekday, morning: Task) =>
    run(() => apiClient.put("/coordination/supply", { year, month, weekday, morning }), `${MONTHS[month - 1]} salvo`)

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-[#333333]">Rodízio de café e limpeza (grupos do Centro)</h3>
          <p className="text-xs text-[#666666] mt-1">
            Em cada mês, um dia da semana: o grupo da manhã e o da tarde desse dia dividem café e limpeza. Ao passar do sábado volta na segunda e inverte. O aviso aparece como faixa vermelha nas telas de
            designação e entra na mensagem do WhatsApp só desse grupo.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-1">
            <span className="block text-xs font-medium text-[#666666]">Ano</span>
            <select className={selectClass} value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[year - 1, year, year + 1].filter((v, i, a) => a.indexOf(v) === i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() =>
              run(
                () => apiClient.put("/coordination/supply/bulk", { months: QUADRO_2026.map((m) => ({ year: 2026, ...m })) }),
                "Quadro de 2026 (fev a dez) carregado",
              )
            }
          >
            Carregar quadro 2026 (fev–dez)
          </Button>
        </div>
        <div className="flex flex-wrap items-end gap-3 border-t border-gray-100 pt-3">
          <span className="text-xs font-medium text-[#666666] pb-2">Gerar a sequência:</span>
          <label className="space-y-1">
            <span className="block text-xs text-[#666666]">A partir de</span>
            <select className={selectClass} value={genMonth} onChange={(e) => setGenMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-xs text-[#666666]">Dia</span>
            <select className={selectClass} value={genDay} onChange={(e) => setGenDay(e.target.value as Weekday)}>
              {DAYS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-xs text-[#666666]">Manhã cuida de</span>
            <select className={selectClass} value={genMorning} onChange={(e) => setGenMorning(e.target.value as Task)}>
              <option value="CAFE">Café</option>
              <option value="LIMPEZA">Limpeza</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-xs text-[#666666]">Meses</span>
            <input type="number" min={1} max={24} className={`${selectClass} w-20`} value={genCount} onChange={(e) => setGenCount(Math.max(1, Math.min(24, Number(e.target.value) || 1)))} />
          </label>
          <Button
            size="sm"
            disabled={busy}
            className="bg-[#374192] hover:bg-[#46607F]"
            onClick={() => run(() => apiClient.put("/coordination/supply/generate", { year, month: genMonth, count: genCount, weekday: genDay, morning: genMorning }), "Sequência gerada")}
          >
            Gerar
          </Button>
          <p className="basis-full text-xs text-[#666666]">Sobrescreve os meses gerados. Depois dá para ajustar cada mês à mão na lista abaixo.</p>
        </div>
      </div>

      {error && <p className="text-sm text-[#B91C1C]">{error}</p>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-50" data-testid="supply-list">
          {data?.months.map((m) => (
            <li key={m.month} className="flex flex-wrap items-center gap-3 px-4 py-3" data-testid={`supply-month-${m.month}`}>
              <span className="w-24 text-sm font-medium text-[#333333]">{MONTHS[m.month - 1]}</span>
              <select
                aria-label={`Dia de ${MONTHS[m.month - 1]}`}
                className={selectClass}
                disabled={busy}
                value={m.weekday ?? ""}
                onChange={(e) => (e.target.value ? setMonth(m.month, e.target.value as Weekday, m.morning ?? "CAFE") : undefined)}
              >
                <option value="">— sem rodízio —</option>
                {DAYS.filter((d) => !data.weekdaysWithGroups.length || data.weekdaysWithGroups.includes(d.value) || d.value === m.weekday).map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              {m.weekday && (
                <>
                  <select
                    aria-label={`Manhã de ${MONTHS[m.month - 1]}`}
                    className={selectClass}
                    disabled={busy}
                    value={m.morning ?? "CAFE"}
                    onChange={(e) => setMonth(m.month, m.weekday as Weekday, e.target.value as Task)}
                  >
                    <option value="CAFE">Manhã: Café · Tarde: Limpeza</option>
                    <option value="LIMPEZA">Manhã: Limpeza · Tarde: Café</option>
                  </select>
                  <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#666666]">
                    {m.groups.map((g) => (
                      <span key={g.groupId} className="inline-flex items-center gap-1">
                        {g.task === "CAFE" ? <Coffee className="h-3 w-3" /> : <SprayCan className="h-3 w-3" />}
                        {g.name} ({TASK_LABEL[g.task]})
                      </span>
                    ))}
                  </span>
                  <button
                    type="button"
                    title="Tirar este mês do rodízio"
                    disabled={busy}
                    className="ml-auto text-[#666666] hover:text-[#B91C1C]"
                    onClick={() => run(() => apiClient.delete(`/coordination/supply/${year}/${m.month}`), `${MONTHS[m.month - 1]} removido`)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </li>
          ))}
          {!data && !error && <li className="px-4 py-8 text-center text-sm text-[#666666]">Carregando…</li>}
        </ul>
      </div>
    </div>
  )
}
