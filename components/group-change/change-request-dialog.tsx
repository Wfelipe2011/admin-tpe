"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CHANGE_REASON_LABEL, PERIODS, PERIOD_LABEL, WEEKDAY_FULL, type DesiredSlot } from "@/lib/group-change"

const NOTE_MAX = 300

function SlotPicker({ value, onChange }: { value: DesiredSlot[]; onChange: (next: DesiredSlot[]) => void }) {
  const has = (weekDay: number, period: DesiredSlot["period"]) => value.some((s) => s.weekDay === weekDay && s.period === period)
  const toggle = (weekDay: number, period: DesiredSlot["period"]) =>
    onChange(has(weekDay, period) ? value.filter((s) => !(s.weekDay === weekDay && s.period === period)) : [...value, { weekDay, period }])

  return (
    <div className="rounded-lg border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-[1fr_repeat(3,72px)] bg-gray-50 text-[11px] font-medium text-[#666666]">
        <span className="px-3 py-1.5">Dia</span>
        {PERIODS.map((p) => (
          <span key={p} className="px-1 py-1.5 text-center">
            {PERIOD_LABEL[p]}
          </span>
        ))}
      </div>
      {WEEKDAY_FULL.map((day, weekDay) => (
        <div key={day} className="grid grid-cols-[1fr_repeat(3,72px)] items-center border-t border-gray-50 text-sm">
          <span className="px-3 py-1.5 text-[#333333]">{day}</span>
          {PERIODS.map((p) => (
            <div key={p} className="flex justify-center py-1">
              <button
                type="button"
                aria-pressed={has(weekDay, p)}
                aria-label={`${day} ${PERIOD_LABEL[p]}`}
                onClick={() => toggle(weekDay, p)}
                className={`h-6 w-11 rounded-md text-[11px] font-semibold border transition-colors ${
                  has(weekDay, p) ? "bg-[#374192] border-[#374192] text-white" : "bg-white border-gray-200 text-gray-400 hover:border-[#929BD2]"
                }`}
              >
                {has(weekDay, p) ? "✓" : "—"}
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Registrar que um voluntário quer trocar de grupo. Ele CONTINUA no grupo atual: aqui se diz só em que
 * dia e horário ele quer ir se abrir vaga, e por quê.
 */
export function ChangeRequestDialog({
  participantId,
  participantName,
  open,
  onClose,
  onSaved,
}: {
  participantId: string
  participantName: string
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [slots, setSlots] = useState<DesiredSlot[]>([])
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setSlots([])
    setReason("")
    setNote("")
  }

  const save = async () => {
    setSaving(true)
    try {
      await apiClient.post(
        "/group-change-requests",
        { participantId, desiredSlots: slots, reason, note: note.trim() || undefined },
        { endpoint: "new" },
      )
      toast.success("Pedido de troca registrado")
      reset()
      onSaved()
      onClose()
    } catch (e: any) {
      const msg = e?.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg || "Não foi possível registrar o pedido")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quer trocar de grupo</DialogTitle>
          <DialogDescription>
            <strong className="text-[#333333]">{participantName}</strong> continua no grupo atual. Marque o(s) dia(s) e horário(s) em que quer ir se
            abrir vaga.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <SlotPicker value={slots} onChange={setSlots} />

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#666666]">Motivo</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#374192]/30"
            >
              <option value="">Escolha o motivo…</option>
              {Object.entries(CHANGE_REASON_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#666666]">Observação (opcional)</label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={NOTE_MAX} rows={2} placeholder="Ex.: mudou de horário no trabalho" />
            <p className="text-[11px] text-[#666666] text-right">
              {note.length}/{NOTE_MAX}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving || slots.length === 0 || !reason} className="bg-[#374192] hover:bg-[#46607F]">
            {saving ? "Salvando…" : "Registrar pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
