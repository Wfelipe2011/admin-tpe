"use client"

import { useState } from "react"
import { ForgotPasswordForm } from "@/components/forgot-password/forgot-password-form"
import { VerifyCodeForm } from "@/components/forgot-password/verify-code-form"
import { ResetPasswordForm } from "@/components/forgot-password/reset-password-form"
import { SuccessMessage } from "@/components/forgot-password/success-message"
import { AuthLayout } from "@/components/auth-layout"

type RecoveryStep = "request" | "verify" | "reset" | "success"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<RecoveryStep>("request")
  const [phone, setPhone] = useState("")
  const [tempToken, setTempToken] = useState("")

  // Define title and subtitle based on current step
  const getStepContent = () => {
    switch (step) {
      case "request":
        return {
          title: "Recuperação de Senha",
          subtitle: "Informe seu número de telefone para receber um código de verificação",
        }
      case "verify":
        return {
          title: "Verificação de Código",
          subtitle: "Digite o código de 6 dígitos enviado para seu WhatsApp",
        }
      case "reset":
        return {
          title: "Nova Senha",
          subtitle: "Crie uma nova senha para sua conta",
        }
      case "success":
        return {
          title: "Senha Redefinida",
          subtitle: "",
        }
    }
  }

  const { title, subtitle } = getStepContent()

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      {step === "request" && (
        <ForgotPasswordForm
          onSuccess={(phoneNumber) => {
            setPhone(phoneNumber)
            setStep("verify")
          }}
        />
      )}

      {step === "verify" && (
        <VerifyCodeForm
          phone={phone}
          onSuccess={(token) => {
            setTempToken(token)
            setStep("reset")
          }}
          onBack={() => setStep("request")}
        />
      )}

      {step === "reset" && (
        <ResetPasswordForm
          phone={phone}
          token={tempToken}
          onSuccess={() => setStep("success")}
          onBack={() => setStep("verify")}
        />
      )}

      {step === "success" && <SuccessMessage />}
    </AuthLayout>
  )
}
