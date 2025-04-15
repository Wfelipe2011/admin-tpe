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
    <LoginContainer>
      {errorMessage && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">{errorMessage}</div>}
      <LoginForm />
    </LoginContainer>
  )
}
