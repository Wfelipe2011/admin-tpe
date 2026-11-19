"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Coffee, History, LayoutDashboard, ListChecks, Repeat, Send, Settings2, ShieldCheck, Users } from "lucide-react"
import { SendTab } from "@/components/coordination/send-tab"
import { SupplyTab } from "@/components/coordination/supply-tab"
import { OverviewTab } from "@/components/coordination/overview-tab"
import { PeopleTab } from "@/components/coordination/people-tab"
import { AuditTab } from "@/components/coordination/audit-tab"
import { SettingsTab } from "@/components/coordination/settings-tab"
import { MenuPermissionsTab } from "@/components/coordination/menu-permissions-tab"
import { TurnoverTab } from "@/components/coordination/turnover-tab"

type TabId = "overview" | "people" | "turnover" | "send" | "supply" | "menu" | "settings" | "audit"

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Visão geral", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "people", label: "Pessoas e perfis", icon: <Users className="h-4 w-4" /> },
  { id: "turnover", label: "Rotatividade", icon: <Repeat className="h-4 w-4" /> },
  { id: "send", label: "Envio de mensagens", icon: <Send className="h-4 w-4" /> },
  { id: "supply", label: "Café e limpeza", icon: <Coffee className="h-4 w-4" /> },
  { id: "menu", label: "Menu por perfil", icon: <ListChecks className="h-4 w-4" /> },
  { id: "settings", label: "Configurações", icon: <Settings2 className="h-4 w-4" /> },
  { id: "audit", label: "Histórico de ações", icon: <History className="h-4 w-4" /> },
]

export function CoordinationPanel() {
  // links da Visão geral abrem a aba certa já filtrada (ex.: /coordenacao?tab=people&training=none)
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab")
  const [tab, setTab] = useState<TabId>(TABS.some((t) => t.id === tabParam) ? (tabParam as TabId) : "overview")
  // o link da Visão geral aponta para esta mesma página: acompanhar a mudança de endereço
  useEffect(() => {
    if (tabParam && TABS.some((t) => t.id === tabParam)) setTab(tabParam as TabId)
  }, [tabParam, searchParams])
  const initialPeopleFilters = {
    training: searchParams.get("training") === "none" || searchParams.get("training") === "has" ? (searchParams.get("training") as "none" | "has") : "",
    petitionStatus: searchParams.get("petitionStatus") ?? "",
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#181C43] to-[#374192] rounded-xl p-4 sm:p-6 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/15 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">Coordenação</h1>
            <p className="text-blue-100 text-xs sm:text-sm">Visão do TPE inteiro e ajustes gerais — só para coordenadores</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id)
              // mantém o endereço em sincronia com a aba (assim os links da Visão geral sempre funcionam)
              router.replace(t.id === "overview" ? "/coordenacao" : `/coordenacao?tab=${t.id}`, { scroll: false })
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-[#374192] text-[#374192]" : "border-transparent text-[#666666] hover:text-[#333333]"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "people" && <PeopleTab key={searchParams.toString()} initialFilters={initialPeopleFilters} />}
      {tab === "turnover" && <TurnoverTab />}
      {tab === "send" && <SendTab />}
      {tab === "supply" && <SupplyTab />}
      {tab === "menu" && <MenuPermissionsTab />}
      {tab === "settings" && <SettingsTab />}
      {tab === "audit" && <AuditTab />}
    </div>
  )
}
