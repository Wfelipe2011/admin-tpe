"use client"

import { Suspense } from "react"
import { ProtectedLayout } from "@/app/layout-protected"
import { CoordinationPanel } from "@/components/coordination/coordination-panel"

export default function CoordenacaoPage() {
    const breadcrumbs = [{ label: "Início", href: "/" }, { label: "Coordenação" }]

    return (
        <ProtectedLayout title="Coordenação" breadcrumbs={breadcrumbs}>
            <Suspense fallback={null}>
                <CoordinationPanel />
            </Suspense>
        </ProtectedLayout>
    )
}
