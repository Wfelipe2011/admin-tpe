"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import axios from "axios"

interface VerifyCodeFormProps {
  phone: string
  onSuccess: (token: string) => void
  onBack: () => void
}

export function VerifyCodeForm({ phone, onSuccess, onBack }: VerifyCodeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(6).fill(""))

  // Create refs for each input
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6)
  }, [])

  // Handle input change for a specific digit
  const handleDigitChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return

    // Update the digit at the specified index
    const newCodeDigits = [...codeDigits]
    newCodeDigits[index] = value.slice(0, 1) // Only take the first character
    setCodeDigits(newCodeDigits)

    // If a digit was entered and there's a next input, focus it
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle key down events for navigation between inputs
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // If backspace is pressed on an empty input, focus the previous input
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    // Arrow left/right navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle paste event to distribute digits across inputs
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")
    const digits = pastedData.replace(/\D/g, "").slice(0, 6).split("")

    const newCodeDigits = [...codeDigits]
    digits.forEach((digit, index) => {
      if (index < 6) {
        newCodeDigits[index] = digit
      }
    })

    setCodeDigits(newCodeDigits)

    // Focus the next empty input or the last input if all are filled
    const nextEmptyIndex = newCodeDigits.findIndex((digit) => !digit)
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus()
    } else if (digits.length > 0) {
      inputRefs.current[Math.min(digits.length - 1, 5)]?.focus()
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const code = codeDigits.join("")

    if (code.length !== 6) {
      setError("O código deve ter 6 dígitos")
      setIsLoading(false)
      return
    }

    try {
      // Use apiClient to verify the code
      const response = await apiClient.post("/auth/login-code", {
        phone,
        code,
      })

      // If successful, call the onSuccess callback with the token
      if (response.token) {
        onSuccess(response.token)
      } else {
        throw new Error("Token não recebido do servidor")
      }
    } catch (err) {
      console.error("Code verification error:", err)

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
        <Label htmlFor="code-0">Código de Verificação</Label>

        <div className="flex items-center justify-between gap-2">
          {codeDigits.map((digit, index) => (
            <div key={index} className="relative flex-1">
              <Input
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                ref={(el) => (inputRefs.current[index] = el)}
                className="text-center text-xl font-semibold h-14"
                maxLength={1}
                autoComplete="one-time-code"
                required
              />
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 mt-1">Um código de 6 dígitos foi enviado para o seu WhatsApp</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

      <div className="flex flex-col space-y-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Verificando..." : "Verificar Código"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="flex items-center justify-center text-sm mt-2"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>
      </div>
    </form>
  )
}
