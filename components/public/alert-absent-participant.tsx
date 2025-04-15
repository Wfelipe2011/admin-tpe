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
    } catch (error) {
      console.error("Error submitting absence:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={showButton} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Justificar Ausência</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-500">Por favor, informe o motivo da sua ausência:</p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Digite o motivo da sua ausência..."
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            className="bg-[#c34a4a] hover:bg-[#b43e3e] text-white"
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
