"use client"

import { ProtectedLayout } from "@/app/layout-protected"
import { PetitionList } from "@/components/petition/petition-list"
import { FileText } from "lucide-react"

export default function PetitionsPage() {
  return (
    <ProtectedLayout title="Petições" breadcrumbs={[{ label: "Petições" }]}>
      {/* Header Section - Mobile optimized */}
      <div className="bg-gradient-to-r from-[#181C43] to-[#374192] rounded-lg p-4 sm:p-8 text-white mb-4 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2">Gerenciamento de Petições</h1>
            <p className="text-blue-100 text-xs sm:text-sm">
              Visualize, gerencie e processe as petições enviadas ao sistema
            </p>
          </div>
        </div>
      </div>

      <PetitionList />
    </ProtectedLayout>
  )
}
