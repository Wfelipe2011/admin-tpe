"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import axios from "axios"

// Phone mask function
function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, "")

  if (digits.length === 0) return ""

  // Format the phone number
  if (digits.length <= 2) {
    return `(${digits}`
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  } else if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  } else {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }
}

interface ForgotPasswordFormProps {
  onSuccess: (phone: string) => void
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phoneDisplay, setPhoneDisplay] = useState("")
  const [phoneRaw, setPhoneRaw] = useState("")

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formattedValue = formatPhoneNumber(inputValue)
    const rawValue = inputValue.replace(/\D/g, "")

    setPhoneDisplay(formattedValue)
    setPhoneRaw(rawValue)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!phoneRaw) {
      setError("O número de telefone é obrigatório")
      setIsLoading(false)
      return
    }

    try {
      // Use apiClient for the recover password request
      await apiClient.post("/auth/recover-password", {
        phone: phoneRaw,
      })

      // If successful, call the onSuccess callback with the phone number
      onSuccess(phoneRaw)
    } catch (err) {
      console.error("Password recovery error:", err)

      // Handle different types of Axios errors
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const errorMessage =
            err.response.data?.message ||
            err.response.data?.error ||
            `Erro ${err.response.status}: ${err.response.statusText}`
          setError(`Erro: ${errorMessage}`)
        } else if (err.request) {
          setError(
            "Não foi possível conectar ao servidor. Verifique sua conexão de internet ou tente novamente mais tarde.",
          )
        } else {
          setError(`Erro ao processar a solicitação: ${err.message}`)
        }
      } else {
        setError(`Erro: ${err instanceof Error ? err.message : "Erro desconhecido"}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Número de Telefone</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(00) 00000-0000"
          value={phoneDisplay}
          onChange={handlePhoneChange}
          required
        />
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

      <div className="flex flex-col space-y-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Enviar Código"}
        </Button>

        <Link href="/login" className="flex items-center justify-center text-sm text-gray-600 hover:text-primary mt-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar para o login
        </Link>
      </div>
    </form>
  )
}
