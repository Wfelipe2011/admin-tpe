"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormSectionWrapper } from "../ui/form-section-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import type { PetitionFormValues } from "@/lib/schemas/petition-form-schema"
import { cn } from "@/lib/utils"

interface AddressSectionProps {
  isCepLoading: boolean
  handleCepChange: (value: string) => void
}

export function AddressSection({ isCepLoading, handleCepChange }: AddressSectionProps) {
  const form = useFormContext<PetitionFormValues>()

  const stateOptions = [
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" },
  ]

  return (
    <FormSectionWrapper id="item-2" title="Endereço">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>CEP</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="00000-000"
                    maxLength={9}
                    className={cn(
                      isCepLoading ? "pr-10" : "",
                      form.formState.errors.zipCode && "border-destructive focus-visible:ring-destructive",
                    )}
                    onChange={(e) => {
                      handleCepChange(e.target.value)
                    }}
                  />
                </FormControl>
                {isCepLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Digite o CEP para preencher o endereço automaticamente</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isCepLoading}
                  className={cn(form.formState.errors.address && "border-destructive focus-visible:ring-destructive")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isCepLoading}
                  className={cn(form.formState.errors.city && "border-destructive focus-visible:ring-destructive")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Estado</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={isCepLoading}>
                <FormControl>
                  <SelectTrigger
                    className={cn(form.formState.errors.state && "border-destructive focus-visible:ring-destructive")}
                  >
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {stateOptions.map((option) => (
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
      </div>
    </FormSectionWrapper>
  )
}
