import * as z from "zod"
import dayjs from "dayjs"

// Esquema para disponibilidade diária
const dayAvailabilitySchema = z.object({
  morning: z.boolean().default(false),
  afternoon: z.boolean().default(false),
  evening: z.boolean().default(false),
})

// Esquema para disponibilidade semanal
const availabilitySchema = z.object({
  Monday: dayAvailabilitySchema,
  Tuesday: dayAvailabilitySchema,
  Wednesday: dayAvailabilitySchema,
  Thursday: dayAvailabilitySchema,
  Friday: dayAvailabilitySchema,
  Saturday: dayAvailabilitySchema,
  Sunday: dayAvailabilitySchema,
})

// Função para validar data de nascimento
const validateBirthDate = (birthDate: string | undefined, baptismDate?: string | null) => {
  if (!birthDate) return true // Se não houver data de nascimento, é válido (campo opcional)

  const minAge = 14
  const today = dayjs()
  const birthDateObj = dayjs(birthDate)

  // Verificar se a data de nascimento é pelo menos 14 anos atrás
  if (birthDateObj.isAfter(today.subtract(minAge, "year"))) {
    return false
  }

  // Se houver data de batismo, verificar se a data de nascimento é anterior
  if (baptismDate && birthDateObj.isAfter(dayjs(baptismDate))) {
    return false
  }

  return true
}

// Função para validar data de batismo
const validateBaptismDate = (baptismDate: string | null | undefined, birthDate?: string) => {
  // Se não houver data de batismo, é válido
  if (!baptismDate) return true

  const baptismDateObj = dayjs(baptismDate)
  const today = dayjs()

  // Verificar se a data de batismo não é futura
  if (baptismDateObj.isAfter(today)) {
    return false
  }

  // Se houver data de nascimento, verificar se a data de batismo é posterior
  if (birthDate && baptismDateObj.isBefore(dayjs(birthDate))) {
    return false
  }

  return true
}

// Função para validar data de treinamento
const validateTrainingDate = (trainingDate: string | null | undefined) => {
  // Se não houver data de treinamento, é válido
  if (!trainingDate) return true

  const trainingDateObj = dayjs(trainingDate)
  const today = dayjs()

  // Verificar se a data de treinamento não é futura
  if (trainingDateObj.isAfter(today)) {
    return false
  }

  return true
}

const unmaskPhoneNumber = (value: string) => {
  return value.replace(/\D/g, "") // remove tudo que não for número
}

// Esquema principal do formulário
export const petitionFormSchema = z
  .object({
    petitionId: z.string(),
    // Campos obrigatórios
    name: z.string().min(1, "Nome é obrigatório").min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    phone: z
      .string()
      .min(1, "Telefone é obrigatório")
      .refine((value) => {
        const unmaskedValue = unmaskPhoneNumber(value)
        return unmaskedValue.length === 11
      }, "Telefone deve ter 11 dígitos"),

    // Campos opcionais
    birthDate: z.string().optional(),
    sex: z.enum(["MALE", "FEMALE"]).optional().default("FEMALE"),
    civilStatus: z.string().optional().default("SINGLE"),
    languages: z.array(z.string()).optional().default(["Português"]),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    congregationId: z.number().optional().nullable(),
    baptismDate: z.string().optional().nullable(),
    lastTrainingDate: z.string().optional().nullable(),
    attributions: z.array(z.string()).optional().default([]),
    hasMinorChild: z.boolean().optional().default(false),
    spouseParticipant: z.boolean().optional().default(false),
    availability: availabilitySchema.optional().default({
      Monday: { morning: false, afternoon: false, evening: false },
      Tuesday: { morning: false, afternoon: false, evening: false },
      Wednesday: { morning: false, afternoon: false, evening: false },
      Thursday: { morning: false, afternoon: false, evening: false },
      Friday: { morning: false, afternoon: false, evening: false },
      Saturday: { morning: false, afternoon: false, evening: false },
      Sunday: { morning: false, afternoon: false, evening: false },
    }),
    image: z.string().optional(),
    groups: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    ).optional().default([]),
  })
  .refine(
    (data) => {
      // Validar a data de nascimento em relação à data de batismo
      return validateBirthDate(data.birthDate, data.baptismDate)
    },
    {
      message: "Data de nascimento deve ser pelo menos 14 anos antes da data atual ou da data de batismo",
      path: ["birthDate"], // Indica que o erro está no campo birthDate
    },
  )
  .refine(
    (data) => {
      // Validar a data de batismo em relação à data de nascimento
      return validateBaptismDate(data.baptismDate, data.birthDate)
    },
    {
      message: "Data de batismo deve ser posterior à data de nascimento e não pode ser futura",
      path: ["baptismDate"], // Indica que o erro está no campo baptismDate
    },
  )
  .refine(
    (data) => {
      // Validar a data de treinamento
      return validateTrainingDate(data.lastTrainingDate)
    },
    {
      message: "Data de treinamento não pode ser futura",
      path: ["lastTrainingDate"], // Indica que o erro está no campo lastTrainingDate
    },
  )

export type PetitionFormValues = z.infer<typeof petitionFormSchema>
