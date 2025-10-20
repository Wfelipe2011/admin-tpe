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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <Label htmlFor="phone" className="text-[#333333] font-semibold text-sm">
          Número de Telefone
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(00) 00000-0000"
          className="h-12 text-base border-gray-200 focus:border-[#374192] focus:ring-[#374192]/20 rounded-lg transition-colors shadow-sm"
          value={phoneDisplay}
          onChange={handlePhoneChange}
          required
        />
      </div>

      {error && (
        <div className="bg-[#E74C3C]/10 border border-[#E74C3C]/20 text-[#E74C3C] p-6 rounded-xl text-sm font-medium shadow-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#374192] hover:bg-[#46607F] text-white font-semibold rounded-lg transition-colors shadow-sm"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando...
            </div>
          ) : (
            "Enviar Código"
          )}
        </Button>

        <Link
          href="/login"
          className="flex items-center justify-center text-sm text-[#374192] hover:text-[#46607F] font-medium transition-colors gap-2 py-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o login
        </Link>
      </div>
    </form>
  )
}
