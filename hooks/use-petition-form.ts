"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { apiClient } from "@/lib/api-client"
import { petitionFormSchema, type PetitionFormValues } from "@/lib/schemas/petition-form-schema"
import type { PetitionDetail } from "@/types/petition-form"

interface UsePetitionFormProps {
  petitionId: string
  petitionData?: PetitionDetail
}

interface CepResponse {
  cep: string
  state: string
  city: string
  neighborhood: string
  street: string
  service: string
}

const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, ""); // remove tudo que não for número

  if (digits.length <= 10) {
    // Telefone fixo: (99) 9999-9999
    return digits
      .replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
      .trim()
      .replace(/[-\s]+$/, ""); // remove traço ou espaço no final
  } else {
    // Celular: (99) 99999-9999
    return digits
      .replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
      .trim()
      .replace(/[-\s]+$/, "");
  }
};

export function usePetitionForm({ petitionId, petitionData }: UsePetitionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isPhotoUploading, setIsPhotoUploading] = useState(false)
  const [isCepLoading, setIsCepLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)

  // Configurar o formulário com React Hook Form e Zod
  const form = useForm<PetitionFormValues>({
    resolver: zodResolver(petitionFormSchema),
    defaultValues: {
      petitionId,
      name: "",
      birthDate: "",
      sex: "FEMALE",
      civilStatus: "SINGLE",
      languages: ["Português"],
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      congregation: "",
      baptismDate: "",
      lastTrainingDate: "",
      attributions: [],
      hasMinorChild: false,
      spouseParticipant: false,
      availability: {
        Monday: { morning: false, afternoon: false, evening: false },
        Tuesday: { morning: false, afternoon: false, evening: false },
        Wednesday: { morning: false, afternoon: false, evening: false },
        Thursday: { morning: false, afternoon: false, evening: false },
        Friday: { morning: false, afternoon: false, evening: false },
        Saturday: { morning: false, afternoon: false, evening: false },
        Sunday: { morning: false, afternoon: false, evening: false },
      },
    },
  })

  // Buscar dados existentes se disponíveis
  useEffect(() => {
    const fetchParticipantData = async () => {
      try {
        setIsLoading(true)

        // Verificar se a petição tem participantes
        const petitionData = await apiClient.get(`/petitions/${petitionId}`, { endpoint: "new" })

        if (petitionData && petitionData.participants && petitionData.participants.length > 0) {
          // Se a petição tem participantes, buscar os dados do primeiro participante
          const participantId = petitionData.participants[0].id
          setParticipantId(participantId)
          setIsEditMode(true)

          const response = await apiClient.get(`/participants/${participantId}`, { endpoint: "new" })

          if (response) {
            // Definir foto de perfil se disponível
            if (response.profilePhoto) {
              setProfilePhoto(response.profilePhoto)
            }

            // Formatar datas da API para o formato do formulário (YYYY-MM-DD)
            const formattedBirthDate = response.birthDate ? response.birthDate.split("T")[0] : ""
            const formattedBaptismDate = response.baptismDate ? response.baptismDate.split("T")[0] : ""
            const formattedLastTrainingDate = response.lastTrainingDate ? response.lastTrainingDate.split("T")[0] : ""

            // Converter disponibilidade do formato da API para o formato do formulário, se necessário
            let formattedAvailability = form.getValues("availability")
            if (response.availability) {
              // Lidar com diferentes formatos de disponibilidade
              if (Array.isArray(response.availability)) {
                // Converter formato de array para formato de objeto
                const availabilityObj: any = {
                  Monday: { morning: false, afternoon: false, evening: false },
                  Tuesday: { morning: false, afternoon: false, evening: false },
                  Wednesday: { morning: false, afternoon: false, evening: false },
                  Thursday: { morning: false, afternoon: false, evening: false },
                  Friday: { morning: false, afternoon: false, evening: false },
                  Saturday: { morning: false, afternoon: false, evening: false },
                  Sunday: { morning: false, afternoon: false, evening: false },
                }

                const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

                response.availability.forEach((item: any) => {
                  const day = weekDays[item.weekDay]
                  if (day) {
                    availabilityObj[day].morning = item.morning
                    availabilityObj[day].afternoon = item.afternoon
                    availabilityObj[day].evening = item.evening
                  }
                })

                formattedAvailability = availabilityObj
              } else {
                formattedAvailability = response.availability
              }
            }

            // Atualizar o formulário com os dados do participante
            form.reset({
              ...response,
              phone: response.phone ? formatPhoneNumber(response.phone) : "",
              petitionId,
              birthDate: formattedBirthDate,
              baptismDate: formattedBaptismDate,
              lastTrainingDate: formattedLastTrainingDate,
              availability: formattedAvailability,
              // Garantir que arrays sejam inicializados corretamente
              languages: response.languages || ["Português"],
              attributions: response.attributions || [],
            })

            toast.success("Editando dados do participante existente")
          }
        } else {
          // Se não houver participantes, é um novo registro
          setIsEditMode(false)
          toast.success("Preenchendo dados para um novo participante")
          // Manter o formulário vazio padrão
        }
      } catch (error) {
        console.error("Error fetching participant data:", error)
        toast.error("Não foi possível verificar os dados do participante")
      } finally {
        setIsLoading(false)
      }
    }

    fetchParticipantData()
  }, [petitionId, form])

  // Função para buscar endereço pelo CEP
  const fetchAddressByCep = async (cep: string) => {
    try {
      setIsCepLoading(true)
      // Mantemos o fetch direto para a API externa do BrasilAPI
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`)

      if (!response.ok) {
        throw new Error("CEP não encontrado")
      }

      const data: CepResponse = await response.json()

      // Preencher os campos do formulário com os dados retornados
      form.setValue("address", data.street || form.getValues("address"), { shouldValidate: true })
      form.setValue("city", data.city || form.getValues("city"), { shouldValidate: true })
      form.setValue("state", data.state || form.getValues("state"), { shouldValidate: true })

      toast.success("Endereço preenchido automaticamente")
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
      toast.error("Não foi possível encontrar o endereço para este CEP")
    } finally {
      setIsCepLoading(false)
    }
  }

  // Função para formatar o CEP enquanto o usuário digita
  const handleCepChange = (value: string) => {
    let formattedValue = value.replace(/\D/g, "") // Remover todos os caracteres não numéricos

    // Aplicar a máscara 00000-000
    if (formattedValue.length > 5) {
      formattedValue = `${formattedValue.substring(0, 5)}-${formattedValue.substring(5, 8)}`
    }

    // Atualizar o valor no formulário
    form.setValue("zipCode", formattedValue, { shouldValidate: true })

    // Se o CEP estiver completo (8 dígitos), buscar os dados
    if (formattedValue.replace(/\D/g, "").length === 8) {
      fetchAddressByCep(formattedValue.replace(/\D/g, ""))
    }
  }

  // Função para lidar com o upload de foto
  const handleFileUpload = async (file: File) => {
    if (!file || !participantId) return

    try {
      setIsPhotoUploading(true)

      // Criar FormData e anexar o arquivo
      const formData = new FormData()
      formData.append("file", file)

      // Fazer upload da foto usando apiClient
      const data = await apiClient.upload(`/participants/${participantId}/photo`, formData, { endpoint: "new" })

      // Atualizar a foto de perfil na UI
      if (data.profilePhoto) {
        // Adicionar um timestamp para forçar a atualização do cache da imagem
        const timestamp = new Date().getTime()
        setProfilePhoto(`${data.profilePhoto}?t=${timestamp}`)
      }

      toast.success("Foto atualizada com sucesso")
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast.error("Não foi possível atualizar a foto")
    } finally {
      setIsPhotoUploading(false)
    }
  }

  // Função para lidar com a seleção de congregação
  const handleCongregationChange = (value: string, congregationId?: number | null) => {
    form.setValue("congregation", value, { shouldValidate: true })
    form.setValue("congregationId", congregationId || null, { shouldValidate: true })
  }

  // Função para enviar o formulário
  const onSubmit = async (data: PetitionFormValues) => {
    setIsLoading(true)

    try {
      // Converter disponibilidade do formato de objeto para o formato de array esperado pela API
      const weekDayMapping: Record<string, number> = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      }

      // Criar array de disponibilidade com os valores selecionados pelo usuário
      const availability = Object.entries(data.availability).map(([day, periods]) => {
        return {
          weekDay: weekDayMapping[day],
          morning: periods.morning,
          afternoon: periods.afternoon,
          evening: periods.evening,
        }
      })

      // Preparar dados para envio à API
      const apiFormData = {
        ...data,
        availability,
        // Converter datas do formato do formulário (YYYY-MM-DD) para o formato da API
        birthDate: data.birthDate ? data.birthDate : "",
        baptismDate: data.baptismDate && data.baptismDate.trim() !== "" ? data.baptismDate : null,
        lastTrainingDate: data.lastTrainingDate && data.lastTrainingDate.trim() !== "" ? data.lastTrainingDate : null,
        // Garantir que congregationId seja um número
        congregationId: data.congregationId ? Number(data.congregationId) : null,
        // Garantir que congregation seja undefined se for vazio
        congregation: data.congregation || undefined,
      }

      // Verificar se a petição tem participantes
      const petitionData = await apiClient.get(`/petitions/${petitionId}`, { endpoint: "new" })

      if (petitionData && petitionData.participants && petitionData.participants.length > 0) {
        // Se a petição tem participantes, atualizar os dados do primeiro participante
        const participantId = petitionData.participants[0].id

        try {
          // Usar apiClient para atualizar o participante
          await apiClient.put(`/participants/${participantId}`, apiFormData, { endpoint: "new" })
          toast.success("Informações atualizadas com sucesso")
        } catch (error: any) {
          console.error("Error updating participant:", error)

          // Verificar se há mensagens de erro na resposta
          if (error.response && error.response.data) {
            const responseData = error.response.data

            if (responseData.message && Array.isArray(responseData.message)) {
              responseData.message.forEach((errorMsg: string) => {
                toast.error(errorMsg)
              })
            } else {
              toast.error(responseData.message || "Falha ao atualizar dados do participante")
            }
          } else {
            toast.error("Falha ao atualizar dados do participante")
          }

          throw error
        }
      } else {
        // Se não houver participantes, criar um novo participante
        try {
          // Usar apiClient para criar um novo participante
          await apiClient.post("/participants", apiFormData, { endpoint: "new" })
          toast.success("Novo participante cadastrado com sucesso")
        } catch (error: any) {
          console.error("Error creating participant:", error)

          // Verificar se há mensagens de erro na resposta
          if (error.response && error.response.data) {
            const responseData = error.response.data

            if (responseData.message && Array.isArray(responseData.message)) {
              responseData.message.forEach((errorMsg: string) => {
                toast.error(errorMsg)
              })
            } else {
              toast.error(responseData.message || "Falha ao criar novo participante")
            }
          } else {
            toast.error("Falha ao criar novo participante")
          }

          throw error
        }
      }

      router.push("/peticoes")
    } catch (error) {
      console.error("Error saving participant data:", error)
      // Verificamos se o erro já foi tratado (exibido como toast) anteriormente
      if (!(error instanceof Error && error.message.includes("Erro de validação"))) {
        toast.error("Não foi possível salvar as informações")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
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
  }
}
