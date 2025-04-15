"use client"

import { ProtectedLayout } from "@/app/layout-protected"
import { DesignationList } from "@/components/designation/designation-list"

export default function ListaDesignacaoPage() {
  return (
    <ProtectedLayout title="Lista para Designação" breadcrumbs={[{ label: "Lista para Designação" }]}>
      <DesignationList />
    </ProtectedLayout>
  )
}
