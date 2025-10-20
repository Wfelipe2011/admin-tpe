"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export function SuccessMessage() {
  return (
    <div className="text-center space-y-8">
      <div className="flex justify-center">
        <CheckCircle className="h-20 w-20 text-[#2ECC71]" />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#333333]">Senha redefinida com sucesso!</h3>
        <p className="text-[#666666] leading-relaxed">
          Sua senha foi alterada com sucesso. Você será redirecionado para o dashboard em instantes.
        </p>
      </div>

      <div className="pt-4">
        <Link href="/dashboard">
          <Button className="w-full h-12 bg-[#374192] hover:bg-[#46607F] text-white font-semibold rounded-lg transition-colors shadow-sm">
            Ir para o Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
