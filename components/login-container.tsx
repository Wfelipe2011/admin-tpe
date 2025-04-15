"use client"

import { LoginForm } from "@/components/login-form"
import { AuthLayout } from "@/components/auth-layout"

export function LoginContainer() {
  return (
    <AuthLayout title="Login" subtitle="Insira suas informações para realizar o login">
      <LoginForm />
    </AuthLayout>
  )
}
