"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ReasonModalProps {
  isOpen: boolean
  onClose: () => void
  participantName: string
  reason: string
}

export function ReasonModal({ isOpen, onClose, participantName, reason }: ReasonModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Motivo da Ausência</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm font-medium mb-2">{participantName}</p>
          <p className="text-sm text-gray-700">{reason}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
