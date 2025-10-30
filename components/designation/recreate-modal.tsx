"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface RecreateModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export const RecreateModal: React.FC<RecreateModalProps> = ({ open, onOpenChange, onConfirm }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Recriar Designação
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-gray-700">
                        Tem certeza que deseja recriar a designação?
                        <br />
                        <br />
                        <span className="font-semibold text-amber-600">
                            Esta ação irá excluir a designação atual e criar uma nova designação vazia.
                        </span>
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onOpenChange(false)
                            onConfirm()
                        }}
                    >
                        Recriar Designação
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
