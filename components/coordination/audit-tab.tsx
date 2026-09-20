"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AuditItem, AuditResponse } from "@/types/coordination"
import { AUDIT_ACTION_LABEL, MENU_LABEL, PROFILE_LABEL, GROUP_ROLE_LABEL, formatDateOnly, inputClass } from "@/components/coordination/labels"

const PAGE_SIZE = 30

/** Texto curto do que mudou, a partir do metadata de cada tipo de ação. */
function describe(item: AuditItem): string {
  const m = item.metadata ?? {}
  switch (item.action) {
    case "PROFILE_CHANGE":
      return `${PROFILE_LABEL[m.from] ?? m.from ?? "—"} → ${PROFILE_LABEL[m.to] ?? m.to ?? "—"}`
    case "GROUP_JOIN":
    case "GROUP_LEAVE":
      return m.groupName ?? ""
    case "GROUP_ROLE_CHANGE":
      return `${m.groupName ?? ""}: ${GROUP_ROLE_LABEL[m.from] ?? m.from} → ${GROUP_ROLE_LABEL[m.to] ?? m.to}`
    case "TRAINING_CHANGE":
      return `${formatDateOnly(m.from)} → ${formatDateOnly(m.to)}`
    case "SETTING_CHANGE":
      return m.label ?? m.key ?? ""
    case "PERMISSIONS_CHANGE": {
      const profiles: Record<string, string> = { ADMIN_ANALYST: "Analista", CAPTAIN: "Capitão", ASSISTANT_CAPTAIN: "Assistente de capitão" }
      return Object.entries((m.changes ?? {}) as Record<string, { added: string[]; removed: string[] }>)
        .map(([p, c]) => `${profiles[p] ?? p}: ${[...c.added.map((x) => `+${MENU_LABEL[x] ?? x}`), ...c.removed.map((x) => `−${MENU_LABEL[x] ?? x}`)].join(", ")}`)
        .join(" · ")
    }
    default:
      return ""
  }
}

export function AuditTab() {
  const [q, setQ] = useState("")
  const [qDebounced, setQDebounced] = useState("")
  const [action, setAction] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<AuditResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 400)
    return () => clearTimeout(t)
  }, [q])

  // qualquer filtro novo volta pra página 1
  useEffect(() => {
    setPage(1)
  }, [qDebounced, action, dateFrom, dateTo])

  const fetchData = useCallback(() => {
    const p = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
    if (qDebounced) p.set("q", qDebounced)
    if (action) p.set("action", action)
    if (dateFrom) p.set("dateFrom", dateFrom)
    if (dateTo) p.set("dateTo", dateTo)
    setLoading(true)
    setError(null)
    apiClient
      .get<AuditResponse>(`/coordination/audit?${p.toString()}`, { endpoint: "new" })
      .then(setData)
      .catch((e) => setError(e?.response?.data?.message || "Não foi possível carregar o histórico"))
      .finally(() => setLoading(false))
  }, [page, qDebounced, action, dateFrom, dateTo])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#666666]">Buscar por nome</label>
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Quem fez ou quem foi afetado"
              className={`${inputClass} w-[230px] pl-8 pr-3`}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#666666]">Ação</label>
          <select value={action} onChange={(e) => setAction(e.target.value)} className={`${inputClass} w-[210px]`}>
            <option value="">Todas</option>
            {Object.entries(AUDIT_ACTION_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#666666]">De</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`${inputClass} w-[150px]`} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#666666]">Até</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`${inputClass} w-[150px]`} />
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!q && !action && !dateFrom && !dateTo}
          onClick={() => {
            setQ("")
            setAction("")
            setDateFrom("")
            setDateTo("")
          }}
        >
          Limpar filtros
        </Button>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-lg border border-gray-100">
          <AlertTriangle className="h-8 w-8 text-[#EF4444] mb-2" />
          <p className="text-sm text-[#333333] font-medium">{error}</p>
          <p className="text-xs text-[#666666] mt-1">Se acabou de subir esta tela, confirme se a migration do histórico foi aplicada neste ambiente.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-[#666666]">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5 whitespace-nowrap">Quando</th>
                  <th className="text-left font-medium px-4 py-2.5">Quem fez</th>
                  <th className="text-left font-medium px-4 py-2.5">Ação</th>
                  <th className="text-left font-medium px-4 py-2.5">Quem foi afetado</th>
                  <th className="text-left font-medium px-4 py-2.5">Detalhe</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((item) => (
                  <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50/60">
                    <td className="px-4 py-2.5 whitespace-nowrap text-[#666666]">
                      {new Date(item.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-2.5 text-[#333333]">{item.actorName ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="secondary">{AUDIT_ACTION_LABEL[item.action] ?? item.action}</Badge>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[#333333]">{item.entityName ?? "—"}</td>
                    <td className="px-4 py-2.5 text-[#666666]">{describe(item)}</td>
                  </tr>
                ))}
                {data && data.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-[#666666]">
                      Nenhum registro {q || action || dateFrom || dateTo ? "com esses filtros" : "ainda — as ações passam a ser registradas a partir de agora"}.
                    </td>
                  </tr>
                )}
                {!data && loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-[#666666]">
                      Carregando…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 text-xs text-[#666666]">
            <span>{data ? `${data.total} ${data.total === 1 ? "registro" : "registros"}` : ""}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span>
                {page} de {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
