"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, ArrowRight, Info } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { PersonHistory } from "@/types/coordination"
import { AUDIT_ACTION_LABEL, formatMonthYear, inputClass } from "@/components/coordination/labels"
import { describeAudit } from "@/components/coordination/audit-describe"

const nf2 = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const TYPE_LABEL: Record<string, string> = { MAIN: "Centro", ADDITIONAL: "Adicional", SPECIAL: "Especial" }

/**
 * Histórico de um voluntário: por onde trabalhou (estimado pelas designações, vale para o passado),
 * faltas comparadas ao normal geral e as ações registradas (exatas, desde que o histórico existe).
 */
export function PersonHistoryDialog({ participantId, name, onClose }: { participantId: string; name: string; onClose: () => void }) {
  const [months, setMonths] = useState(12)
  const [data, setData] = useState<PersonHistory | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setData(null)
    setError(null)
    apiClient
      .get<PersonHistory>(`/coordination/people/${participantId}/history?months=${months}`, { endpoint: "new" })
      .then(setData)
      .catch((e) => setError(e?.response?.data?.message || "Não foi possível carregar o histórico"))
  }, [participantId, months])

  const perDay = data?.faltas.perDay ?? null
  const normal = data?.faltas.baselinePerDay ?? 0
  const above = perDay !== null && normal > 0 && perDay > normal

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico — {name}</DialogTitle>
          <DialogDescription>Por onde passou, faltas e o que foi feito no cadastro dela.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 text-xs text-[#666666]">
          Período:
          <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className={`${inputClass} w-[130px]`}>
            <option value={6}>6 meses</option>
            <option value={12}>12 meses</option>
            <option value={24}>24 meses</option>
            <option value={36}>36 meses</option>
          </select>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4" /> {error}
          </div>
        )}
        {!data && !error && <p className="py-8 text-center text-sm text-[#666666]">Carregando…</p>}

        {data && (
          <div className="space-y-5">
            {/* Resumo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-2xl font-bold text-[#333333] leading-none">{data.distinctGroups}</p>
                <p className="text-[11px] text-[#666666] mt-1">grupos em que trabalhou</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-2xl font-bold text-[#333333] leading-none">{data.estimatedDepartures}</p>
                <p className="text-[11px] text-[#666666] mt-1">saídas estimadas de grupo</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-2xl font-bold text-[#333333] leading-none">
                  {data.faltas.total}
                  <span className="text-sm font-medium text-[#666666]"> / {data.faltas.daysWorked}</span>
                </p>
                <p className="text-[11px] text-[#666666] mt-1">faltas / dias</p>
              </div>
              <div className={`rounded-lg border p-3 ${above ? "border-[#FCA5A5] bg-[#FEF2F2]" : "border-gray-100"}`}>
                <p className={`text-2xl font-bold leading-none ${above ? "text-[#B91C1C]" : "text-[#333333]"}`}>{perDay === null ? "—" : nf2(perDay)}</p>
                <p className="text-[11px] text-[#666666] mt-1">
                  faltas por dia · normal {nf2(normal)}
                </p>
              </div>
            </div>

            {/* Por onde trabalhou */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-[#333333]">Por onde trabalhou</h3>
              {data.groupsWorked.length === 0 ? (
                <p className="text-sm text-[#666666]">Sem designações no período.</p>
              ) : (
                <div className="rounded-lg border border-gray-100 overflow-hidden">
                  {data.groupsWorked.map((g) => (
                    <div key={g.groupId} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-gray-50 last:border-0 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant={g.type === "MAIN" ? "default" : "secondary"}>{TYPE_LABEL[g.type] ?? g.type}</Badge>
                        <span className="font-medium text-[#333333] truncate">{g.name}</span>
                        {data.currentGroups.some((c) => c.groupId === g.groupId) && <span className="text-[11px] text-[#047857]">· está hoje</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#666666]">
                        <span className="inline-flex items-center gap-1">
                          {formatMonthYear(g.firstAt)} <ArrowRight className="h-3 w-3" /> {formatMonthYear(g.lastAt)}
                        </span>
                        <span>{g.designations} dias</span>
                        <span className={g.faltas > 0 ? "text-[#B91C1C] font-medium" : ""}>{g.faltas} faltas</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="flex items-start gap-1.5 text-[11px] text-[#666666]">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                Estimado pelas designações em que a pessoa esteve escalada ou faltou: o sistema não guarda a data de entrada e saída de grupo. "Saída estimada" =
                parou de aparecer num grupo há mais de 45 dias enquanto seguia em outro.
              </p>
            </section>

            {/* Ações registradas */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-[#333333]">Ações registradas</h3>
              {data.events.length === 0 ? (
                <p className="text-sm text-[#666666]">
                  Nenhuma ação registrada ainda{data.eventsSince ? ` (o registro existe desde ${new Date(data.eventsSince).toLocaleDateString("pt-BR")})` : ""}.
                </p>
              ) : (
                <ul className="rounded-lg border border-gray-100 divide-y divide-gray-50">
                  {data.events.map((e) => (
                    <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                      <span className="flex items-center gap-2 min-w-0">
                        <Badge variant="secondary">{AUDIT_ACTION_LABEL[e.action] ?? e.action}</Badge>
                        <span className="text-[#666666] truncate">{describeAudit(e)}</span>
                      </span>
                      <span className="text-[11px] text-[#666666] whitespace-nowrap">
                        {new Date(e.at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                        {e.actorName ? ` · ${e.actorName}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {data.eventsSince && data.events.length > 0 && (
                <p className="text-[11px] text-[#666666]">Ações exatas registradas desde {new Date(data.eventsSince).toLocaleDateString("pt-BR")}.</p>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
