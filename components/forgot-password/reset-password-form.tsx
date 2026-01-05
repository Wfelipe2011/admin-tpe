"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { setAuthToken, removeAuthToken } from "@/lib/auth-utils"
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
        // Clear any old token before logging in with new credentials
        removeAuthToken()

        const loginResponse = await apiClient.post("/auth/login", {
          phone,
          password,
        }) as { token?: string }

        if (loginResponse.token) {
          console.log("Setting new token after reset")
          // Store the new token
          setAuthToken(loginResponse.token)

          // Call onSuccess to show success message
          onSuccess()

          // Force a full refresh to ensure all states are reset
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 1500)
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <Label htmlFor="password" className="text-[#333333] font-semibold text-sm">Nova Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua nova senha"
            className="h-12 text-base border-gray-200 focus:border-[#374192] focus:ring-[#374192]/20 rounded-lg transition-colors shadow-sm pr-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#374192] transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <Label htmlFor="confirmPassword" className="text-[#333333] font-semibold text-sm">Confirmar Senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirme sua nova senha"
          className="h-12 text-base border-gray-200 focus:border-[#374192] focus:ring-[#374192]/20 rounded-lg transition-colors shadow-sm"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <div className="bg-[#E74C3C]/10 border border-[#E74C3C]/20 text-[#E74C3C] p-6 rounded-xl text-sm font-medium shadow-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col space-y-4">
        <Button type="submit" disabled={isLoading} className="w-full h-12 bg-[#374192] hover:bg-[#46607F] text-white font-semibold rounded-lg transition-colors shadow-sm">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Redefinindo...
            </div>
          ) : (
            "Redefinir Senha"
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="flex items-center justify-center text-sm text-[#374192] hover:text-[#46607F] font-medium transition-colors py-3"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    </form>
  )
}
