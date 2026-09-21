"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, ArrowRight, Info } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import type { TurnoverItem, TurnoverResponse } from "@/types/coordination"
import { formatMonthYear, inputClass } from "@/components/coordination/labels"
import { PersonHistoryDialog } from "@/components/coordination/person-history-dialog"

const nf2 = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * Rotatividade: quem passou por mais de um grupo e como estão as faltas — pra enxergar quem fica
 * trocando de grupo e faltando demais. Estimado pelas designações (vale para o passado).
 */
export function TurnoverTab() {
  const [months, setMonths] = useState(12)
  const [onlyMovers, setOnlyMovers] = useState(false)
  const [data, setData] = useState<TurnoverResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<TurnoverItem | null>(null)

  useEffect(() => {
    setData(null)
    setError(null)
    apiClient
      .get<TurnoverResponse>(`/coordination/turnover?months=${months}&minGroups=2`, { endpoint: "new" })
      .then(setData)
      .catch((e) => setError(e?.response?.data?.message || "Não foi possível carregar a rotatividade"))
  }, [months])

  const items = (data?.items ?? []).filter((i) => !onlyMovers || i.estimatedDepartures > 0)
  const attention = items.filter((i) => i.attention).length

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-[#929BD2]/60 bg-[#374192]/5 p-3 sm:p-4 text-sm text-[#333333]">
        <Info className="h-4 w-4 mt-0.5 text-[#374192] flex-shrink-0" />
        <p>
          Quem trabalhou em <strong>mais de um grupo</strong> no período. O sistema não guarda a data de entrada e saída de grupo, então isto é <strong>estimado
          pelas designações</strong>: "saída estimada" é um grupo que a pessoa deixou de frequentar há mais de 45 dias enquanto seguia em outro. As trocas
          feitas pelo sistema (exatas) só passam a existir desde que o histórico de ações começou.{" "}
          {data && (
            <>
              O normal geral é <strong>{nf2(data.baselinePerDay)}</strong> faltas por dia; <strong>Atenção</strong> = trocou de grupo e falta {Math.round((data.attentionFactor - 1) * 100)}% acima disso.
            </>
          )}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#666666]">Período</label>
          <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className={`${inputClass} w-[150px]`}>
            <option value={6}>Últimos 6 meses</option>
            <option value={12}>Últimos 12 meses</option>
            <option value={24}>Últimos 24 meses</option>
          </select>
        </div>
        <label className="flex items-center gap-2 h-9 text-sm text-[#333333]">
          <input type="checkbox" checked={onlyMovers} onChange={(e) => setOnlyMovers(e.target.checked)} />
          Só quem deixou algum grupo
        </label>
        {data && (
          <p className="text-xs text-[#666666] ml-auto">
            {items.length} {items.length === 1 ? "pessoa" : "pessoas"}
            {attention > 0 ? ` · ${attention} pedindo atenção` : ""}
          </p>
        )}
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-lg border border-gray-100">
          <AlertTriangle className="h-8 w-8 text-[#EF4444] mb-2" />
          <p className="text-sm text-[#333333] font-medium">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-[#666666]">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">Voluntário</th>
                  <th className="text-left font-medium px-4 py-2.5">Por onde passou</th>
                  <th className="text-right font-medium px-4 py-2.5 whitespace-nowrap">Saídas est.</th>
                  <th className="text-right font-medium px-4 py-2.5 whitespace-nowrap">Trocas reg.</th>
                  <th className="text-right font-medium px-4 py-2.5 whitespace-nowrap">Faltas / dias</th>
                  <th className="text-right font-medium px-4 py-2.5 whitespace-nowrap">Faltas por dia</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.participantId} onClick={() => setSelected(i)} className="border-t border-gray-50 hover:bg-gray-50/70 cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-[#333333]">{i.name}</span>
                        {i.attention && <Badge className="bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5] hover:bg-[#FEF2F2]">Atenção</Badge>}
                      </div>
                      <p className="text-[11px] text-[#666666] mt-0.5">hoje: {i.currentGroups.join(", ") || "sem grupo"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {i.groupsWorked.map((g) => (
                          <span key={g.groupId} className="inline-flex items-center gap-1.5 text-xs text-[#333333]">
                            <span className="font-medium">{g.name.replace("[TESTE] ", "")}</span>
                            <span className="text-[#666666] inline-flex items-center gap-1">
                              {formatMonthYear(g.firstAt)} <ArrowRight className="h-3 w-3" /> {formatMonthYear(g.lastAt)}
                            </span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#333333]">{i.estimatedDepartures}</td>
                    <td className="px-4 py-3 text-right text-[#666666]">{i.registeredMoves}</td>
                    <td className="px-4 py-3 text-right text-[#666666]">
                      {i.faltas} / {i.daysWorked}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${i.attention ? "text-[#B91C1C]" : "text-[#333333]"}`}>{i.faltasPerDay === null ? "—" : nf2(i.faltasPerDay)}</td>
                  </tr>
                ))}
                {data && items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-[#666666]">
                      Ninguém passou por mais de um grupo neste período{onlyMovers ? " (com saída estimada)" : ""}.
                    </td>
                  </tr>
                )}
                {!data && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-[#666666]">
                      Carregando…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && <PersonHistoryDialog participantId={selected.participantId} name={selected.name} onClose={() => setSelected(null)} />}
    </div>
  )
}
