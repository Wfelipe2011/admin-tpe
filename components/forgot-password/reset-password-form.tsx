"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { setAuthToken } from "@/lib/auth-utils"
import axios from "axios"

interface ResetPasswordFormProps {
  phone: string
  token: string
  onSuccess: () => void
  onBack: () => void
}

export function ResetPasswordForm({ phone, token, onSuccess, onBack }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    try {
      // Use apiClient with custom headers for the token
      await apiClient.post(
        "/auth/reset-password",
        {
          phone,
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // After successful password reset, login with the new credentials
      try {
        const loginResponse = await apiClient.post("/auth/login", {
          phone,
          password,
        })

        if (loginResponse.token) {
          // Store the token
          setAuthToken(loginResponse.token)

          // Call onSuccess to show success message
          onSuccess()

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 2000)
        }
      } catch (loginErr) {
        console.error("Auto login error:", loginErr)
        // Even if auto-login fails, we still consider the password reset successful
        onSuccess()
      }
    } catch (err) {
      console.error("Password reset error:", err)

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
        <Label htmlFor="password">Nova Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirme sua nova senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

      <div className="flex flex-col space-y-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Redefinindo..." : "Redefinir Senha"}
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
