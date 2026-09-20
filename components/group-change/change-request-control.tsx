"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { ArrowLeftRight } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { CHANGE_REASON_LABEL, slotsLabel, type ChangeRequestSummary } from "@/lib/group-change"
import { ChangeRequestDialog } from "@/components/group-change/change-request-dialog"

/**
 * Selo + ações do pedido de troca de um voluntário: sem pedido mostra "Quer trocar de grupo" (abre o
 * formulário); com pedido mostra o selo (dia/horário, motivo) e permite cancelar.
 */
export function ChangeRequestControl({
  participantId,
  participantName,
  request,
  onChanged,
  compact = false,
}: {
  participantId: string
  participantName: string
  request: ChangeRequestSummary | null | undefined
  onChanged: () => void
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [busy, setBusy] = useState(false)

  const cancel = async () => {
    if (!request) return
    setBusy(true)
    try {
      await apiClient.delete(`/group-change-requests/${request.id}`, { endpoint: "new" })
      toast.success("Pedido de troca cancelado")
      setConfirmCancel(false)
      onChanged()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Não foi possível cancelar o pedido")
    } finally {
      setBusy(false)
    }
  }

  if (!request) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`inline-flex items-center gap-1 font-medium text-[#374192] hover:underline ${compact ? "text-[11px]" : "text-xs"}`}
        >
          <ArrowLeftRight className="h-3 w-3" />
          Quer trocar de grupo
        </button>
        <ChangeRequestDialog participantId={participantId} participantName={participantName} open={open} onClose={() => setOpen(false)} onSaved={onChanged} />
      </>
    )
  }

  return (
    <div className={`rounded-md border border-amber-300 bg-amber-50 text-amber-900 ${compact ? "px-1.5 py-1 text-[11px]" : "px-2 py-1.5 text-xs"}`}>
      <div className="flex items-start gap-1.5">
        <ArrowLeftRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-amber-600" />
        <span>
          <strong>Quer trocar</strong> · {slotsLabel(request.desiredSlots)} · {CHANGE_REASON_LABEL[request.reason] ?? request.reason}
          {request.note ? <span className="block text-amber-800/80">“{request.note}”</span> : null}
        </span>
      </div>
      <div className="mt-1 ml-[18px]">
        {confirmCancel ? (
          <span className="flex items-center gap-2">
            Cancelar o pedido?
            <button className="font-semibold underline disabled:opacity-50" onClick={cancel} disabled={busy}>
              Sim
            </button>
            <button className="underline" onClick={() => setConfirmCancel(false)}>
              Não
            </button>
          </span>
        ) : (
          <button className="underline underline-offset-2 hover:text-amber-950" onClick={() => setConfirmCancel(true)}>
            Cancelar pedido
          </button>
        )}
      </div>
    </div>
  )
}
