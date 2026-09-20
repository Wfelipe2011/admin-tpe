"use client"

import { ProtectedLayout } from "@/app/layout-protected"
import { CoordinationPanel } from "@/components/coordination/coordination-panel"

export default function CoordenacaoPage() {
    const breadcrumbs = [{ label: "Início", href: "/" }, { label: "Coordenação" }]

    return (
        <ProtectedLayout title="Coordenação" breadcrumbs={breadcrumbs}>
            <CoordinationPanel />
        </ProtectedLayout>
    )
}
