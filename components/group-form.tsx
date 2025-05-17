"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NewCombobox } from "@/components/ui/new-combobox"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

// Helper function to convert time string to minutes
const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(":").map(Number)
  return hours * 60 + minutes
}

// Define the schema for form validation
const groupFormSchema = z
  .object({
    name: z
      .string({ required_error: "Nome é obrigatório" })
      .min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
    configStartHour: z
      .string({ required_error: "Horário de início é obrigatório" })
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: "Formato de hora inválido (HH:MM)",
      }),
    configEndHour: z
      .string({ required_error: "Horário de término é obrigatório" })
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: "Formato de hora inválido (HH:MM)",
      }),
    configMax: z
      .number({ required_error: "Máximo de participantes é obrigatório" })
      .min(1, { message: "Deve ter pelo menos 1 participante" }),
    configMin: z
      .number({ required_error: "Mínimo de participantes é obrigatório" })
      .min(1, { message: "Deve ter pelo menos 1 participante" }),
    coordinatorId: z.string({ required_error: "Coordenador é obrigatório" }),
    status: z.enum(["OPEN", "CLOSED"], { required_error: "Status é obrigatório" }),
    type: z.enum(["MAIN", "ADDITIONAL", "SPECIAL"], { required_error: "Tipo é obrigatório" }),
    configWeekday: z.enum(["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"], {
      required_error: "Dia da semana é obrigatório",
    }),
  })
  .refine(
    (data) => {
      const startMinutes = timeToMinutes(data.configStartHour)
      const endMinutes = timeToMinutes(data.configEndHour)
      return startMinutes < endMinutes
    },
    {
      message: "O horário de início deve ser anterior ao horário de término",
      path: ["configEndHour"],
    },
  )
  .refine(
    (data) => {
      return data.configMin <= data.configMax
    },
    {
      message: "O mínimo de participantes deve ser menor ou igual ao máximo",
      path: ["configMin"],
    },
  )

type GroupFormValues = z.infer<typeof groupFormSchema>

interface Coordinator {
  id: string
  name: string
  profile: string
}

interface GroupFormProps {
  groupId?: string
  isEditing?: boolean
}

export function GroupForm({ groupId, isEditing = false }: GroupFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [coordinators, setCoordinators] = useState<Coordinator[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with default values
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      configStartHour: "08:00",
      configEndHour: "12:00",
      configMax: 10,
      configMin: 5,
      coordinatorId: undefined,
      status: "OPEN",
      type: "MAIN",
      configWeekday: "MONDAY",
    },
  })

  // Fetch coordinators on component mount
  useEffect(() => {
    const fetchCoordinators = async () => {
      setIsLoading(true)
      try {
        const data = await apiClient.get<Coordinator[]>("participants?profile=COORDINATOR", { endpoint: "new" })
        setCoordinators(data)
      } catch (error) {
        console.error("Erro ao buscar coordenadores:", error)
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar a lista de coordenadores",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCoordinators()
  }, [toast])

  // Add this after the existing useEffect for fetching coordinators
  useEffect(() => {
    if (isEditing && groupId) {
      const fetchGroupData = async () => {
        setIsLoading(true)
        try {
          const data = await apiClient.get(`groups/${groupId}`, { endpoint: "new" })

          // Format the data for the form
          form.reset({
            name: data.name,
            configStartHour: data.configStartHour?.slice(0, 5) || "08:00",
            configEndHour: data.configEndHour?.slice(0, 5) || "12:00",
            configMax: data.configMax || 10,
            configMin: data.configMin || 5,
            coordinatorId: data.coordinatorId || undefined,
            status: data.status || "OPEN",
            type: data.type || "MAIN",
            configWeekday: data.configWeekday || "MONDAY",
          })
        } catch (error) {
          console.error("Erro ao buscar dados do grupo:", error)
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível carregar os dados do grupo",
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchGroupData()
    }
  }, [isEditing, groupId, form, toast])

  // Handle form submission
  const onSubmit = async (values: GroupFormValues) => {
    setIsSubmitting(true)
    try {
      // Prepare the data for API submission
      const formData = {
        name: values.name,
        configStartHour: values.configStartHour,
        configEndHour: values.configEndHour,
        configMax: values.configMax,
        configMin: values.configMin,
        coordinatorId: values.coordinatorId,
        status: values.status,
        type: values.type,
        configWeekday: values.configWeekday,
      }

      if (isEditing && groupId) {
        // Update existing group
        await apiClient.put(`groups/${groupId}`, formData, { endpoint: "new" })
        toast({
          title: "Sucesso",
          description: "Grupo atualizado com sucesso",
        })
      } else {
        // Create new group
        await apiClient.post("groups", formData, { endpoint: "new" })
        toast({
          title: "Sucesso",
          description: "Grupo criado com sucesso",
        })
      }

      // Redirect to the groups page
      router.push("/grupos")
    } catch (error) {
      console.error(`Erro ao ${isEditing ? "atualizar" : "criar"} grupo:`, error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : `Falha ao ${isEditing ? "atualizar" : "criar"} grupo`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to translate weekday to Portuguese
  const translateWeekday = (weekday: string) => {
    const translations: Record<string, string> = {
      SUNDAY: "Domingo",
      MONDAY: "Segunda-feira",
      TUESDAY: "Terça-feira",
      WEDNESDAY: "Quarta-feira",
      THURSDAY: "Quinta-feira",
      FRIDAY: "Sexta-feira",
      SATURDAY: "Sábado",
    }
    return translations[weekday] || weekday
  }

  // Helper function to translate status to Portuguese
  const translateStatus = (status: string) => {
    const translations: Record<string, string> = {
      OPEN: "Aberto",
      CLOSED: "Fechado",
    }
    return translations[status] || status
  }

  // Helper function to translate type to Portuguese
  const translateType = (type: string) => {
    const translations: Record<string, string> = {
      MAIN: "Principal",
      ADDITIONAL: "Adicional",
      SPECIAL: "Especial",
    }
    return translations[type] || type
  }

  // Required field indicator component
  const RequiredIndicator = () => <span className="ml-1">*</span>

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-4">
              Todos os campos com <span className="text-red-500">*</span> são obrigatórios
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nome do Grupo
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome do grupo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tipo
                      <RequiredIndicator />
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MAIN">{translateType("MAIN")}</SelectItem>
                        <SelectItem value="ADDITIONAL">{translateType("ADDITIONAL")}</SelectItem>
                        <SelectItem value="SPECIAL">{translateType("SPECIAL")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="configWeekday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Dia da Semana
                      <RequiredIndicator />
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o dia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MONDAY">{translateWeekday("MONDAY")}</SelectItem>
                        <SelectItem value="TUESDAY">{translateWeekday("TUESDAY")}</SelectItem>
                        <SelectItem value="WEDNESDAY">{translateWeekday("WEDNESDAY")}</SelectItem>
                        <SelectItem value="THURSDAY">{translateWeekday("THURSDAY")}</SelectItem>
                        <SelectItem value="FRIDAY">{translateWeekday("FRIDAY")}</SelectItem>
                        <SelectItem value="SATURDAY">{translateWeekday("SATURDAY")}</SelectItem>
                        <SelectItem value="SUNDAY">{translateWeekday("SUNDAY")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status
                      <RequiredIndicator />
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OPEN">{translateStatus("OPEN")}</SelectItem>
                        <SelectItem value="CLOSED">{translateStatus("CLOSED")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="configStartHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Horário de Início
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="configEndHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Horário de Término
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="configMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mínimo de Participantes
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="configMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Máximo de Participantes
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coordinatorId"
                render={({ field }) => {
                  const coordinator = coordinators?.find((c) => c.id === field.value)
                  const options = coordinators
                    .map((coordinator) => ({
                      value: coordinator.id,
                      label: coordinator.name,
                    }))
                    .filter((option) => (coordinator ? coordinator.id !== option.value : true))
                  if (coordinator) {
                    options.unshift({
                      value: field.value,
                      label: "Remover",
                    })
                  }
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        Coordenador
                        <RequiredIndicator />
                      </FormLabel>
                      <NewCombobox
                        placeholder="Selecione um coordenador"
                        inputPlaceholder="Buscar coordenador..."
                        empytText={isLoading ? "Carregando..." : "Nenhum coordenador encontrado"}
                        disabled={isLoading}
                        onChange={(value, label) => {
                          if (label === "Remover") {
                            field.onChange("")
                          } else {
                            field.onChange(value)
                          }
                        }}
                        value={coordinator?.name || ""}
                        options={options}
                      />
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/grupos")} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Salvar Alterações" : "Criar Grupo"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
