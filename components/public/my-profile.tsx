"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, ChevronDown, ChevronUp, UserRound } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Availability {
  weekDay: number
  morning: boolean
  afternoon: boolean
  evening: boolean
}

interface OwnProfile {
  name: string
  email: string
  phoneMasked: string
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  birthDate: string | null
  civilStatus: string | null
  congregation: string | null
  availability: Availability[]
  profileUpdatedAt: string | null
  petitionCreatedAt: string | null
  changed?: string[]
}

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
const PERIODS: { key: "morning" | "afternoon" | "evening"; label: string }[] = [
  { key: "morning", label: "Manhã" },
  { key: "afternoon", label: "Tarde" },
  { key: "evening", label: "Noite" },
]
const CIVIL = [
  { value: "", label: "Não informar" },
  { value: "SINGLE", label: "Solteiro(a)" },
  { value: "MARRIED", label: "Casado(a)" },
  { value: "DIVORCED", label: "Divorciado(a)" },
  { value: "WIDOWED", label: "Viúvo(a)" },
]

const input = "h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-base text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#374192]/30"
const asText = (m: unknown) => (Array.isArray(m) ? m.join(", ") : String(m))
const fullAvailability = (list: Availability[]): Availability[] =>
  DAYS.map((_, d) => list.find((a) => a.weekDay === d) ?? { weekDay: d, morning: false, afternoon: false, evening: false })

function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("pt-BR") : null
}

/**
 * "Meus dados": a pessoa que abriu o link individual da designação confere e atualiza o próprio cadastro.
 * O telefone aparece mascarado e não pode ser trocado aqui (é o login); quem troca é a coordenação.
 */
export function MyProfile({ designationId, participantId }: { designationId: string; participantId: string }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<OwnProfile | null>(null)
  const [form, setForm] = useState<OwnProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const base = `/designations/${designationId}/participants/${participantId}/profile`

  useEffect(() => {
    if (!open || data) return
    setLoading(true)
    apiClient
      .get<OwnProfile>(base)
      .then((res) => {
        setData(res)
        setForm({ ...res, availability: fullAvailability(res.availability ?? []) })
      })
      .catch((e) => setError(asText(e?.response?.data?.message || "Não foi possível carregar seus dados")))
      .finally(() => setLoading(false))
  }, [open, data, base])

  const set = <K extends keyof OwnProfile>(k: K, v: OwnProfile[K]) => setForm((f) => (f ? { ...f, [k]: v } : f))
  const toggle = (day: number, key: "morning" | "afternoon" | "evening") =>
    setForm((f) => (f ? { ...f, availability: f.availability.map((a) => (a.weekDay === day ? { ...a, [key]: !a[key] } : a)) } : f))

  const save = async () => {
    if (!form) return
    setSaving(true)
    setError(null)
    setDone(null)
    try {
      const res = await apiClient.patch<OwnProfile>(base, {
        name: form.name,
        email: form.email,
        address: form.address ?? "",
        city: form.city ?? "",
        state: form.state ?? "",
        zipCode: form.zipCode ?? "",
        birthDate: form.birthDate ?? "",
        civilStatus: form.civilStatus ?? "",
        availability: form.availability,
      })
      setData(res)
      setForm({ ...res, availability: fullAvailability(res.availability ?? []) })
      setDone(res.changed && res.changed.length ? `Dados atualizados (${res.changed.join(", ")}). Obrigado!` : "Seus dados já estavam em dia. Obrigado por conferir!")
    } catch (e: any) {
      setError(asText(e?.response?.data?.message || "Não foi possível salvar. Tente de novo."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-6 bg-white border border-gray-200 shadow-sm" data-testid="my-profile">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-3 p-4 text-left">
        <span className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-[#374192]/10 text-[#374192]">
            <UserRound className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-semibold text-[#333333]">Meus dados</span>
            <span className="block text-xs text-[#666666]">Confira e atualize seu cadastro (nome e e-mail principalmente)</span>
          </span>
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-[#666666]" /> : <ChevronDown className="h-4 w-4 text-[#666666]" />}
      </button>

      {open && (
        <CardContent className="px-4 pb-5 pt-0 space-y-4">
          {loading && <p className="text-sm text-[#666666]">Carregando...</p>}
          {error && !form && <p className="text-sm text-[#B91C1C]">{error}</p>}
          {form && (
            <>
              <p className="text-xs text-[#666666]">
                {form.profileUpdatedAt ? `Última atualização: ${formatDate(form.profileUpdatedAt)}` : "Seu cadastro ainda não foi atualizado por aqui."}
              </p>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-[#333333]">Nome completo (nome e sobrenome)</span>
                <input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-[#333333]">E-mail</span>
                <input className={input} type="email" inputMode="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
              </label>
              <div className="space-y-1">
                <span className="text-sm font-medium text-[#333333]">Telefone</span>
                <p className="h-11 flex items-center rounded-lg bg-gray-50 border border-gray-100 px-3 text-base text-[#666666]">{form.phoneMasked || "—"}</p>
                <p className="text-xs text-[#666666]">Para trocar o telefone, fale com a coordenação.</p>
              </div>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-[#333333]">Endereço</span>
                <input className={input} value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" />
              </label>
              <div className="grid grid-cols-[1fr_84px] gap-3">
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-[#333333]">Cidade</span>
                  <input className={input} value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-[#333333]">UF</span>
                  <input className={input} maxLength={2} value={form.state ?? ""} onChange={(e) => set("state", e.target.value.toUpperCase())} />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-[#333333]">CEP</span>
                <input className={input} inputMode="numeric" value={form.zipCode ?? ""} onChange={(e) => set("zipCode", e.target.value)} placeholder="18000-000" />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-[#333333]">Data de nascimento</span>
                <input className={input} type="date" value={form.birthDate ?? ""} onChange={(e) => set("birthDate", e.target.value)} />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-[#333333]">Estado civil</span>
                <select className={input} value={form.civilStatus ?? ""} onChange={(e) => set("civilStatus", e.target.value || null)}>
                  {CIVIL.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              {form.congregation && (
                <div className="space-y-1">
                  <span className="text-sm font-medium text-[#333333]">Congregação</span>
                  <p className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-sm text-[#666666]">{form.congregation}</p>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-sm font-medium text-[#333333]">Dias e períodos em que você pode ajudar</span>
                <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-xs">
                  <span />
                  {PERIODS.map((p) => (
                    <span key={p.key} className="text-center font-medium text-[#666666]">
                      {p.label}
                    </span>
                  ))}
                  {form.availability.map((a) => (
                    <div key={a.weekDay} className="contents">
                      <span className="py-2 text-[#333333]">{DAYS[a.weekDay]}</span>
                      {PERIODS.map((p) => (
                        <label key={p.key} className="flex items-center justify-center py-2">
                          <input type="checkbox" className="h-5 w-5" checked={a[p.key]} onChange={() => toggle(a.weekDay, p.key)} aria-label={`${DAYS[a.weekDay]} ${p.label}`} />
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-[#B91C1C]" role="alert">{error}</p>}
              {done && (
                <p className="flex items-start gap-2 text-sm text-[#047857]" role="status">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" /> {done}
                </p>
              )}
              <Button onClick={save} disabled={saving} className="w-full h-11 bg-[#374192] hover:bg-[#46607F]">
                {saving ? "Salvando..." : "Salvar meus dados"}
              </Button>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
