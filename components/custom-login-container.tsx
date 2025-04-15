"use client"

import { LoginForm } from "@/components/login-form"
import { AuthLayout } from "@/components/auth-layout"

export function CustomLoginContainer() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
