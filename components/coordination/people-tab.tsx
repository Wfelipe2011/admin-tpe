"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { AlertTriangle, ChevronLeft, ChevronRight, ExternalLink, GraduationCap, Phone, Search, ShieldAlert, X } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { PeopleResponse, Person } from "@/types/coordination"
import {
  ASSIGNABLE_PROFILES,
  GROUP_ROLE_LABEL,
  PETITION_STATUS_LABEL,
  PROFILE_LABEL,
  formatDateOnly,
  inputClass,
} from "@/components/coordination/labels"

const PAGE_SIZE = 20

interface GroupOption {
  id: string
  name: string
  type?: string
}

const errorMessage = (e: any, fallback: string) => e?.response?.data?.message ?? fallback
const asText = (m: unknown) => (Array.isArray(m) ? m.join(", ") : String(m))

function Avatar({ person }: { person: Person }) {
  const male = person.sex === "MALE"
  return (
    <div
      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
        male ? "bg-[#3B82F6]/10 text-[#3B82F6]" : "bg-[#EC4899]/10 text-[#EC4899]"
      }`}
    >
      {person.name.replace("[TESTE]", "").trim().charAt(0).toUpperCase()}
    </div>
  )
}

function PersonDialog({
  person,
  groupOptions,
  onClose,
  onChanged,
}: {
  person: Person
  groupOptions: GroupOption[]
  onClose: () => void
  onChanged: () => void
}) {
  const [profile, setProfile] = useState<string>(person.profile ?? "PARTICIPANT")
  const [confirmProfile, setConfirmProfile] = useState(false)
  const [training, setTraining] = useState(person.lastTrainingDate ? person.lastTrainingDate.slice(0, 10) : "")
  const [newGroupId, setNewGroupId] = useState("")
  const [removing, setRemoving] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // a lista recarrega depois de cada ação: mantém os campos alinhados com o que foi salvo
  useEffect(() => {
    setProfile(person.profile ?? "PARTICIPANT")
    setTraining(person.lastTrainingDate ? person.lastTrainingDate.slice(0, 10) : "")
    setConfirmProfile(false)
  }, [person.profile, person.lastTrainingDate])

  const run = async (fn: () => Promise<unknown>, ok: string, fallback: string) => {
    setBusy(true)
    try {
      await fn()
      toast.success(ok)
      onChanged()
    } catch (e) {
      toast.error(asText(errorMessage(e, fallback)))
    } finally {
      setBusy(false)
    }
  }

  const currentProfile = person.profile ?? "PARTICIPANT"
  const profileChanged = profile !== currentProfile
  const memberOf = new Set(person.groups.map((g) => g.groupId))
  const availableGroups = groupOptions.filter((g) => !memberOf.has(g.id))
  const isMale = person.sex === "MALE"

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar person={person} />
            <span>{person.name}</span>
          </DialogTitle>
          <DialogDescription>
            {person.phone} · {person.email}
            {person.congregation ? ` · ${person.congregation.name}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Perfil no sistema */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-[#333333]">Perfil no sistema</h3>
            <div className="flex flex-wrap items-center gap-2">
              <select value={profile} onChange={(e) => setProfile(e.target.value)} disabled={busy} className={`${inputClass} w-[240px]`}>
                {!ASSIGNABLE_PROFILES.includes(currentProfile as (typeof ASSIGNABLE_PROFILES)[number]) && (
                  <option value={currentProfile} disabled>
                    {PROFILE_LABEL[currentProfile] ?? currentProfile}
                  </option>
                )}
                {ASSIGNABLE_PROFILES.map((p) => (
                  <option key={p} value={p}>
                    {PROFILE_LABEL[p]}
                  </option>
                ))}
              </select>
              <Button size="sm" disabled={!profileChanged || busy} onClick={() => setConfirmProfile(true)}>
                Alterar perfil
              </Button>
            </div>
            {confirmProfile && profileChanged && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p>
                      Tem certeza? <strong>{person.name}</strong> passará de <strong>{PROFILE_LABEL[currentProfile]}</strong> para{" "}
                      <strong>{PROFILE_LABEL[profile]}</strong>.
                    </p>
                    <p className="text-xs mt-1 text-amber-800">
                      A permissão muda na hora nas ações do servidor; para ver o menu novo, a pessoa precisa sair e entrar de novo.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          run(
                            () => apiClient.patch(`/coordination/people/${person.id}/profile`, { profile }, { endpoint: "new" }),
                            "Perfil alterado",
                            "Não foi possível alterar o perfil",
                          )
                        }
                      >
                        Sim, alterar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmProfile(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Treinamento */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-[#333333] flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" /> Treinamento
            </h3>
            <p className="text-xs text-[#666666]">Treinamento não expira: só importa se existe uma data registrada.</p>
            <div className="flex flex-wrap items-center gap-2">
              <input type="date" value={training} onChange={(e) => setTraining(e.target.value)} className={`${inputClass} w-[160px]`} />
              <Button
                size="sm"
                disabled={busy || !training || training === (person.lastTrainingDate ?? "").slice(0, 10)}
                onClick={() =>
                  run(
                    () => apiClient.patch(`/coordination/people/${person.id}/training`, { lastTrainingDate: training }, { endpoint: "new" }),
                    "Treinamento salvo",
                    "Não foi possível salvar o treinamento",
                  )
                }
              >
                Salvar
              </Button>
              {person.lastTrainingDate && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () => apiClient.patch(`/coordination/people/${person.id}/training`, { lastTrainingDate: null }, { endpoint: "new" }),
                      "Treinamento removido",
                      "Não foi possível remover o treinamento",
                    )
                  }
                >
                  Remover data
                </Button>
              )}
            </div>
          </section>

          {/* Grupos */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-[#333333]">Grupos</h3>
            {person.groups.length === 0 && <p className="text-sm text-[#666666]">Não está em nenhum grupo.</p>}
            {person.groups.map((g) => (
              <div key={g.groupId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 p-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant={g.type === "MAIN" ? "default" : "secondary"}>{g.type === "MAIN" ? "Centro" : g.type === "ADDITIONAL" ? "Adicional" : "Especial"}</Badge>
                  <span className="text-sm font-medium text-[#333333] truncate">{g.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isMale ? (
                    <select
                      value={g.role}
                      disabled={busy}
                      onChange={(e) =>
                        run(
                          () => apiClient.put(`/groups/${g.groupId}/participants/${person.id}`, { profile: e.target.value }, { endpoint: "new" }),
                          "Cargo no grupo alterado",
                          "Não foi possível alterar o cargo",
                        )
                      }
                      className={`${inputClass} w-[150px]`}
                    >
                      {Object.entries(GROUP_ROLE_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-[#666666]" title="Só homens podem ser capitão ou assistente">
                      {GROUP_ROLE_LABEL[g.role]}
                    </span>
                  )}
                  {removing === g.groupId ? (
                    <>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busy}
                        onClick={() =>
                          run(
                            () => apiClient.delete(`/groups/${g.groupId}/participants/${person.id}`, { endpoint: "new" }),
                            "Removido do grupo",
                            "Não foi possível remover do grupo",
                          ).then(() => setRemoving(null))
                        }
                      >
                        Confirmar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setRemoving(null)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => setRemoving(g.groupId)}>
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <select value={newGroupId} onChange={(e) => setNewGroupId(e.target.value)} disabled={busy} className={`${inputClass} w-[260px]`}>
                <option value="">Adicionar a um grupo…</option>
                {availableGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                disabled={!newGroupId || busy}
                onClick={() =>
                  run(
                    () => apiClient.patch(`/groups/${newGroupId}/participants/${person.id}`, {}, { endpoint: "new" }),
                    "Adicionado ao grupo",
                    "Não foi possível adicionar ao grupo",
                  ).then(() => setNewGroupId(""))
                }
              >
                Adicionar
              </Button>
            </div>
            <p className="text-[11px] text-[#666666]">As regras de composição continuam valendo (máximo de 2 grupos, nunca 2 do Centro, limite de vagas do grupo).</p>
          </section>

          {person.petitions && (
            <section className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm">
              <span className="text-[#666666]">
                Petição: <strong className="text-[#333333]">{PETITION_STATUS_LABEL[person.petitions.status] ?? person.petitions.status}</strong>
              </span>
              <Link href={`/peticoes/visualizar/${person.petitions.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#374192] hover:underline">
                Abrir petição <ExternalLink className="h-3 w-3" />
              </Link>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PeopleTab() {
  const [q, setQ] = useState("")
  const [qDebounced, setQDebounced] = useState("")
  const [profile, setProfile] = useState("")
  const [petitionStatus, setPetitionStatus] = useState("")
  const [groupId, setGroupId] = useState("")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PeopleResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [lastSelected, setLastSelected] = useState<Person | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 400)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    setPage(1)
  }, [qDebounced, profile, petitionStatus, groupId])

  useEffect(() => {
    apiClient
      .get<GroupOption[]>("/groups", { endpoint: "new" })
      .then((res) => setGroupOptions(Array.isArray(res) ? res : []))
      .catch(() => setGroupOptions([]))
  }, [])

  const fetchData = useCallback(() => {
    const p = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
    if (qDebounced) p.set("q", qDebounced)
    if (profile) p.set("profile", profile)
    if (petitionStatus) p.set("petitionStatus", petitionStatus)
    if (groupId) p.set("groupId", groupId)
    setLoading(true)
    setError(null)
    apiClient
      .get<PeopleResponse>(`/coordination/people?${p.toString()}`, { endpoint: "new" })
      .then(setData)
      .catch((e) => setError(asText(errorMessage(e, "Não foi possível carregar as pessoas"))))
      .finally(() => setLoading(false))
  }, [page, qDebounced, profile, petitionStatus, groupId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // a ficha aberta acompanha os dados recarregados; se a pessoa saiu da página (filtro), usa a última cópia
  const selected = useMemo(() => {
    if (!selectedId) return null
    return data?.items.find((p) => p.id === selectedId) ?? lastSelected
  }, [selectedId, data, lastSelected])

  const open = (p: Person) => {
    setSelectedId(p.id)
    setLastSelected(p)
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1
  const hasFilters = !!(q || profile || petitionStatus || groupId)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#666666]">Nome, telefone ou e-mail</label>
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar voluntário" className={`${inputClass} w-[240px] pl-8 pr-3`} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#666666]">Perfil no sistema</label>
          <select value={profile} onChange={(e) => setProfile(e.target.value)} className={`${inputClass} w-[210px]`}>
            <option value="">Todos</option>
            {ASSIGNABLE_PROFILES.map((p) => (
              <option key={p} value={p}>
                {PROFILE_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#666666]">Petição</label>
          <select value={petitionStatus} onChange={(e) => setPetitionStatus(e.target.value)} className={`${inputClass} w-[190px]`}>
            <option value="">Todas</option>
            {Object.entries(PETITION_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#666666]">Grupo</label>
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className={`${inputClass} w-[210px]`}>
            <option value="">Todos</option>
            {groupOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasFilters}
          onClick={() => {
            setQ("")
            setProfile("")
            setPetitionStatus("")
            setGroupId("")
          }}
        >
          Limpar filtros
        </Button>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-lg border border-gray-100">
          <AlertTriangle className="h-8 w-8 text-[#EF4444] mb-2" />
          <p className="text-sm text-[#333333] font-medium">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {data?.items.map((p) => (
              <li key={p.id}>
                <button onClick={() => open(p)} className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50/70 transition-colors">
                  <Avatar person={p} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-medium text-[#333333]">{p.name}</span>
                      {p.profile && p.profile !== "PARTICIPANT" && <Badge>{PROFILE_LABEL[p.profile] ?? p.profile}</Badge>}
                      {p.petitions && <Badge variant="secondary">{PETITION_STATUS_LABEL[p.petitions.status] ?? p.petitions.status}</Badge>}
                      {p.lastTrainingDate ? null : <Badge variant="outline">Sem treinamento</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#666666]">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {p.phone}
                      </span>
                      {p.groups.length === 0 ? (
                        <span>sem grupo</span>
                      ) : (
                        p.groups.map((g) => (
                          <span key={g.groupId}>
                            {g.name}
                            {g.role !== "PARTICIPANT" ? ` (${GROUP_ROLE_LABEL[g.role]})` : ""}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
            {data && data.items.length === 0 && <li className="px-4 py-10 text-center text-sm text-[#666666]">Ninguém encontrado {hasFilters ? "com esses filtros" : ""}.</li>}
            {!data && loading && <li className="px-4 py-10 text-center text-sm text-[#666666]">Carregando…</li>}
          </ul>
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 text-xs text-[#666666]">
            <span>{data ? `${data.total} ${data.total === 1 ? "pessoa" : "pessoas"}` : ""}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((n) => n - 1)}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span>
                {page} de {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((n) => n + 1)}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <PersonDialog
          person={selected}
          groupOptions={groupOptions}
          onClose={() => setSelectedId(null)}
          onChanged={fetchData}
        />
      )}
    </div>
  )
}
