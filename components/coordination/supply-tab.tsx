"use client"

import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { ChevronDown, Coffee, ShoppingCart, Sparkles, Trash2 } from "lucide-react"
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
  cleaningGroupId?: string | null
  cleaningGroupName?: string | null
}
interface CenterGroup {
  groupId: string
  name: string
  weekday: Weekday
  startHour: string
  period: "MORNING" | "AFTERNOON"
}
interface SupplyResponse {
  year: number
  weekdaysWithGroups: Weekday[]
  centerGroups?: CenterGroup[]
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
const BUY_LABEL: Record<Task, string> = { CAFE: "itens do café", LIMPEZA: "produtos de limpeza" }
const selectClass = "h-9 rounded-md border border-gray-200 bg-white px-2 text-sm text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#374192]/30 disabled:opacity-60"

/** Quadro oficial de 2026 (compras), seguindo a regra: ao passar do sábado volta na segunda e inverte (agosto em diante: manhã = produtos de limpeza). */
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

// os grupos do Centro já têm nome de dia + período (ex.: "Quarta-feira (Manhã)"); a lista vem na ordem do rodízio
const groupLabel = (g: CenterGroup) => g.name

export function SupplyTab() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [data, setData] = useState<SupplyResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [showAuto, setShowAuto] = useState(false)
  // preencher automaticamente: compras
  const [genMonth, setGenMonth] = useState(today.getMonth() + 1)
  const [genDay, setGenDay] = useState<Weekday>("MONDAY")
  const [genMorning, setGenMorning] = useState<Task>("CAFE")
  const [genCount, setGenCount] = useState(6)
  // preencher automaticamente: limpeza da sala
  const [clMonth, setClMonth] = useState(today.getMonth() + 1)
  const [clGroup, setClGroup] = useState("")
  const [clCount, setClCount] = useState(6)

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

  const setPurchase = (month: number, weekday: Weekday, morning: Task) =>
    run(() => apiClient.put("/coordination/supply", { year, month, weekday, morning }), `Compras de ${MONTHS[month - 1]} salvas`)
  const setCleaning = (month: number, groupId: string) =>
    run(() => apiClient.put("/coordination/supply/cleaning", { year, month, groupId: groupId || null }), `Limpeza da sala de ${MONTHS[month - 1]} salva`)

  const centerGroups = data?.centerGroups ?? []
  const curKey = today.getFullYear() * 12 + today.getMonth() // mês atual (0-based)

  return (
    <div className="space-y-5">
      {/* Como funciona */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#333333]">Café e limpeza (grupos do Centro)</h3>
            <p className="text-xs text-[#666666] mt-1">O grupo da vez vê uma faixa vermelha nas telas de designação e uma linha na mensagem do WhatsApp. No mês anterior, aparece uma faixa amarela avisando.</p>
          </div>
          <label className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#666666]">Ano</span>
            <select className={selectClass} value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-[#F5F6FB] p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-[#374192]">
              <ShoppingCart className="h-4 w-4" /> Compras
            </p>
            <p className="mt-1 text-xs text-[#555555]">
              Um dia da semana por mês. O grupo da manhã e o da tarde desse dia dividem: um compra os <strong>itens do café</strong>, o outro os <strong>produtos de limpeza</strong>.
              Anda um dia por mês; depois do sábado volta à segunda e troca quem compra o quê.
            </p>
          </div>
          <div className="rounded-lg bg-[#F5F6FB] p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-[#374192]">
              <Sparkles className="h-4 w-4" /> Limpeza da sala
            </p>
            <p className="mt-1 text-xs text-[#555555]">
              Um grupo (dia e período) por mês limpa a sala. Passa para o grupo seguinte a cada mês (ex.: Quarta manhã em novembro, Quarta tarde em dezembro).
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-[#B91C1C]">{error}</p>}

      {/* Quadro do ano */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm" data-testid="supply-list">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-[#666666]">
              <th className="px-4 py-2 font-medium">Mês</th>
              <th className="px-4 py-2 font-medium">
                <span className="inline-flex items-center gap-1">
                  <ShoppingCart className="h-3.5 w-3.5" /> Compras
                </span>
              </th>
              <th className="px-4 py-2 font-medium">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Limpeza da sala
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data?.months.map((m) => {
              const key = year * 12 + (m.month - 1)
              const tag = key === curKey ? "Este mês" : key === curKey + 1 ? "Próximo" : null
              return (
                <tr key={m.month} data-testid={`supply-month-${m.month}`} className={tag === "Este mês" ? "bg-red-50/60" : tag === "Próximo" ? "bg-amber-50/70" : ""}>
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-[#333333]">{MONTHS[m.month - 1]}</div>
                    {tag && (
                      <span className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${tag === "Este mês" ? "bg-[#DC2626] text-white" : "bg-amber-300 text-amber-950"}`}>{tag}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        aria-label={`Dia das compras de ${MONTHS[m.month - 1]}`}
                        className={selectClass}
                        disabled={busy}
                        value={m.weekday ?? ""}
                        onChange={(e) => (e.target.value ? setPurchase(m.month, e.target.value as Weekday, m.morning ?? "CAFE") : undefined)}
                      >
                        <option value="">— ninguém —</option>
                        {DAYS.filter((d) => !data.weekdaysWithGroups.length || data.weekdaysWithGroups.includes(d.value) || d.value === m.weekday).map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                      {m.weekday && (
                        <>
                          <select
                            aria-label={`Quem compra o quê em ${MONTHS[m.month - 1]}`}
                            className={selectClass}
                            disabled={busy}
                            value={m.morning ?? "CAFE"}
                            onChange={(e) => setPurchase(m.month, m.weekday as Weekday, e.target.value as Task)}
                          >
                            <option value="CAFE">Manhã: café · Tarde: limpeza</option>
                            <option value="LIMPEZA">Manhã: limpeza · Tarde: café</option>
                          </select>
                          <button
                            type="button"
                            title="Tirar as compras deste mês"
                            disabled={busy}
                            className="text-[#999999] hover:text-[#B91C1C]"
                            onClick={() => run(() => apiClient.delete(`/coordination/supply/${year}/${m.month}`), `Compras de ${MONTHS[m.month - 1]} removidas`)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                    {m.groups.length > 0 && (
                      <div className="mt-1.5 flex flex-col gap-0.5 text-xs text-[#666666]">
                        {m.groups.map((g) => (
                          <span key={g.groupId} className="inline-flex items-center gap-1">
                            {g.task === "CAFE" ? <Coffee className="h-3 w-3" /> : <ShoppingCart className="h-3 w-3" />}
                            {g.name}: compra os {BUY_LABEL[g.task]}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <select
                      aria-label={`Limpeza da sala em ${MONTHS[m.month - 1]}`}
                      className={`${selectClass} max-w-[260px]`}
                      disabled={busy || !centerGroups.length}
                      value={m.cleaningGroupId ?? ""}
                      onChange={(e) => setCleaning(m.month, e.target.value)}
                    >
                      <option value="">— ninguém —</option>
                      {centerGroups.map((g) => (
                        <option key={g.groupId} value={g.groupId}>
                          {groupLabel(g)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              )
            })}
            {!data && !error && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-[#666666]">
                  Carregando…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Preencher vários meses de uma vez */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <button type="button" onClick={() => setShowAuto((v) => !v)} aria-expanded={showAuto} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[#333333]">
          Preencher vários meses de uma vez
          <ChevronDown className={`h-4 w-4 transition-transform ${showAuto ? "rotate-180" : ""}`} />
        </button>
        {showAuto && (
          <div className="space-y-4 border-t border-gray-100 px-4 py-4">
            <div className="flex flex-wrap items-end gap-3">
              <span className="w-full flex items-center gap-1.5 text-xs font-semibold text-[#374192]">
                <ShoppingCart className="h-3.5 w-3.5" /> Compras
              </span>
              <label className="space-y-1">
                <span className="block text-xs text-[#666666]">Começa em</span>
                <select className={selectClass} value={genMonth} onChange={(e) => setGenMonth(Number(e.target.value))}>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}/{year}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="block text-xs text-[#666666]">Com o dia</span>
                <select className={selectClass} value={genDay} onChange={(e) => setGenDay(e.target.value as Weekday)}>
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="block text-xs text-[#666666]">A manhã compra</span>
                <select className={selectClass} value={genMorning} onChange={(e) => setGenMorning(e.target.value as Task)}>
                  <option value="CAFE">Itens do café</option>
                  <option value="LIMPEZA">Produtos de limpeza</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="block text-xs text-[#666666]">Quantos meses</span>
                <input type="number" min={1} max={24} className={`${selectClass} w-20`} value={genCount} onChange={(e) => setGenCount(Math.max(1, Math.min(24, Number(e.target.value) || 1)))} />
              </label>
              <Button
                size="sm"
                disabled={busy}
                className="bg-[#374192] hover:bg-[#46607F]"
                onClick={() => run(() => apiClient.put("/coordination/supply/generate", { year, month: genMonth, count: genCount, weekday: genDay, morning: genMorning }), "Compras preenchidas")}
              >
                Preencher compras
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => run(() => apiClient.put("/coordination/supply/bulk", { months: QUADRO_2026.map((m) => ({ year: 2026, ...m })) }), "Quadro de 2026 (fev a dez) carregado")}
              >
                Usar o quadro de 2026
              </Button>
            </div>

            <div className="flex flex-wrap items-end gap-3 border-t border-gray-100 pt-4">
              <span className="w-full flex items-center gap-1.5 text-xs font-semibold text-[#374192]">
                <Sparkles className="h-3.5 w-3.5" /> Limpeza da sala
              </span>
              <label className="space-y-1">
                <span className="block text-xs text-[#666666]">Começa em</span>
                <select className={selectClass} value={clMonth} onChange={(e) => setClMonth(Number(e.target.value))}>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}/{year}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="block text-xs text-[#666666]">Com o grupo</span>
                <select className={`${selectClass} max-w-[260px]`} value={clGroup} onChange={(e) => setClGroup(e.target.value)}>
                  <option value="">Escolha…</option>
                  {centerGroups.map((g) => (
                    <option key={g.groupId} value={g.groupId}>
                      {groupLabel(g)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="block text-xs text-[#666666]">Quantos meses</span>
                <input type="number" min={1} max={24} className={`${selectClass} w-20`} value={clCount} onChange={(e) => setClCount(Math.max(1, Math.min(24, Number(e.target.value) || 1)))} />
              </label>
              <Button
                size="sm"
                disabled={busy || !clGroup}
                className="bg-[#374192] hover:bg-[#46607F]"
                onClick={() => run(() => apiClient.put("/coordination/supply/cleaning/generate", { year, month: clMonth, count: clCount, groupId: clGroup }), "Limpeza da sala preenchida")}
              >
                Preencher limpeza da sala
              </Button>
            </div>
            <p className="text-xs text-[#666666]">Preencher sobrescreve os meses escolhidos. Depois dá para trocar qualquer mês na tabela acima.</p>
          </div>
        )}
      </div>
    </div>
  )
}
