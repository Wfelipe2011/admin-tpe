"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface AlertAbsentParticipantProps {
  showButton: boolean
  close: () => void
  submit: (reason: string) => Promise<void>
}

export function AlertAbsentParticipant({ showButton, close, submit }: AlertAbsentParticipantProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) return

    setIsSubmitting(true)
    try {
      await submit(reason)
      close()
      setReason("")
    } catch (error) {
      console.error("Error submitting absence:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={showButton} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-[#333333]">
            Justificar Ausência
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-[#666666] leading-relaxed">
            Por favor, informe o motivo da sua ausência:
          </p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Digite o motivo da sua ausência..."
            className="min-h-[120px] border-gray-200 focus:border-[#374192] focus:ring-[#374192]/20 resize-none"
            rows={4}
          />
        </div>

        <DialogFooter className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={close}
            disabled={isSubmitting}
            className="border-gray-300 text-[#666666] hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            className="bg-[#E74C3C] hover:bg-[#C0392B] text-white"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enviando...
              </div>
            ) : (
              "Enviar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
