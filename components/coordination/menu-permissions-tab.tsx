"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Info } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { loadMenuPermissions, type MenuPermissionsResponse } from "@/lib/menu-permissions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MENU_ROWS, MENU_PROFILE_COLUMNS } from "@/components/coordination/labels"

type Permissions = MenuPermissionsResponse["permissions"]
type ProfileKey = keyof Permissions

const asText = (m: unknown) => (Array.isArray(m) ? m.join(", ") : String(m))
const same = (a: Permissions, b: Permissions) =>
  MENU_PROFILE_COLUMNS.every((c) => a[c.profile].length === b[c.profile].length && a[c.profile].every((p) => b[c.profile].includes(p)))

export function MenuPermissionsTab() {
  const [saved, setSaved] = useState<MenuPermissionsResponse | null>(null)
  const [draft, setDraft] = useState<Permissions | null>(null)
  const [saving, setSaving] = useState(false)

  const apply = (res: MenuPermissionsResponse) => {
    setSaved(res)
    setDraft(res.permissions)
    loadMenuPermissions(true)
  }

  useEffect(() => {
    apiClient
      .get<MenuPermissionsResponse>("/settings/menu-permissions", { endpoint: "new" })
      .then((res) => {
        setSaved(res)
        setDraft(res.permissions)
      })
      .catch(() => toast.error("Não foi possível carregar as permissões"))
  }, [])

  const toggle = (profile: ProfileKey, path: string) => {
    if (!draft) return
    const has = draft[profile].includes(path)
    setDraft({ ...draft, [profile]: has ? draft[profile].filter((p) => p !== path) : [...draft[profile], path] })
  }

  const run = async (fn: () => Promise<MenuPermissionsResponse>, ok: string, fallback: string) => {
    setSaving(true)
    try {
      apply(await fn())
      toast.success(ok)
    } catch (e: any) {
      toast.error(asText(e?.response?.data?.message ?? fallback))
    } finally {
      setSaving(false)
    }
  }

  if (!draft || !saved) return <div className="p-12 text-center text-sm text-[#666666]">Carregando…</div>

  const dirty = !same(draft, saved.permissions)

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-[#929BD2]/60 bg-[#374192]/5 p-3 sm:p-4 text-sm text-[#333333]">
        <Info className="h-4 w-4 mt-0.5 text-[#374192] flex-shrink-0" />
        <p>
          Escolha quais telas aparecem no menu de cada perfil. O coordenador sempre vê tudo. A mudança vale na próxima vez que a pessoa abrir ou recarregar o
          sistema. Isso controla o que aparece e o que abre pelo menu; não é uma trava de segurança do servidor.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-[#666666]">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">Tela do menu</th>
              <th className="font-medium px-4 py-2.5">Coordenador</th>
              {MENU_PROFILE_COLUMNS.map((c) => (
                <th key={c.profile} className="font-medium px-4 py-2.5">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MENU_ROWS.map((row) => (
              <tr key={row.path} className="border-t border-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#333333]">{row.label}</p>
                  {row.note && <p className="text-[11px] text-[#666666]">{row.note}</p>}
                </td>
                <td className="px-4 py-3 text-center">
                  <Checkbox checked disabled />
                </td>
                {MENU_PROFILE_COLUMNS.map((c) => {
                  const locked = row.lock === "coordinator"
                  const always = row.lock === "always"
                  return (
                    <td key={c.profile} className="px-4 py-3 text-center">
                      {locked ? (
                        <span className="text-[11px] text-[#999999]">só coordenador</span>
                      ) : (
                        <Checkbox
                          checked={always || draft[c.profile].includes(row.path)}
                          disabled={always || saving}
                          onCheckedChange={() => toggle(c.profile, row.path)}
                          aria-label={`${row.label} para ${c.label}`}
                        />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          disabled={!dirty || saving}
          onClick={() =>
            run(
              () => apiClient.put<MenuPermissionsResponse>("/coordination/settings/menu-permissions", { permissions: draft }, { endpoint: "new" }),
              "Menu salvo",
              "Não foi possível salvar o menu",
            )
          }
        >
          {saving ? "Salvando…" : "Salvar menu"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={saving || (saved.isDefault && !dirty)}
          onClick={() =>
            run(
              () => apiClient.delete<MenuPermissionsResponse>("/coordination/settings/menu-permissions", { endpoint: "new" }),
              "Voltou ao padrão",
              "Não foi possível restaurar o padrão",
            )
          }
        >
          Voltar ao padrão
        </Button>
        {saved.isDefault && <span className="text-xs text-[#666666]">Usando o padrão do sistema.</span>}
      </div>
    </div>
  )
}
