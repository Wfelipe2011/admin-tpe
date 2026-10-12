"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { serverApiClient } from "@/lib/api-client.server"
import axios from "axios"

interface LoginResponse {
  token: string
  user?: { id: string; name: string; [key: string]: unknown }
  error?: string
}

export async function loginAction(formData: FormData): Promise<LoginResponse> {
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string
  if (!phone || !password) {
    return { token: "", error: "Telefone e senha são obrigatórios" }
  }

  try {
    const { data } = await serverApiClient.post<LoginResponse>("/auth/login", { phone, password })
    const cookieStore = await cookies()
    cookieStore.set({
      name: "auth_token",
      value: data.token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    })
    return { token: data.token, user: data.user }
  } catch (error) {
    return {
      token: "",
      error: axios.isAxiosError(error)
        ? error.response?.data?.message || "Falha na autenticação"
        : "Erro ao processar a solicitação",
    }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
  redirect("/login")
}
