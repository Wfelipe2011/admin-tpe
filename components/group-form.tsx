"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

// Define the schema for form validation
const groupFormSchema = z
  .object({
    name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
    configStartHour: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Formato de hora inválido (HH:MM)",
    }),
    configEndHour: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Formato de hora inválido (HH:MM)",
    }),
    configMax: z.number().min(1, { message: "Deve ter pelo menos 1 participante" }),
    configMin: z.number().min(1, { message: "Deve ter pelo menos 1 participante" }),
    coordinatorId: z.string().optional(),
    status: z.enum(["OPEN", "CLOSED"]),
    type: z.enum(["MAIN", "ADDITIONAL", "SPECIAL"]),
    configWeekday: z.enum(["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]),
    hasAdditionalInfo: z.boolean().default(false),
    "additionalInfo.observation": z.string().optional(),
    "additionalInfo.address.street": z.string().optional(),
    "additionalInfo.address.number": z.string().optional(),
    "additionalInfo.address.neighborhood": z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.hasAdditionalInfo) {
        return (
          data["additionalInfo.address.street"] &&
          data["additionalInfo.address.number"] &&
          data["additionalInfo.address.neighborhood"]
        )
      }
      return true
    },
    {
      message: "Todos os campos de endereço são obrigatórios quando informações adicionais estão habilitadas",
      path: ["additionalInfo.address.street"],
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
      hasAdditionalInfo: false,
      "additionalInfo.observation": "",
      "additionalInfo.address.street": "",
      "additionalInfo.address.number": "",
      "additionalInfo.address.neighborhood": "",
    },
  })

  // Watch for changes to hasAdditionalInfo to conditionally render fields
  const hasAdditionalInfo = form.watch("hasAdditionalInfo")

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
            hasAdditionalInfo: !!data.additionalInfo,
            "additionalInfo.observation": data.additionalInfo?.observation || "",
            "additionalInfo.address.street": data.additionalInfo?.address?.street || "",
            "additionalInfo.address.number": data.additionalInfo?.address?.number || "",
            "additionalInfo.address.neighborhood": data.additionalInfo?.address?.neighborhood || "",
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
        coordinatorId: values.coordinatorId || null,
        status: values.status,
        type: values.type,
        configWeekday: values.configWeekday,
        additionalInfo: values.hasAdditionalInfo
          ? {
              observation: values["additionalInfo.observation"],
              address: {
                street: values["additionalInfo.address.street"],
                number: values["additionalInfo.address.number"],
                neighborhood: values["additionalInfo.address.neighborhood"],
              },
            }
          : undefined,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Grupo</FormLabel>
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
                    <FormLabel>Tipo</FormLabel>
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
                    <FormLabel>Dia da Semana</FormLabel>
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
                    <FormLabel>Status</FormLabel>
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
                    <FormLabel>Horário de Início</FormLabel>
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
                    <FormLabel>Horário de Término</FormLabel>
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
                    <FormLabel>Mínimo de Participantes</FormLabel>
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
                    <FormLabel>Máximo de Participantes</FormLabel>
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
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Coordenador</FormLabel>
                    <Combobox
                      options={coordinators.map((coordinator) => ({
                        label: coordinator.name,
                        value: coordinator.id,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecione um coordenador"
                      emptyText={isLoading ? "Carregando..." : "Nenhum coordenador encontrado"}
                      disabled={isLoading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasAdditionalInfo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Informações Adicionais</FormLabel>
                      <FormDescription>Inclui endereço e observações</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {hasAdditionalInfo && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Informações Adicionais</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="additionalInfo.address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite a rua" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalInfo.address.number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o número" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalInfo.address.neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalInfo.observation"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Digite observações adicionais" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

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
