"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Megaphone, MessageCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

interface Announcement {
  enabled: boolean
  message: string
  updatedAt: string | null
}

interface WhatsappTemplate {
  message: string
  isDefault: boolean
}

const MAX = 600
const asText = (m: unknown) => (Array.isArray(m) ? m.join(", ") : String(m))

function Card({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-[#374192]/10 text-[#374192]">{icon}</div>
        <div>
          <h2 className="text-sm font-semibold text-[#333333]">{title}</h2>
          <p className="text-xs text-[#666666] mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function AnnouncementCard() {
  const [enabled, setEnabled] = useState(false)
  const [message, setMessage] = useState("")
  const [saved, setSaved] = useState<Announcement | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiClient
      .get<Announcement>("/settings/announcement", { endpoint: "new" })
      .then((res) => {
        setSaved(res)
        setEnabled(res.enabled)
        setMessage(res.message)
      })
      .catch(() => toast.error("Não foi possível carregar o aviso"))
  }, [])

  const dirty = !!saved && (saved.enabled !== enabled || saved.message !== message.trim())

  const save = async () => {
    setSaving(true)
    try {
      const res = await apiClient.put<Announcement>("/coordination/settings/announcement", { enabled, message: message.trim() }, { endpoint: "new" })
      setSaved(res)
      toast.success(enabled ? "Aviso salvo e ativo" : "Aviso salvo (desativado)")
    } catch (e: any) {
      toast.error(asText(e?.response?.data?.message ?? "Não foi possível salvar o aviso"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card
      icon={<Megaphone className="h-5 w-5" />}
      title="Aviso aos capitães"
      subtitle="Aparece no topo do Dashboard, das Designações e da Lista de Espera. Cada pessoa pode fechar; ao editar o texto ele volta a aparecer para todos."
    >
      <label className="flex items-center gap-2 text-sm text-[#333333]">
        <Checkbox checked={enabled} onCheckedChange={(v) => setEnabled(!!v)} />
        Mostrar o aviso
      </label>
      <div>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX}
          rows={4}
          placeholder="Ex.: Novidades no sistema: agora existe a Lista de Espera e o aviso de dupla com homem e mulher nas designações."
        />
        <p className="text-[11px] text-[#666666] mt-1 text-right">
          {message.length}/{MAX}
        </p>
      </div>
      <Button size="sm" onClick={save} disabled={!dirty || saving || (enabled && !message.trim())}>
        {saving ? "Salvando…" : "Salvar aviso"}
      </Button>
    </Card>
  )
}

const SAMPLE = { nome: "Maria", dia: "quarta", periodo: "de manhã" }
const preview = (tpl: string) => tpl.replace(/\{nome\}/g, SAMPLE.nome).replace(/\{dia\}/g, SAMPLE.dia).replace(/\{periodo\}/g, SAMPLE.periodo)

function WhatsappCard() {
  const [message, setMessage] = useState("")
  const [saved, setSaved] = useState<WhatsappTemplate | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiClient
      .get<WhatsappTemplate>("/settings/waitlist-whatsapp", { endpoint: "new" })
      .then((res) => {
        setSaved(res)
        setMessage(res.message)
      })
      .catch(() => toast.error("Não foi possível carregar a mensagem"))
  }, [])

  const apply = (res: WhatsappTemplate, ok: string) => {
    setSaved(res)
    setMessage(res.message)
    toast.success(ok)
  }

  const save = async () => {
    setSaving(true)
    try {
      apply(await apiClient.put<WhatsappTemplate>("/coordination/settings/waitlist-whatsapp", { message: message.trim() }, { endpoint: "new" }), "Mensagem salva")
    } catch (e: any) {
      toast.error(asText(e?.response?.data?.message ?? "Não foi possível salvar a mensagem"))
    } finally {
      setSaving(false)
    }
  }

  const reset = async () => {
    setSaving(true)
    try {
      apply(await apiClient.delete<WhatsappTemplate>("/coordination/settings/waitlist-whatsapp", { endpoint: "new" }), "Voltou ao modelo padrão")
    } catch (e: any) {
      toast.error(asText(e?.response?.data?.message ?? "Não foi possível restaurar"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card
      icon={<MessageCircle className="h-5 w-5" />}
      title="Mensagem de WhatsApp da Lista de Espera"
      subtitle="Texto que abre pronto no WhatsApp ao chamar um voluntário. Use {nome}, {dia} e {periodo} — eles são trocados na hora."
    >
      <div>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={MAX} rows={4} />
        <p className="text-[11px] text-[#666666] mt-1 text-right">
          {message.length}/{MAX}
        </p>
      </div>
      <div className="rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] p-3 text-sm text-[#166534]">
        <p className="text-[11px] font-semibold uppercase tracking-wide mb-1 text-[#15803D]">Como vai aparecer</p>
        {preview(message) || "—"}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={save} disabled={!saved || saving || message.trim() === saved.message || message.trim().length < 10}>
          {saving ? "Salvando…" : "Salvar mensagem"}
        </Button>
        <Button size="sm" variant="outline" onClick={reset} disabled={!saved || saving || saved.isDefault}>
          Voltar ao modelo padrão
        </Button>
      </div>
    </Card>
  )
}

export function SettingsTab() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
      <AnnouncementCard />
      <WhatsappCard />
    </div>
  )
}
