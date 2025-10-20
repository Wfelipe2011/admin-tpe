"use client"

import { LoginForm } from "@/components/login-form"
import { AuthLayout } from "@/components/auth-layout"

interface LoginContainerProps {
  children: React.ReactNode
}

export function LoginContainer({ children }: LoginContainerProps) {
  return (
    <AuthLayout title="Login" subtitle="Insira suas informações para realizar o login">
      {children}
    </AuthLayout>
  )
}
