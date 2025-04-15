"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export function SuccessMessage() {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>

      <p className="text-gray-600">
        Sua senha foi alterada com sucesso. Você será redirecionado para o dashboard em instantes.
      </p>

      <div className="pt-4">
        <Link href="/dashboard">
          <Button className="w-full">Ir para o Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
