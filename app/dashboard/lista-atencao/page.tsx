"use client"

import { ProtectedLayout } from "@/app/layout-protected"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function ListaAtencaoDashboardPage() {
    const breadcrumbs = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Lista de Atenção" },
    ]

    return (
        <ProtectedLayout title="Dashboard - Lista de Atenção" breadcrumbs={breadcrumbs}>
            <div className="space-y-2">
                <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <div className="relative w-full h-[1000px]">
                            <iframe
                                src="https://lookerstudio.google.com/embed/reporting/5b6074d9-36b4-4479-8bc8-701426daf94b/page/TSdXE"
                                className="absolute inset-0 w-full h-full border-0"
                                allowFullScreen
                                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                                title="Looker Studio - Lista de Atenção"
                            ></iframe>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedLayout>
    )
}
