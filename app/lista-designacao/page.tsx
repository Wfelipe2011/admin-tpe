"use client"

import { ProtectedLayout } from "@/app/layout-protected"
import { DesignationList } from "@/components/designation/designation-list"
import { ClipboardList } from "lucide-react"

export default function ListaDesignacaoPage() {
  return (
    <ProtectedLayout title="Lista para Designação" breadcrumbs={[{ label: "Lista para Designação" }]}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#181C43] to-[#374192] rounded-lg p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold mb-2">Lista para Designação</h1>
              <p className="text-blue-100 text-sm">
                Gerencie e organize as designações dos participantes para as atividades
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <DesignationList />
        </div>
      </div>
    </ProtectedLayout>
  )
}
