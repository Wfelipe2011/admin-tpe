"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, User } from "lucide-react"
import type { Assignment, Incident } from "@/types/designation-participants"
import { NewCombobox } from "../ui/new-combobox"

interface AssignmentCardProps {
  assignment: Assignment
  availableParticipants: Incident[]
  onUpdatePoint: (pointId: string, status: boolean) => Promise<void>
  onMoveParticipant: (participantId: string, fromPointId: string | null, toPointId: string | null) => Promise<void>
  isOpen: boolean
  isAbsent: (participant: Incident) => boolean
  assignments: Assignment[]
}

export function AssignmentCard({
  assignment,
  availableParticipants,
  onUpdatePoint,
  onMoveParticipant,
  isOpen,
  isAbsent,
  assignments,
}: AssignmentCardProps) {
  const remainingSlots = assignment.config.max - assignment.participants.length
  const comboboxOptions = availableParticipants
    .filter((p) => !isAbsent(p))
    .map((p) => ({
      value: p.id,
      label: p.name,
    }))

  return (
    <div className="relative">
      {/* Error message balloon */}
      {assignment.error && (
        <div className="absolute -top-12 left-0 right-0 z-10">
          <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 shadow-lg text-sm flex items-start gap-2 mx-auto max-w-[90%]">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{assignment.error}</span>
          </div>
          {/* Arrow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-red-50 border-b border-r border-red-200" />
        </div>
      )}

      <Card
        className={`
          ${assignment.error ? "border-red-200 shadow-[0_0_0_1px_rgba(254,202,202,0.5)]" : ""}
          ${!assignment.point.status ? "opacity-70" : ""}
          min-h-[300px] relative
        `}
      >
        <CardHeader className="p-4 pt-7">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{assignment.point.name}</CardTitle>
            <div className="flex items-center gap-2 ">
              <div className="flex items-center gap-1 absolute top-0 left-0 m-1 ml-2">
                <User className="h-4 w-4" />
                <span>
                  {assignment.participants.length}/{assignment.config.max}
                </span>
              </div>
              <Badge variant={assignment.point.status ? "default" : "outline"} className="absolute top-0 right-0 m-1 mr-2">
                {assignment.point.status ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Carrinhos: {assignment.publication_carts.map((cart) => cart.name).join(", ")}
          </div>
        </CardHeader>

        <CardContent>
          {/* Toggle point status */}
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id={`point-status-${assignment.point.id}`}
              checked={assignment.point.status}
              onCheckedChange={(checked) => onUpdatePoint(assignment.point.id, !!checked)}
              disabled={!isOpen}
            />
            <label
              htmlFor={`point-status-${assignment.point.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Ponto ativo
            </label>
          </div>

          {/* Current participants */}
          <div className="space-y-2 mb-2">
            {assignment.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex flex-row items-center justify-between pl-1 border rounded-md gap-2"
              >
                <div className="flex items-center gap-2 max-w-[80%]">
                  <div
                    className={`h-8 w-8 rounded-full ${isAbsent(participant) ? "bg-red-100" : "bg-primary/10"} flex items-center justify-center flex-shrink-0`}
                  >
                    {participant.profile_photo ? (
                      <img
                        src={participant.profile_photo || "/placeholder.svg"}
                        alt={participant.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className={`${isAbsent(participant) ? "text-red-500" : "text-primary"} text-sm font-medium`}
                      >
                        {participant.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium flex items-center gap-1 truncate">
                      {participant.name}
                      {isAbsent(participant) && (
                        <AlertCircle
                          className="h-4 w-4 text-red-500 flex-shrink-0"
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

          {/* Participants selection */}
          {assignment.point.status && remainingSlots > 0 && isOpen && (
            <div className="space-y-2">
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
