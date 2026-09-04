"use client"

import { ProtectedLayout } from "@/app/layout-protected"
import { WaitlistPanel } from "@/components/waitlist/waitlist-panel"

export default function ListaEsperaPage() {
    const breadcrumbs = [{ label: "Início", href: "/" }, { label: "Lista de Espera" }]

    return (
        <ProtectedLayout title="Lista de Espera" breadcrumbs={breadcrumbs}>
            <WaitlistPanel />
        </ProtectedLayout>
    )
}
