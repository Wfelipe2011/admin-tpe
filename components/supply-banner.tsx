"use client"

import { useEffect, useState } from "react"
import { CalendarClock, Coffee, ShoppingCart, Sparkles } from "lucide-react"
import { apiClient } from "@/lib/api-client"

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]

type Purchase = { task: "CAFE" | "LIMPEZA"; month: number; year?: number }
type Cleaning = { month: number; year?: number }
interface Duties {
  duty: Purchase | null
  next?: Purchase | null
  cleaning?: Cleaning | null
  cleaningNext?: Cleaning | null
}

const purchaseText = (task: Purchase["task"]) => (task === "CAFE" ? "compra os itens do café" : "compra os produtos de limpeza")

/**
 * Avisos do rodízio do Centro, para o grupo da designação:
 * - vermelha: o que o grupo faz NESTE mês (compra de itens do café / produtos de limpeza, e/ou limpeza da sala);
 * - amarela: o que o grupo vai fazer no PRÓXIMO mês.
 * Grupo sem nada no rodízio: não renderiza nada (nem ocupa espaço).
 */
export function SupplyBanner({ designationId, className = "" }: { designationId?: string | null; className?: string }) {
  const [d, setD] = useState<Duties | null>(null)

  useEffect(() => {
    if (!designationId) return
    let alive = true
    apiClient
      .get<Duties>(`/designations/${designationId}/supply-duty`)
      .then((r) => alive && setD(r ?? null))
      .catch(() => alive && setD(null)) // faixa é só um aviso: se falhar, a tela segue normal
    return () => {
      alive = false
    }
  }, [designationId])

  if (!d) return null
  const now: string[] = []
  if (d.duty) now.push(purchaseText(d.duty.task))
  if (d.cleaning) now.push("faz a limpeza da sala")
  const later: string[] = []
  if (d.next) later.push(purchaseText(d.next.task).replace("compra", "vai comprar"))
  if (d.cleaningNext) later.push(later.length ? "fazer a limpeza da sala" : "vai fazer a limpeza da sala")
  const nowMonth = d.duty?.month ?? d.cleaning?.month
  const nextMonth = d.next?.month ?? d.cleaningNext?.month
  if (!now.length && !later.length) return null

  const NowIcon = d.cleaning && !d.duty ? Sparkles : d.duty?.task === "CAFE" ? Coffee : ShoppingCart
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {now.length > 0 && nowMonth && (
        <div role="status" data-testid="supply-banner" className="flex items-center gap-3 rounded-lg bg-[#DC2626] px-4 py-3 text-white shadow-sm">
          <NowIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold leading-snug">
            Atenção: em {MONTHS[nowMonth - 1]}, o seu grupo {now.join(" e ")}.
          </p>
        </div>
      )}
      {later.length > 0 && nextMonth && (
        <div role="status" data-testid="supply-banner-next" className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-300 px-4 py-3 text-amber-950 shadow-sm">
          <CalendarClock className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold leading-snug">
            Próximo mês: em {MONTHS[nextMonth - 1]}, o seu grupo {later.join(" e ")}.
          </p>
        </div>
      )}
    </div>
  )
}
