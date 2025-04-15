"use server"

import axios from "axios"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

interface LoginCredentials {
  phone: string
  password: string
}

interface LoginResponse {
  token: string
  user?: {
    id: string
    name: string
    [key: string]: any
  }
  error?: string
}

export async function loginAction(formData: FormData): Promise<LoginResponse> {
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string

  if (!phone || !password) {
    return {
      token: "",
      error: "Telefone e senha são obrigatórios",
    }
  }

  try {
    const response = await axios.post(
      "https://api.tpedigital.com.br/dev/auth/login",
      { phone, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    const data = response.data

    // Set the auth token in a cookie
    cookies().set({
      name: "auth_token",
      value: data.token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    })

    return {
      token: data.token,
      user: data.user,
    }
  } catch (error) {
    console.error("Login error:", error)

    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          token: "",
          error: error.response.data?.message || "Falha na autenticação",
        }
      }
    }

    return {
      token: "",
      error: "Erro ao processar a solicitação",
    }
  }
}

export async function logoutAction() {
  cookies().delete("auth_token")
  redirect("/login")
}
