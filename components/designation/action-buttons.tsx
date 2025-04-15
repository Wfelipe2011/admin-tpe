"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, Check, X } from "lucide-react"
import type { Assignment } from "@/types/designation-participants"

interface ActionButtonsProps {
  status: string
  onCancel: () => void
  onCopyLink: () => void
  onSend: () => void
  copyStatus: "able" | "copied" | "error"
  isOptional: boolean
  setIsOptional: (value: boolean) => void
  assignments: Assignment[]
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  status,
  onCancel,
  onCopyLink,
  onSend,
  copyStatus,
  isOptional,
  setIsOptional,
  assignments,
}) => {
  const CopyStatusIcon = {
    able: <Copy className="h-4 w-4" />,
    copied: <Check className="h-4 w-4 text-green-500" />,
    error: <X className="h-4 w-4 text-red-500" />,
  }

  return (
    <div className="flex flex-col xs:flex-row sm:flex-row justify-between items-center gap-2 sm:gap-4 pt-2 sm:pt-4">
      {(status === "OPEN" || status === "IN_PROGRESS") && (
        <Button
          variant="outline"
          className="text-red-600 border-red-600 hover:bg-red-50 w-full xs:w-auto sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
          onClick={onCancel}
        >
          Cancelar Designação
        </Button>
      )}

      {status === "IN_PROGRESS" && (
        <Button
          variant="outline"
          className="flex items-center gap-1 sm:gap-2 w-full xs:w-auto sm:w-auto justify-center text-xs sm:text-sm h-9 sm:h-10"
          onClick={onCopyLink}
        >
          {CopyStatusIcon[copyStatus]}
          <span className="hidden sm:inline">Copiar Link para Visualização</span>
          <span className="sm:hidden">Copiar Link</span>
        </Button>
      )}

      {status === "OPEN" && (
        <div className="flex flex-col xs:items-end sm:items-end gap-2 w-full xs:w-auto sm:w-auto">
          <Button
            onClick={onSend}
            disabled={assignments.some((a) => Boolean(a.error))}
            className="w-full xs:w-auto sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
          >
            Disparar Designação
          </Button>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="optional-presence"
              checked={isOptional}
              onCheckedChange={(checked) => setIsOptional(!!checked)}
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
            />
            <label
              htmlFor="optional-presence"
              className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Presença Opcional
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
