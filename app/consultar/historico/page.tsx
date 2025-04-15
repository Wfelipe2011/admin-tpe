"use client"
import { ProtectedLayout } from "@/app/layout-protected"
import { HistoricoDesignacao } from "@/components/consultar/historico-designacao"

export default function HistoricoPage() {
  return (
    <ProtectedLayout
      title="Consultar"
      breadcrumbs={[{ label: "Histórico de Designações" }]}
    >
      <HistoricoDesignacao />
    </ProtectedLayout>
  )
}
