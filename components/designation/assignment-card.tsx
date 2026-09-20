"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { AlertCircle, AlertTriangle, Clock, User } from "lucide-react"
import type { Assignment, Incident } from "@/types/designation-participants"
import type { AssignmentInsights } from "@/types/designation-insights"
import { isMixedSexPair, LEGACY_GENDER_ERROR_FRAGMENT, pairKey } from "@/lib/mixed-pair"
import { NewCombobox } from "../ui/new-combobox"

interface AssignmentCardProps {
  assignment: Assignment
  availableParticipants: Incident[]
  onUpdatePoint: (pointId: string, status: boolean) => Promise<void>
  onMoveParticipant: (participantId: string, fromPointId: string | null, toPointId: string | null) => Promise<void>
  isOpen: boolean
  isAbsent: (participant: Incident) => boolean
  assignments: Assignment[]
  /** Hints de histórico (dupla/ponto) pra esse ponto — não bloqueia nada, só informa. */
  insights?: AssignmentInsights
}

function formatHintDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

export function AssignmentCard({
  assignment,
  availableParticipants,
  onUpdatePoint,
  onMoveParticipant,
  isOpen,
  isAbsent,
  assignments,
  insights,
}: AssignmentCardProps) {
  const remainingSlots = assignment.config.max - assignment.participants.length

  // Dupla mista é permitida: o erro vermelho da legacy vira uma pergunta, sem bloquear nada.
  const [confirmedPair, setConfirmedPair] = useState<string | null>(null)
  const errorMessage = assignment.error && !assignment.error.includes(LEGACY_GENDER_ERROR_FRAGMENT) ? assignment.error : ""
  const mixedPair = isMixedSexPair(assignment.participants)
  const showMixedPairWarning = mixedPair && confirmedPair !== pairKey(assignment.participants)

  const comboboxOptions = availableParticipants
    .filter((p) => !isAbsent(p))
    .map((p) => ({
      value: p.id,
      label: p.name,
    }))

  return (
    <div className="relative">
      {/* Error message balloon */}
      {errorMessage && (
        <div className="absolute -top-8 sm:-top-12 left-0 right-0 z-10">
          <div className="bg-red-50 text-red-600 p-2 sm:p-3 rounded-lg border border-red-200 shadow-lg text-xs sm:text-sm flex items-start gap-2 mx-auto max-w-[95%] sm:max-w-[90%]">
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          {/* Arrow */}
          <div className="absolute -bottom-1.5 sm:-bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 rotate-45 bg-red-50 border-b border-r border-red-200" />
        </div>
      )}

      <Card
        className={`
          ${errorMessage ? "border-red-200 shadow-[0_0_0_1px_rgba(254,202,202,0.5)]" : ""}
          ${showMixedPairWarning ? "border-amber-300" : ""}
          ${!assignment.point.status ? "opacity-70" : ""}
          min-h-[300px] relative
        `}
      >
        <CardHeader className="p-3 sm:p-4 pt-5 sm:pt-7">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base sm:text-lg">{assignment.point.name}</CardTitle>
            <div className="flex items-center gap-2 ">
              <div className="flex items-center gap-1 absolute top-0 left-0 m-1 ml-2">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">
                  {assignment.participants.length}/{assignment.config.max}
                </span>
              </div>
              <Badge variant={assignment.point.status ? "default" : "outline"} className="absolute top-0 right-0 m-1 mr-2 text-xs">
                {assignment.point.status ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Carrinhos: {assignment.publication_carts.map((cart) => cart.name).join(", ")}
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4">
          {/* Toggle point status */}
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <Checkbox
              id={`point-status-${assignment.point.id}`}
              checked={assignment.point.status}
              onCheckedChange={(checked) => onUpdatePoint(assignment.point.id, !!checked)}
              disabled={!isOpen}
            />
            <label
              htmlFor={`point-status-${assignment.point.id}`}
              className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Ponto ativo
            </label>
          </div>

          {/* Current participants */}
          <div className="space-y-1.5 sm:space-y-2 mb-2">
            {assignment.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex flex-row items-center justify-between pl-1 border rounded-md gap-1 sm:gap-2"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 max-w-[80%]">
                  <div
                    className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full ${isAbsent(participant) ? "bg-red-100" : "bg-primary/10"} flex items-center justify-center flex-shrink-0`}
                  >
                    {participant.profile_photo ? (
                      <img
                        src={participant.profile_photo || "/placeholder.svg"}
                        alt={participant.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className={`${isAbsent(participant) ? "text-red-500" : "text-primary"} text-xs sm:text-sm font-medium`}
                      >
                        {participant.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium flex items-center gap-1 truncate text-xs sm:text-sm">
                      {participant.name}
                      {isAbsent(participant) && (
                        <AlertCircle
                          className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0"
                        //  title="Participante ausente"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <NewCombobox
                    options={[
                      { value: "", label: "Remover" },
                      ...assignments
                        .filter(
                          (a) =>
                            a.point.id !== assignment.point.id &&
                            a.point.status &&
                            a.participants.length < a.config.max,
                        )
                        .map((a) => ({
                          value: a.point.id,
                          label: `Mover para ${a.point.name}`,
                        })),
                    ]}
                    onChange={(value) => {
                      if (value === "") {
                        onMoveParticipant(participant.id, assignment.point.id, null)
                      } else {
                        onMoveParticipant(participant.id, assignment.point.id, value)
                      }
                    }}
                    empytText="Nenhum voluntário encontrado!"
                    inputPlaceholder="Buscar participante..."
                  />
                )}
              </div>
            ))}
          </div>

          {/* Dupla homem + mulher: permitido, só pergunta ao capitão — não bloqueia nada */}
          {showMixedPairWarning && (
            <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 p-2 sm:p-2.5 text-xs sm:text-sm text-amber-900">
              <div className="flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0 text-amber-600" />
                <span>
                  Dupla com homem e mulher. <strong>Tem certeza que vai manter assim?</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setConfirmedPair(pairKey(assignment.participants))}
                className="mt-1.5 ml-5 text-[11px] sm:text-xs font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-950"
              >
                Sim, manter assim
              </button>
            </div>
          )}

          {/* Hints de histórico — não bloqueia nada, só informa (dupla/ponto repetidos) */}
          {((insights?.pairs?.length ?? 0) > 0 || (insights?.participants?.length ?? 0) > 0) && (
            <div className="space-y-1 mb-3 sm:mb-4 border-t pt-2">
              {insights!.pairs.map((pair) => (
                <div
                  key={pair.participantIds.join("-")}
                  className="flex items-start gap-1.5 text-[11px] sm:text-xs text-muted-foreground"
                >
                  <Clock className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>
                    {pair.names[0]} e {pair.names[1]}: já trabalharam juntos {pair.countLast12m}x no último ano
                    (última vez {formatHintDate(pair.lastAt)})
                  </span>
                </div>
              ))}
              {insights!.participants.map((p) => (
                <div key={p.id} className="flex items-start gap-1.5 text-[11px] sm:text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>
                    {p.name}: já trabalhou aqui {p.pointCountLast12m}x no último ano (última vez{" "}
                    {formatHintDate(p.pointLastAt)})
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Participants selection */}
          {assignment.point.status && remainingSlots > 0 && isOpen && (
            <div className="space-y-1.5 sm:space-y-2">
              {Array.from({ length: Math.min(remainingSlots, 3) }).map((_, index) => (
                <NewCombobox
                  key={`${assignment.point.id}-slot-${index}`}
                  options={comboboxOptions}
                  onChange={(value) => {
                    onMoveParticipant(value, null, assignment.point.id)
                  }}
                  placeholder="Adicionar Voluntário"
                  inputPlaceholder="Buscar participante..."
                  empytText="Nenhum voluntário encontrado!"
                  disabled={comboboxOptions.length === 0}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
