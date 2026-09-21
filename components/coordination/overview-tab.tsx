"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CoordinationOverview, GroupTypeTotals, OverviewAlert } from "@/types/coordination"

const PETITION_LABEL: Record<string, string> = {
  ACTIVE: "Ativas",
  WAITING: "Na espera",
  WAITING_INFORMATION: "Aguardando informação",
  CREATED: "Criadas",
  TEMPORARY: "Temporárias",
  SUSPENDED: "Suspensas",
  INACTIVE: "Inativas",
  EXPIRED: "Expiradas",
  EXCLUDED: "Excluídas",
  NONE: "Sem petição",
}

const ALERT_STYLE = {
  high: { border: "border-l-[#EF4444]", bg: "bg-[#FEF2F2]", text: "text-[#B91C1C]", label: "Atenção" },
  medium: { border: "border-l-[#F59E0B]", bg: "bg-[#FFFBEB]", text: "text-[#B45309]", label: "Acompanhar" },
  info: { border: "border-l-[#929BD2]", bg: "bg-[#374192]/5", text: "text-[#374192]", label: "Informativo" },
} as const

const pct = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0)

function StatCard({
  icon,
  value,
  label,
  accent,
  children,
}: {
  icon: React.ReactNode
  value: number | string
  label: string
  accent: string
  children?: React.ReactNode
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 border-l-4 ${accent}`}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#374192]/10 text-[#374192]">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-[#333333] leading-none">{value}</p>
          <p className="text-xs text-[#666666] mt-1">{label}</p>
        </div>
      </div>
      {children && <div className="mt-3 text-xs text-[#666666]">{children}</div>}
    </div>
  )
}

function SexSplit({ male, female }: { male: number; female: number }) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
        <strong className="text-[#333333]">{male}</strong> homens
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-[#EC4899]" />
        <strong className="text-[#333333]">{female}</strong> mulheres
      </span>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-[#333333]">{title}</h2>
        {subtitle && <p className="text-xs text-[#666666] mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm border-b border-gray-50 last:border-0">
      <span className="text-[#666666]">{label}</span>
      <span className="font-semibold text-[#333333]">{value}</span>
    </div>
  )
}

function GroupTypeCard({ title, accent, totals }: { title: string; accent: string; totals: GroupTypeTotals }) {
  const occupancy = pct(totals.members, totals.capacity)
  return (
    <div className={`rounded-xl border border-gray-100 p-4 border-l-4 ${accent} bg-white`}>
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm text-[#333333]">{title}</p>
        <Badge variant="secondary">{totals.groups} {totals.groups === 1 ? "grupo" : "grupos"}</Badge>
      </div>
      <p className="text-xs text-[#666666] mt-2">
        {totals.members}/{totals.capacity} membros · <strong className="text-[#333333]">{totals.vacancies}</strong>{" "}
        {totals.vacancies === 1 ? "vaga" : "vagas"}
      </p>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mt-2">
        <div className="h-full rounded-full bg-[#374192]" style={{ width: `${occupancy}%` }} />
      </div>
    </div>
  )
}

function AlertCard({ alert }: { alert: OverviewAlert }) {
  const s = ALERT_STYLE[alert.level]
  return (
    <div className={`rounded-xl border border-gray-100 border-l-4 ${s.border} bg-white p-4 shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-[#333333]">{alert.title}</p>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${s.bg} ${s.text}`}>{s.label}</span>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">{alert.description}</p>
        </div>
        <span className={`text-2xl font-bold leading-none ${s.text}`}>{alert.count}</span>
      </div>
      {alert.items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {alert.items.map((item) => (
            <span key={item} className="text-xs bg-gray-50 border border-gray-100 rounded-md px-2 py-0.5 text-[#333333]">
              {item}
            </span>
          ))}
        </div>
      )}
      <Link href={alert.href} className="inline-flex items-center gap-1 text-xs font-semibold text-[#374192] mt-3 hover:underline">
        Resolver <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

export function OverviewTab() {
  const [data, setData] = useState<CoordinationOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)
    apiClient
      .get<CoordinationOverview>("/coordination/overview", { endpoint: "new" })
      .then((res) => setData(res))
      .catch((e) => setError(e?.response?.data?.message || "Não foi possível carregar a visão geral"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-gray-100">
        <AlertTriangle className="h-10 w-10 text-[#EF4444] mb-3" />
        <p className="text-[#333333] font-medium">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>
          Tentar de novo
        </Button>
      </div>
    )
  }

  if (!data) {
    return <div className="p-12 text-center text-sm text-[#666666]">{loading ? "Carregando visão geral…" : ""}</div>
  }

  const { volunteers: v, roles, groups, waitlist, incidents, alerts } = data
  const trainingPct = pct(v.training.activeWithTraining, v.active.total)
  const petitionRows = Object.entries(v.byPetition).filter(([, n]) => n > 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#666666]">
          Atualizado em {new Date(data.generatedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
        </p>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Números principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={<Users className="h-5 w-5" />} value={v.total} label="voluntários cadastrados" accent="border-l-[#374192]">
          <SexSplit male={v.bySex.MALE} female={v.bySex.FEMALE} />
        </StatCard>
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} value={v.active.total} label="voluntários ativos" accent="border-l-[#10B981]">
          <SexSplit male={v.active.bySex.MALE} female={v.active.bySex.FEMALE} />
        </StatCard>
        <StatCard icon={<UserCheck className="h-5 w-5" />} value={waitlist.total} label="na lista de espera" accent="border-l-[#929BD2]">
          <SexSplit male={waitlist.bySex.MALE} female={waitlist.bySex.FEMALE} />
        </StatCard>
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} value={waitlist.groupsWithVacancies} label="grupos com vagas" accent="border-l-[#F59E0B]">
          {groups.byType.MAIN.vacancies + groups.byType.ADDITIONAL.vacancies} vagas no total
        </StatCard>
      </div>

      {/* Alertas */}
      <Section title="Precisa da sua atenção" subtitle="Cada item leva à tela onde dá pra resolver.">
        {alerts.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-[#2ECC71] font-medium">
            <CheckCircle2 className="h-4 w-4" /> Tudo em ordem por aqui.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {alerts.map((a) => (
              <AlertCard key={a.key} alert={a} />
            ))}
          </div>
        )}
      </Section>

      {/* Centro x Adicionais */}
      <Section
        title="Centro × Adicionais"
        subtitle={`${groups.open} de ${groups.total} grupos abertos. Vagas contadas até o máximo de cada grupo.`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <GroupTypeCard title="Centro" accent="border-l-[#374192]" totals={groups.byType.MAIN} />
          <GroupTypeCard title="Adicionais" accent="border-l-[#929BD2]" totals={groups.byType.ADDITIONAL} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mt-3">
          <Row label="Na espera aparecendo em grupos do Centro" value={waitlist.inMainGroups} />
          <Row label="Na espera aparecendo em grupos Adicionais" value={waitlist.inAdditionalGroups} />
        </div>
        <p className="text-[11px] text-[#666666] mt-1">
          Uma pessoa pode aparecer nos dois tipos, então essas duas linhas podem somar mais que o total na espera ({waitlist.total}).
        </p>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cargos */}
        <Section title="Cargos" subtitle="Capitães e assistentes contam pelo cargo no grupo.">
          <Row label="Coordenadores" value={roles.coordinators} />
          <Row label="Analistas" value={roles.adminAnalysts} />
          <Row label="Capitães" value={roles.captains} />
          <Row label="Assistentes de capitão" value={roles.assistantCaptains} />
        </Section>

        {/* Treinamento */}
        <Section title="Treinamento" subtitle="Treinamento não expira: só conta quem tem ou não uma data registrada.">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-[#374192]/10 text-[#374192]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#333333] leading-none">{trainingPct}%</p>
              <p className="text-xs text-[#666666] mt-1">dos ativos têm treinamento</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-3">
            <div className="h-full rounded-full bg-[#2ECC71]" style={{ width: `${trainingPct}%` }} />
          </div>
          <Row label="Ativos com treinamento" value={v.training.activeWithTraining} />
          <Row label="Ativos sem treinamento" value={v.training.activeWithoutTraining} />
          <Row label="Cadastrados sem treinamento" value={v.training.withoutTraining} />
        </Section>

        {/* Petições e dados */}
        <Section title="Petições e cadastro">
          {petitionRows.map(([status, n]) => (
            <Row key={status} label={PETITION_LABEL[status] ?? status} value={n} />
          ))}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <Row label="Sem disponibilidade informada" value={v.incomplete.noAvailability} />
            <Row label="Sem congregação" value={v.incomplete.noCongregation} />
          </div>
        </Section>
      </div>

      {/* Faltas */}
      <Section title="Faltas" subtitle="Mesma regra do Painel de Faltas (semana com presença opcional não conta).">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <div>
            <p className="text-2xl font-bold text-[#333333] leading-none">{incidents.last30Days}</p>
            <p className="text-xs text-[#666666] mt-1">nos últimos 30 dias</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#333333] leading-none">{incidents.total}</p>
            <p className="text-xs text-[#666666] mt-1">no total</p>
          </div>
          {(["MAIN", "ADDITIONAL"] as const).map((t) => {
            const b = incidents.averages?.[t]
            return (
              <div key={t}>
                <p className="text-2xl font-bold text-[#374192] leading-none">{b?.avg == null ? "—" : b.avg.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</p>
                <p className="text-xs text-[#666666] mt-1">média {t === "MAIN" ? "do Centro" : "dos Adicionais"} (faltas/dia trabalhado)</p>
              </div>
            )
          })}
          <Link
            href="/dashboard/lista-atencao"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#374192] hover:underline sm:ml-auto"
          >
            Abrir painel de faltas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </Section>
    </div>
  )
}
