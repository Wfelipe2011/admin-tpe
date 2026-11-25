"use client"

import { useEffect, useState } from "react"
import { CalendarClock, Coffee, SprayCan } from "lucide-react"
import { apiClient } from "@/lib/api-client"

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]

type Duty = { task: "CAFE" | "LIMPEZA"; label: string; month: number; year?: number }

/**
 * Faixa vermelha: "neste mês o seu grupo cuida do café / da limpeza" (mês da designação).
 * Faixa amarela: "no próximo mês (mês X) o seu grupo vai cuidar do café / da limpeza", para o grupo da vez seguinte.
 * Só grupos do Centro no dia da semana sorteado; para os demais não renderiza nada (nem ocupa espaço).
 */
export function SupplyBanner({ designationId, className = "" }: { designationId?: string | null; className?: string }) {
  const [duty, setDuty] = useState<Duty | null>(null)
  const [next, setNext] = useState<Duty | null>(null)

  useEffect(() => {
    if (!designationId) return
    let alive = true
    apiClient
      .get<{ duty: Duty | null; next?: Duty | null }>(`/designations/${designationId}/supply-duty`)
      .then((r) => {
        if (!alive) return
        setDuty(r?.duty ?? null)
        setNext(r?.next ?? null)
      })
      .catch(() => {
        // faixa é só um aviso: se falhar, a tela segue normal
        if (!alive) return
        setDuty(null)
        setNext(null)
      })
    return () => {
      alive = false
    }
  }, [designationId])

  if (!duty && !next) return null
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {duty && (
        <div role="status" data-testid="supply-banner" className="flex items-center gap-3 rounded-lg bg-[#DC2626] px-4 py-3 text-white shadow-sm">
          {duty.task === "CAFE" ? <Coffee className="h-5 w-5 flex-shrink-0" aria-hidden="true" /> : <SprayCan className="h-5 w-5 flex-shrink-0" aria-hidden="true" />}
          <p className="text-sm font-semibold leading-snug">
            Atenção: em {MONTHS[duty.month - 1]}, o seu grupo cuida {duty.task === "CAFE" ? "do café" : "da limpeza"}.
          </p>
        </div>
      )}
      {next && (
        <div role="status" data-testid="supply-banner-next" className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-300 px-4 py-3 text-amber-950 shadow-sm">
          <CalendarClock className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold leading-snug">
            Próximo mês: em {MONTHS[next.month - 1]}, o seu grupo vai cuidar {next.task === "CAFE" ? "do café ☕" : "da limpeza 🧹"}.
          </p>
        </div>
      )}
    </div>
  )
}
