"use client"
import { ProtectedLayout } from "@/app/layout-protected"
import { HistoricoDesignacao } from "@/components/consultar/historico-designacao"
import { Search } from "lucide-react"

export default function HistoricoPage() {
  return (
    <ProtectedLayout title="Consultar" breadcrumbs={[{ label: "Histórico de Designações" }]}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#181C43] to-[#374192] rounded-lg p-8 text-white mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold mb-2">Histórico de Designações</h1>
            <p className="text-blue-100 text-sm">
              Consulte e visualize o histórico completo das designações realizadas
            </p>
          </div>
        </div>
      </div>

      <HistoricoDesignacao />
    </ProtectedLayout>
  )
}
