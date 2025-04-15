"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface CancellationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (justification: string) => void
}

export const CancellationModal = React.memo(({ open, onOpenChange, onConfirm }: CancellationModalProps) => {
  const [justification, setJustification] = useState("")

  const handleConfirm = () => {
    onConfirm(justification)
    setJustification("") // Reset after confirmation
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancelar Designação</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-700 mb-4">Por favor, informe o motivo do cancelamento da designação:</p>
          <textarea
            className="w-full p-2 border rounded-md text-sm"
            rows={4}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Motivo do cancelamento..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Voltar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!justification.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Confirmar Cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
