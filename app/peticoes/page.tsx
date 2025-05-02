"use client"

import { ProtectedLayout } from "@/app/layout-protected"
import { PetitionList } from "@/components/petition/petition-list"

export default function PetitionsPage() {
  return (
    <ProtectedLayout title="Petições" breadcrumbs={[{ label: "Petições" }]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Gerenciamento de Petições</h1>
        <p className="text-muted-foreground">Visualize e gerencie as petições enviadas ao sistema.</p>
        <PetitionList />
      </div>
    </ProtectedLayout>
  )
}
