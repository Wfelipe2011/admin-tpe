"use client"

import { ProtectedLayout } from "@/app/layout-protected"
import { IncidentsPanel } from "@/components/dashboard/incidents-panel"

export default function ListaAtencaoDashboardPage() {
    const breadcrumbs = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Lista de Atenção" },
    ]

    return (
        <ProtectedLayout title="Lista de Atenção" breadcrumbs={breadcrumbs}>
            <IncidentsPanel />
        </ProtectedLayout>
    )
}
