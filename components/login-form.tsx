"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { setAuthToken, getAuthToken, isAuthenticated, removeAuthToken } from "@/lib/auth-utils"
import axios from "axios"
import { getUserFromToken } from "@/lib/auth-utils"
import { ParticipantProfile } from "@/types"

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

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phoneDisplay, setPhoneDisplay] = useState("")
  const [phoneRaw, setPhoneRaw] = useState("")
  const [password, setPassword] = useState("")
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [redirectCountdown, setRedirectCountdown] = useState(0)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formattedValue = formatPhoneNumber(inputValue)
    const rawValue = inputValue.replace(/\D/g, "")

    setPhoneDisplay(formattedValue)
    setPhoneRaw(rawValue)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  // Handle countdown and redirect after successful login
  useEffect(() => {
    if (!loginSuccess) return

    if (redirectCountdown <= 0) {
      router.push("/dashboard")
      return
    }

    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [loginSuccess, redirectCountdown, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!phoneRaw || !password) {
      setError("Telefone e senha são obrigatórios")
      setIsLoading(false)
      return
    }

    try {
      console.log("Attempting login with:", { phone: phoneRaw })

      // Use the apiClient for login
      const response = await apiClient.post("/auth/login", {
        phone: phoneRaw,
        password: password,
      })

      console.log("Login successful, response:", response)

      // Store the token using multiple mechanisms
      if (response.token) {
        setAuthToken(response.token)
        console.log("Token stored in multiple storage mechanisms")

        // Verify the token was properly stored
        setTimeout(() => {
          const storedToken = getAuthToken()
          const authenticated = isAuthenticated()

          console.log("Stored token verification:", !!storedToken)
          console.log("Authentication check:", authenticated)

          if (!storedToken || !authenticated) {
            setError("Falha ao armazenar o token de autenticação. Por favor, tente novamente.")
            setIsLoading(false)
            return
          }

          // Check if user is a PARTICIPANT (not allowed to login)
          const userInfo = getUserFromToken()
          if (userInfo && userInfo.profile === ParticipantProfile.PARTICIPANT) {
            setError("Seu perfil não tem permissão para acessar o sistema.")
            removeAuthToken() // Remove the token since they can't access the system
            setIsLoading(false)
            return
          }

          // If token is properly stored, show success message and start countdown
          setLoginSuccess(true)
          setRedirectCountdown(3) // Set countdown to 3 seconds
          setIsLoading(false)
        }, 500)
      } else {
        throw new Error("No token received from the server")
      }
    } catch (err) {
      console.error("Login error details:", err)

      // Handle different types of Axios errors
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const errorMessage =
            err.response.data?.message ||
            err.response.data?.error ||
            `Erro ${err.response.status}: ${err.response.statusText}`
          setError(`Erro de autenticação: ${errorMessage}`)
        } else if (err.request) {
          // The request was made but no response was received
          setError(
            "Não foi possível conectar ao servidor. Verifique sua conexão de internet ou tente novamente mais tarde.",
          )
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(`Erro ao processar a solicitação: ${err.message}`)
        }
      } else {
        // Handle non-Axios errors
        setError(`Erro de autenticação: ${err instanceof Error ? err.message : "Erro desconhecido"}`)
      }
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      {loginSuccess ? (
        <div className="bg-green-50 text-green-600 p-4 rounded-md text-center">
          <p className="font-medium mb-2">Login realizado com sucesso!</p>
          <p>Redirecionando para o dashboard em {redirectCountdown} segundos...</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-lg">
              Telefone
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="(00) 00000-0000"
              className="h-12 text-lg"
              value={phoneDisplay}
              onChange={handlePhoneChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-lg">
              Senha
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Digite sua senha"
              className="h-12 text-lg"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

          <Button type="submit" className="w-full h-14 text-lg uppercase font-medium" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>

          <div className="text-center">
            <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm">
              Esqueci minha senha
            </Link>
          </div>
        </>
      )}
    </form>
  )
}
