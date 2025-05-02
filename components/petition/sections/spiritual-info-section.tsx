"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { FormSectionWrapper } from "../ui/form-section-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CongregationCombobox } from "../ui/congregation-combobox"
import dayjs from "dayjs"
import type { PetitionFormValues } from "@/lib/schemas/petition-form-schema"
import { cn } from "@/lib/utils"

interface SpiritualInfoSectionProps {
  handleCongregationChange?: (value: string, congregationId?: number | null) => void
  isLoading?: boolean
}

export function SpiritualInfoSection({ handleCongregationChange, isLoading = false }: SpiritualInfoSectionProps) {
  const form = useFormContext<PetitionFormValues>()
  const congregationId = form.getValues("congregationId")
  const gender = form.watch("sex")

  // Filter attribution options based on gender
  const attributionOptions = [
    { value: "PIONEIRO", label: "Pioneiro" },
    ...(gender === "MALE"
      ? [
        { value: "ANCIÃO", label: "Ancião" },
        { value: "SERVO_MINISTERIAL", label: "Servo Ministerial" },
      ]
      : []),
  ]

  const languageOptions = [
    { value: "PORTUGUÊS", label: "Português" },
    { value: "INGLÊS", label: "Inglês" },
    { value: "ESPANHOL", label: "Espanhol" },
    { value: "LIBRAS", label: "Libras" },
  ]

  const handleCongregationUpdate = (value: string, congregationId?: number | null) => {
    // Atualizar o ID da congregação no formulário
    form.setValue("congregationId", congregationId || null, { shouldValidate: true })

    // Chamar o callback do componente pai, se existir
    if (handleCongregationChange) {
      handleCongregationChange(value, congregationId)
    }
  }

  return (
    <FormSectionWrapper id="item-3" title="Informações Espirituais">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CongregationCombobox
          name="congregation"
          onChange={handleCongregationUpdate}
          disabled={isLoading}
          congregationId={congregationId}
        />

        <FormField
          control={form.control}
          name="baptismDate"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Data de Batismo *</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value || ""}
                  min={form.getValues("birthDate")}
                  max={dayjs().format("YYYY-MM-DD")}
                  className={cn(
                    form.formState.errors.baptismDate && "border-destructive focus-visible:ring-destructive",
                  )}
                />
              </FormControl>
              {form.formState.errors.baptismDate && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastTrainingDate"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Data do Último Treinamento</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value || ""}
                  max={dayjs().format("YYYY-MM-DD")}
                  className={cn(
                    form.formState.errors.lastTrainingDate && "border-destructive focus-visible:ring-destructive",
                  )}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-2 md:col-span-2">
          <FormField
            control={form.control}
            name="attributions"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Atribuições *</FormLabel>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {attributionOptions.map((option) => (
                    <FormField
                      key={option.value}
                      control={form.control}
                      name="attributions"
                      render={({ field }) => {
                        return (
                          <FormItem key={option.value} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  const current = [...(field.value || [])]
                                  if (checked) {
                                    field.onChange([...current, option.value])
                                  } else {
                                    field.onChange(current.filter((value) => value !== option.value))
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{option.label}</FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <FormField
            control={form.control}
            name="languages"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Idiomas *</FormLabel>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {languageOptions.map((option) => (
                    <FormField
                      key={option.value}
                      control={form.control}
                      name="languages"
                      render={({ field }) => {
                        return (
                          <FormItem key={option.value} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  const current = [...(field.value || [])]
                                  if (checked) {
                                    field.onChange([...current, option.value])
                                  } else {
                                    field.onChange(current.filter((value) => value !== option.value))
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{option.label}</FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="hasMinorChild"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Possui filho(s) menor(es) de idade</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="spouseParticipant"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Cônjuge é participante</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>
    </FormSectionWrapper>
  )
}
