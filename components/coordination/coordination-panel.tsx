"use client"

import { useState } from "react"
import { History, LayoutDashboard, ListChecks, Settings2, ShieldCheck, Users } from "lucide-react"
import { OverviewTab } from "@/components/coordination/overview-tab"
import { PeopleTab } from "@/components/coordination/people-tab"
import { AuditTab } from "@/components/coordination/audit-tab"
import { SettingsTab } from "@/components/coordination/settings-tab"
import { MenuPermissionsTab } from "@/components/coordination/menu-permissions-tab"

type TabId = "overview" | "people" | "menu" | "settings" | "audit"

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Visão geral", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "people", label: "Pessoas e perfis", icon: <Users className="h-4 w-4" /> },
  { id: "menu", label: "Menu por perfil", icon: <ListChecks className="h-4 w-4" /> },
  { id: "settings", label: "Configurações", icon: <Settings2 className="h-4 w-4" /> },
  { id: "audit", label: "Histórico de ações", icon: <History className="h-4 w-4" /> },
]

export function CoordinationPanel() {
  const [tab, setTab] = useState<TabId>("overview")

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
            onClick={() => setTab(t.id)}
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
      {tab === "people" && <PeopleTab />}
      {tab === "menu" && <MenuPermissionsTab />}
      {tab === "settings" && <SettingsTab />}
      {tab === "audit" && <AuditTab />}
    </div>
  )
}
