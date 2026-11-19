"use client"

import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { AlertTriangle, MessageSquareOff, Send } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"

interface GroupSend {
  groupId: string
  name: string
  type: "MAIN" | "ADDITIONAL" | "SPECIAL"
  status: "OPEN" | "CLOSED"
  weekday: string
  startHour: string
  hasWhatsapp: boolean
  enabled: boolean
  explicit: boolean
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
const TYPE_PT: Record<string, string> = { MAIN: "Centro", ADDITIONAL: "Adicional", SPECIAL: "Especial" }

const asText = (m: unknown) => (Array.isArray(m) ? m.join(", ") : String(m))

/**
 * Envio de mensagens de designação por grupo. O grupo Especial (ex.: Zoológico) começa desligado: nenhuma
 * mensagem vai para o grupo até o coordenador ligar aqui. Os demais continuam enviando como sempre.
 */
export function SendTab() {
  const [groups, setGroups] = useState<GroupSend[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [q, setQ] = useState("")

  const load = useCallback(() => {
    apiClient
      .get<GroupSend[]>("/coordination/group-send")
      .then((rows) => setGroups(Array.isArray(rows) ? rows : []))
      .catch((e) => setError(asText(e?.response?.data?.message || "Não foi possível carregar os grupos")))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggle = async (g: GroupSend) => {
    setSaving(g.groupId)
    try {
      await apiClient.put(`/coordination/group-send/${g.groupId}`, { enabled: !g.enabled })
      toast.success(!g.enabled ? `Envio liberado para ${g.name}` : `Envio desligado para ${g.name}`)
      load()
    } catch (e: any) {
      toast.error(asText(e?.response?.data?.message || "Não foi possível salvar"))
    } finally {
      setSaving(null)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-lg border border-gray-100">
        <AlertTriangle className="h-8 w-8 text-[#EF4444] mb-2" />
        <p className="text-sm text-[#333333] font-medium">{error}</p>
      </div>
    )
  }
  if (!groups) return <div className="text-sm text-[#666666] p-6">Carregando...</div>

  const visible = groups.filter((g) => g.name.toLowerCase().includes(q.trim().toLowerCase()))
  // Especiais primeiro: são os que começam desligados
  const sorted = [...visible].sort((a, b) => Number(b.type === "SPECIAL") - Number(a.type === "SPECIAL") || a.name.localeCompare(b.name))

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#374192]/10 text-[#374192]">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#333333]">Envio de mensagens por grupo</h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Liga ou desliga as mensagens de designação (aviso de designação disponível e de cancelamento) de cada grupo. Grupo Especial, como o Zoológico,
              começa desligado e só recebe mensagem depois que você liberar aqui. Os outros grupos continuam enviando como sempre. A designação em si
              funciona igual, com ou sem envio.
            </p>
          </div>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Procurar grupo pelo nome"
          className="mt-4 h-9 w-full sm:w-[280px] rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#374192]/30"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-50">
          {sorted.length === 0 && <li className="p-6 text-sm text-[#666666] text-center">Nenhum grupo encontrado.</li>}
          {sorted.map((g) => (
            <li key={g.groupId} className="flex flex-wrap items-center gap-3 px-4 py-3" data-testid={`send-row-${g.groupId}`}>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#333333] truncate">{g.name}</p>
                <p className="text-xs text-[#666666] flex flex-wrap items-center gap-2 mt-0.5">
                  <Badge variant={g.type === "MAIN" ? "default" : "secondary"}>{TYPE_PT[g.type] ?? g.type}</Badge>
                  <span>
                    {WEEKDAY_PT[g.weekday] ?? g.weekday} · {g.startHour}
                  </span>
                  {g.status === "CLOSED" && <span className="text-[#B45309]">grupo fechado</span>}
                  {!g.hasWhatsapp && <span>sem WhatsApp do grupo (a mensagem vai ao capitão)</span>}
                  {!g.explicit && <span className="text-[#929BD2]">padrão do tipo</span>}
                </p>
              </div>
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${g.enabled ? "text-[#047857]" : "text-[#B91C1C]"}`}>
                {g.enabled ? <Send className="h-3.5 w-3.5" /> : <MessageSquareOff className="h-3.5 w-3.5" />}
                {g.enabled ? "Envio ligado" : "Envio desligado"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={g.enabled}
                aria-label={`Envio de mensagens do grupo ${g.name}`}
                disabled={saving === g.groupId}
                onClick={() => toggle(g)}
                className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${g.enabled ? "bg-[#10B981]" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${g.enabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
