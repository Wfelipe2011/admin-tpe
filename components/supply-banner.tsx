"use client"

import { useEffect, useState } from "react"
import { Coffee, SprayCan } from "lucide-react"
import { apiClient } from "@/lib/api-client"

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]

/**
 * Faixa vermelha: "neste mês o seu grupo cuida do café / da limpeza". Aparece só para grupos do Centro
 * no dia da semana sorteado do mês; para os demais não renderiza nada (nem ocupa espaço).
 */
export function SupplyBanner({ designationId, className = "" }: { designationId?: string | null; className?: string }) {
  const [duty, setDuty] = useState<{ task: "CAFE" | "LIMPEZA"; label: string; month: number } | null>(null)

  useEffect(() => {
    if (!designationId) return
    let alive = true
    apiClient
      .get<{ duty: { task: "CAFE" | "LIMPEZA"; label: string; month: number } | null }>(`/designations/${designationId}/supply-duty`)
      .then((r) => alive && setDuty(r?.duty ?? null))
      .catch(() => alive && setDuty(null)) // faixa é só um aviso: se falhar, a tela segue normal
    return () => {
      alive = false
    }
  }, [designationId])

  if (!duty) return null
  const Icon = duty.task === "CAFE" ? Coffee : SprayCan
  return (
    <div role="status" data-testid="supply-banner" className={`flex items-center gap-3 rounded-lg bg-[#DC2626] px-4 py-3 text-white shadow-sm ${className}`}>
      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <p className="text-sm font-semibold leading-snug">
        Atenção: em {MONTHS[duty.month - 1]}, o seu grupo cuida {duty.task === "CAFE" ? "do café" : "da limpeza"}.
      </p>
    </div>
  )
}
