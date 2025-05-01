"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Accordion } from "@/components/ui/accordion"
import { Form } from "@/components/ui/form"
import { usePetitionForm } from "@/hooks/use-petition-form"
import { ProfilePhotoSection } from "./sections/profile-photo-section"
import { PersonalInfoSection } from "./sections/personal-info-section"
import { SpiritualInfoSection } from "./sections/spiritual-info-section"
import { AvailabilitySection } from "./sections/availability-section"
import dayjs from "dayjs"
import type { PetitionDetail } from "@/types/petition-form"

interface PetitionFormProps {
  petitionId: string
  petitionData?: PetitionDetail
}

export function PetitionForm({ petitionId, petitionData }: PetitionFormProps) {
  const router = useRouter()
  const {
    form,
    isLoading,
    isPhotoUploading,
    isCepLoading,
    isEditMode,
    participantId,
    profilePhoto,
    handleCepChange,
    handleFileUpload,
    handleCongregationChange,
    onSubmit,
  } = usePetitionForm({ petitionId, petitionData })

  // Calcular a data máxima para o campo de data de nascimento
  const maxOfYearByAge = dayjs().subtract(14, "year").format("YYYY-MM-DD")
  const hasBaptismDate = !!form.getValues("baptismDate")
  const diffsFromBaptismDateToTodayIsMoreThan14Years =
    hasBaptismDate && dayjs().diff(dayjs(form.getValues("baptismDate")), "year") > 14
  const maxBirthDate =
    hasBaptismDate && diffsFromBaptismDateToTodayIsMoreThan14Years
      ? dayjs(form.getValues("baptismDate")).format("YYYY-MM-DD")
      : maxOfYearByAge

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
            {isEditMode && (
              <ProfilePhotoSection
                profilePhoto={profilePhoto}
                isPhotoUploading={isPhotoUploading}
                participantId={participantId}
                onFileUpload={handleFileUpload}
              />
            )}

            <PersonalInfoSection
              maxBirthDate={maxBirthDate}
              hasBaptismDate={hasBaptismDate}
              diffsFromBaptismDateToTodayIsMoreThan14Years={diffsFromBaptismDateToTodayIsMoreThan14Years}
            />

            <SpiritualInfoSection handleCongregationChange={handleCongregationChange} isLoading={isLoading} />

            <AvailabilitySection />
          </Accordion>

          <div className="flex justify-end space-x-4 mt-6">
            <Button type="button" variant="outline" onClick={() => router.push("/peticoes")} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              onClick={() => {
                // Log dos erros do formulário para depuração
                if (Object.keys(form.formState.errors).length > 0) {
                  console.log("Erros de validação:", form.formState.errors)
                }
              }}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
