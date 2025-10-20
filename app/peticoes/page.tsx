"use client"

import { ProtectedLayout } from "@/app/layout-protected"
import { PetitionList } from "@/components/petition/petition-list"
import { FileText } from "lucide-react"

export default function PetitionsPage() {
  return (
    <ProtectedLayout title="Petições" breadcrumbs={[{ label: "Petições" }]}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#181C43] to-[#374192] rounded-lg p-8 text-white mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold mb-2">Gerenciamento de Petições</h1>
            <p className="text-blue-100 text-sm">
              Visualize, gerencie e processe as petições enviadas ao sistema
            </p>
          </div>
        </div>
      </div>

      <PetitionList />
    </ProtectedLayout>
  )
}
