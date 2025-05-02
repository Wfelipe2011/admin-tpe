"use client"

import { useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormSectionWrapper } from "../ui/form-section-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import dayjs from "dayjs"
import type { PetitionFormValues } from "@/lib/schemas/petition-form-schema"
import { cn } from "@/lib/utils"

// First, add the necessary imports at the top of the file
import { useState, useCallback, useRef } from "react"
import { toast } from "react-hot-toast"
import { apiClient } from "@/lib/api-client"
import type { IParticipants } from "@/types/participants"
import { debounce } from "lodash"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface PersonalInfoSectionProps {
  maxBirthDate: string
  hasBaptismDate: boolean
  diffsFromBaptismDateToTodayIsMoreThan14Years: boolean
}

export function PersonalInfoSection({
  maxBirthDate,
  hasBaptismDate,
  diffsFromBaptismDateToTodayIsMoreThan14Years,
}: PersonalInfoSectionProps) {
  const form = useFormContext<PetitionFormValues>()

  const civilStatusOptions = [
    { value: "SINGLE", label: "Solteiro(a)" },
    { value: "MARRIED", label: "Casado(a)" },
    { value: "DIVORCED", label: "Divorciado(a)" },
    { value: "WIDOWED", label: "Viúvo(a)" },
  ]

  const [isValidatingPhone, setIsValidatingPhone] = useState(false)
  const [existingParticipant, setExistingParticipant] = useState<IParticipants | null>(null)
  const [showPopulateDialog, setShowPopulateDialog] = useState(false)
  const participantToPopulate = useRef<IParticipants | null>(null)

  // Function to populate form fields with participant data
  const populateFormFields = useCallback(
    (participant: IParticipants) => {
      if (!participant) return

      // Map participant data to form fields
      // Only set values that exist in the participant data
      if (participant.name) {
        form.setValue("name", participant.name, { shouldValidate: true })
      }

      if (participant.email) {
        form.setValue("email", participant.email, { shouldValidate: true })
      }

      if (participant.sex) {
        form.setValue("sex", participant.sex, { shouldValidate: true })
      }

      if (participant.civilStatus) {
        form.setValue("civilStatus", participant.civilStatus, { shouldValidate: true })
      }

      if (participant.birthDate) {
        const formattedBirthDate = format(new Date(participant.birthDate), "yyyy-MM-dd")
        form.setValue("birthDate", formattedBirthDate, { shouldValidate: true })
      }

      if (participant.baptismDate) {
        const formattedBaptismDate = format(new Date(participant.baptismDate), "yyyy-MM-dd")
        form.setValue("baptismDate", formattedBaptismDate, { shouldValidate: true })
      }

      if (participant.lastTrainingDate) {
        const formattedTrainingDate = format(new Date(participant.lastTrainingDate), "yyyy-MM-dd")
        form.setValue("lastTrainingDate", formattedTrainingDate, { shouldValidate: true })
      }

      if (participant.address) {
        form.setValue("address", participant.address, { shouldValidate: true })
      }

      if (participant.city) {
        form.setValue("city", participant.city, { shouldValidate: true })
      }

      if (participant.state) {
        form.setValue("state", participant.state, { shouldValidate: true })
      }

      if (participant.zipCode) {
        form.setValue("zipCode", participant.zipCode, { shouldValidate: true })
      }

      if (participant.languages && participant.languages.length > 0) {
        form.setValue("languages", participant.languages, { shouldValidate: true })
      }

      if (participant.attributions && participant.attributions.length > 0) {
        form.setValue("attributions", participant.attributions, { shouldValidate: true })
      }

      if (participant.hasMinorChild !== null && participant.hasMinorChild !== undefined) {
        form.setValue("hasMinorChild", participant.hasMinorChild, { shouldValidate: true })
      }

      if (participant.spouseParticipant !== null && participant.spouseParticipant !== undefined) {
        form.setValue("spouseParticipant", participant.spouseParticipant, { shouldValidate: true })
      }

      if (participant.congregation) {
        form.setValue("congregation", participant.congregation, { shouldValidate: true })
      }

      if (participant.congregationId) {
        form.setValue("congregationId", participant.congregationId, { shouldValidate: true })
      }

      // Handle availability if it exists
      if (participant.availability && participant.availability.length > 0) {
        const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const availabilityObj: any = {
          Monday: { morning: false, afternoon: false, evening: false },
          Tuesday: { morning: false, afternoon: false, evening: false },
          Wednesday: { morning: false, afternoon: false, evening: false },
          Thursday: { morning: false, afternoon: false, evening: false },
          Friday: { morning: false, afternoon: false, evening: false },
          Saturday: { morning: false, afternoon: false, evening: false },
          Sunday: { morning: false, afternoon: false, evening: false },
        }

        participant.availability.forEach((item) => {
          const day = weekDays[item.weekDay]
          if (day) {
            availabilityObj[day].morning = item.morning
            availabilityObj[day].afternoon = item.afternoon
            availabilityObj[day].evening = item.evening
          }
        })

        form.setValue("availability", availabilityObj, { shouldValidate: true })
      }

      toast.success("Dados do participante preenchidos com sucesso")
    },
    [form],
  )

  // Create a debounced function to validate phone number
  const validatePhoneNumber = useCallback(
    debounce(async (phone: string) => {
      // Skip validation if phone is too short
      if (!phone || phone.length < 8) {
        setExistingParticipant(null)
        return
      }

      try {
        setIsValidatingPhone(true)
        const response = await apiClient.get<IParticipants>(`/participants/phones/${phone}`, { endpoint: "new" })

        if (response && response.id) {
          setExistingParticipant(response)
          participantToPopulate.current = response
          setShowPopulateDialog(true)
          toast.success(`Participante encontrado: ${response.name}. Você está atualizando um registro existente.`)
        } else {
          setExistingParticipant(null)
          participantToPopulate.current = null
          toast.success("Novo participante será registrado com este telefone.")
        }
      } catch (error) {
        // If 404 or other error, it means the participant doesn't exist
        setExistingParticipant(null)
        participantToPopulate.current = null

        // Only show toast for non-404 errors
        if (error.response && error.response.status !== 404) {
          console.error("Error validating phone:", error)
          toast.error("Erro ao validar o telefone")
        } else {
          toast.success("Novo participante será registrado com este telefone.")
        }
      } finally {
        setIsValidatingPhone(false)
      }
    }, 500),
    [form],
  )

  return (
    <>
      <FormSectionWrapper id="item-1" title="Informações Pessoais" defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Nome Completo *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className={cn(form.formState.errors.name && "border-destructive focus-visible:ring-destructive")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Data de Nascimento *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    max={maxBirthDate}
                    {...field}
                    className={cn(
                      form.formState.errors.birthDate && "border-destructive focus-visible:ring-destructive",
                    )}
                    onChange={(e) => {
                      const selectedDate = dayjs(e.target.value)
                      const maxDate = dayjs(maxBirthDate)

                      // Verificar se a data selecionada é válida antes de atualizar
                      if (!selectedDate.isAfter(maxDate)) {
                        field.onChange(e.target.value)
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Sexo *</FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="MALE" id="male" />
                      <Label htmlFor="male">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="FEMALE" id="female" />
                      <Label htmlFor="female">Feminino</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="civilStatus"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Estado Civil *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger
                      className={cn(
                        form.formState.errors.civilStatus && "border-destructive focus-visible:ring-destructive",
                      )}
                    >
                      <SelectValue placeholder="Selecione o estado civil" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {civilStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Telefone *</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      {...field}
                      className={cn(
                        form.formState.errors.phone && "border-destructive focus-visible:ring-destructive",
                        existingParticipant && "border-orange-500 focus-visible:ring-orange-500",
                      )}
                      onChange={(e) => {
                        field.onChange(e)
                        validatePhoneNumber(e.target.value)
                      }}
                      disabled={isValidatingPhone}
                    />
                  </FormControl>
                  {isValidatingPhone && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                  )}
                </div>
                {existingParticipant && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-orange-500">Este telefone pertence a {existingParticipant.name}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        participantToPopulate.current = existingParticipant
                        setShowPopulateDialog(true)
                      }}
                    >
                      Preencher dados
                    </Button>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    className={cn(form.formState.errors.email && "border-destructive focus-visible:ring-destructive")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSectionWrapper>

      {/* Confirmation Dialog for populating form fields */}
      <AlertDialog open={showPopulateDialog} onOpenChange={setShowPopulateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Preencher formulário com dados existentes?</AlertDialogTitle>
            <AlertDialogDescription>
              Encontramos um participante com este telefone. Deseja preencher o formulário com os dados existentes? Isso
              substituirá quaisquer dados que você já tenha inserido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (participantToPopulate.current) {
                  populateFormFields(participantToPopulate.current)
                }
              }}
            >
              Preencher dados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
