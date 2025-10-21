"use client"

import { useSearchParams } from "next/navigation"
import { LoginContainer } from "@/components/login-container"
import { LoginForm } from "@/components/login-form"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const error = searchParams.get("error")
    if (error === "unauthorized") {
      setErrorMessage("Você não tem permissão para acessar o sistema.")
    } else if (error === "missing") {
      setErrorMessage("Sessão expirada. Por favor, faça login novamente.")
    }
  }, [searchParams])

  return (
    <>
      {errorMessage && (
        <div className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#E74C3C]/10 border border-[#E74C3C]/20 text-[#E74C3C] p-3 sm:p-6 rounded-xl text-xs sm:text-sm font-medium shadow-lg max-w-sm sm:max-w-md w-full mx-2 sm:mx-4">
          {errorMessage}
        </div>
      )}
      <LoginContainer>
        <LoginForm />
      </LoginContainer>
    </>
  )
}
