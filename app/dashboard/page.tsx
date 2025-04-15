"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { ProtectedLayout } from "@/app/layout-protected"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, CalendarCheck, MapPin, ClipboardList, Eye, EyeOff } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DonutChart } from "@/components/dashboard/donut-chart"
import type { IGroups } from "@/types/groups"
import type { IDashboard } from "@/types/dashboard"
import { apiClient } from "@/lib/api-client"
import Cookies from "js-cookie"

// Import getUserFromToken to get the user's profile and groupId
import { getUserFromToken } from "@/lib/auth-utils"

// Add a helper function to sort groups by weekday and start time
const sortGroupsByWeekdayAndTime = (groups: IGroups[]) => {
  const weekdayOrder: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    DOMINGO: 0,
    SEGUNDA: 1,
    TERCA: 2,
    QUARTA: 3,
    QUINTA: 4,
    SEXTA: 5,
    SABADO: 6,
  }

  return [...groups].sort((a, b) => {
    // First sort by weekday
    const weekdayA = weekdayOrder[a.configWeekday] || 0
    const weekdayB = weekdayOrder[b.configWeekday] || 0

    if (weekdayA !== weekdayB) {
      return weekdayA - weekdayB
    }

    // Then sort by start time
    return a.configStartHour.localeCompare(b.configStartHour)
  })
}

// Add a new function to format the metric values
const formatMetricValue = (value: number | string): string => {
  return value
}

export default function DashboardPage() {
  const [groups, setGroups] = useState<IGroups[]>([])
  // Update the useState for selectedGroupId to check the user's profile
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    // Get user from token
    const user = getUserFromToken()

    // If user is CAPTAIN, force select their group
    if (user?.profile === "CAPTAIN" && user?.groupId) {
      return user.groupId
    }

    // Otherwise, use cookie or default to "todos"
    return Cookies.get("selectedGroupId") || "todos"
  })
  const [dashboardData, setDashboardData] = useState<IDashboard | null>(null)
  const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(true)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  // Add state to track if select should be disabled
  const [isSelectDisabled, setIsSelectDisabled] = useState<boolean>(false)
  const [namesVisible, setNamesVisible] = useState<boolean>(false)

  const toggleNamesVisibility = () => {
    setNamesVisible(true)

    // Configurar timer para esconder os nomes após 30 segundos
    setTimeout(() => {
      setNamesVisible(false)
    }, 30000) // 30 segundos
  }

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoadingGroups(true)
        const data = await apiClient.get<IGroups[]>("/groups", { endpoint: "new" })
        const sortedGroups = sortGroupsByWeekdayAndTime(data)
        setGroups(sortedGroups)
        setError(null)
      } catch (err) {
        console.error("Erro ao buscar grupos:", err)
        setError("Não foi possível carregar os grupos. Tente novamente mais tarde.")
      } finally {
        setIsLoadingGroups(false)
      }
    }

    fetchGroups()
  }, [])

  // Fetch dashboard data when selectedGroupId changes
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoadingDashboard(true)

        // Save selected group to cookie
        if (selectedGroupId === "todos") {
          Cookies.remove("selectedGroupId")
        } else {
          Cookies.set("selectedGroupId", selectedGroupId, { expires: 30 }) // expires in 30 days
        }

        // Build URL with query parameter if a specific group is selected
        const url = selectedGroupId === "todos" ? "/dashboard" : `/dashboard?groupId=${selectedGroupId}`

        const data = await apiClient.get<IDashboard>(url, { endpoint: "new" })
        setDashboardData(data)
        setError(null)
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err)
        setError("Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.")
        setDashboardData(null)
      } finally {
        setIsLoadingDashboard(false)
      }
    }

    fetchDashboardData()
  }, [selectedGroupId])

  // Format weekday for display
  const formatWeekday = (weekday: string) => {
    const weekdayMap: Record<string, string> = {
      SUNDAY: "Domingo",
      MONDAY: "Segunda",
      TUESDAY: "Terça",
      WEDNESDAY: "Quarta",
      THURSDAY: "Quinta",
      FRIDAY: "Sexta",
      SATURDAY: "Sábado",
      DOMINGO: "Domingo",
      SEGUNDA: "Segunda",
      TERCA: "Terça",
      QUARTA: "Quarta",
      QUINTA: "Quinta",
      SEXTA: "Sexta",
      SABADO: "Sábado",
    }

    return weekdayMap[weekday] || weekday
  }

  // Calculate percentage for male/female ratio
  const calculateGenderPercentage = () => {
    if (!dashboardData?.participants) return { male: 0, female: 0 }

    const total = dashboardData.participants.MALE + dashboardData.participants.FEMALE
    if (total === 0) return { male: 0, female: 0 }

    return {
      male: Math.round((dashboardData.participants.MALE / total) * 100),
      female: Math.round((dashboardData.participants.FEMALE / total) * 100),
    }
  }

  // Calculate vacancy percentage
  const calculateVacancyPercentage = () => {
    if (!dashboardData) return 0

    // Assuming total capacity is the sum of participants and vacancies
    const totalCapacity = dashboardData.participants.MALE + dashboardData.participants.FEMALE + dashboardData.vacancies
    if (totalCapacity === 0) return 0

    return Math.round((dashboardData.vacancies / totalCapacity) * 100)
  }

  // Add this function to calculate the percentage of valid trainings
  // Add it near the other calculate functions (like calculateGenderPercentage)
  const calculateTrainingsPercentage = () => {
    if (!dashboardData?.trainings) return 0

    const total = dashboardData.trainings.valid + dashboardData.trainings.expired
    if (total === 0) return 0

    return Math.round((dashboardData.trainings.valid / total) * 100)
  }

  // Add useEffect to check user profile and set select disabled state
  useEffect(() => {
    const user = getUserFromToken()

    // If user is CAPTAIN, disable the select
    if (user?.profile === "CAPTAIN") {
      setIsSelectDisabled(true)
    }
  }, [])

  const isLoading = isLoadingGroups || isLoadingDashboard

  return (
    <ProtectedLayout title="Dashboard" breadcrumbs={[]}>
      <div className="space-y-8">
        <div className="w-64">
          {/* Update the Select component to use the isSelectDisabled state */}
          <Select
            value={selectedGroupId}
            onValueChange={setSelectedGroupId}
            disabled={isLoadingGroups || isSelectDisabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoadingGroups ? "Carregando grupos..." : "Selecione um grupo"} />
            </SelectTrigger>
            <SelectContent>
              {/* Only show "Todos os Grupos" option if user is not CAPTAIN */}
              {!isSelectDisabled && <SelectItem value="todos">Todos os Grupos</SelectItem>}

              {/* Filter groups if user is CAPTAIN */}
              {groups
                .filter((group) => {
                  const user = getUserFromToken()
                  return !isSelectDisabled || group.id === user?.groupId
                })
                .map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name} - {formatWeekday(group.configWeekday)} {group.configStartHour}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Dados Gerais */}
          <Card className="bg-white shadow-sm h-fit">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium">Dados Gerais</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <MetricCard
                  value={isLoading ? "..." : dashboardData?.groups || 0}
                  label="Grupos"
                  icon={<Users className="h-6 w-6" />}
                  isLoading={isLoading}
                  selectedGroupId={selectedGroupId}
                />
                <MetricCard
                  value={isLoading ? "..." : `${dashboardData?.averagePresence || 0}%`}
                  label="Presença"
                  icon={<CalendarCheck className="h-6 w-6" />}
                  isLoading={isLoading}
                  selectedGroupId={selectedGroupId}
                />
                <MetricCard
                  value={isLoading ? "..." : dashboardData?.points || 0}
                  label="Pontos"
                  icon={<MapPin className="h-6 w-6" />}
                  isLoading={isLoading}
                  selectedGroupId={selectedGroupId}
                />
                <MetricCard
                  value={isLoading ? "..." : dashboardData?.waitingList || 0}
                  label="Em lista de espera"
                  icon={<ClipboardList className="h-6 w-6" />}
                  isLoading={isLoading}
                  selectedGroupId={selectedGroupId}
                />
              </div>
            </CardContent>
          </Card>

          {/* Gráficos */}
          <Card className="bg-white shadow-sm h-fit">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium">Gráficos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Carregando gráficos...</p>
                  </div>
                ) : (
                  <>
                    <ChartCard title="Treinamentos" percentage={calculateTrainingsPercentage()} />
                    <ChartCard title="Varões" percentage={calculateGenderPercentage().male} />
                    <ChartCard title="Vagas" percentage={calculateVacancyPercentage()} />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lista de Atenção */}
          <Card className="bg-white shadow-sm h-fit">
            <CardHeader className="pb-2 flex flex-row justify-between items-center">
              <CardTitle className="text-xl font-medium">Lista de Atenção</CardTitle>
              <button
                onClick={toggleNamesVisibility}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={namesVisible ? "Ocultar nomes" : "Mostrar nomes"}
              >
                {namesVisible ? (
                  <EyeOff className="h-5 w-5 text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">Carregando lista...</p>
                </div>
              ) : dashboardData?.incidents && dashboardData.incidents.length > 0 ? (
                <div className="divide-y">
                  {dashboardData.incidents.map((incident, index) => (
                    <PersonItem
                      key={`${incident.name}-${index}`}
                      name={incident.name}
                      count={incident.count}
                      image={incident.profilePhoto}
                      blurred={!namesVisible}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">Nenhum incidente encontrado</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  )
}

interface MetricCardProps {
  value: number | string
  label: string
  icon?: React.ReactNode
  isLoading?: boolean
  selectedGroupId: string
}

function MetricCard({ value, label, icon, isLoading = false, selectedGroupId }: MetricCardProps) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-[#1E2462] to-[#374192] text-white border-none">
      <CardContent className="p-2 flex flex-col items-center justify-center text-center">
        {icon && <div className="mb-2">{icon}</div>}
        <div className="text-2xl font-bold mb-1">
          {isLoading ? <span className="opacity-50">...</span> : formatMetricValue(value)}
        </div>
        <p className="text-blue-100">{label === "Grupos" && selectedGroupId !== "todos" ? "Voluntários" : label}</p>
      </CardContent>
    </Card>
  )
}

interface ChartCardProps {
  title: string
  percentage: number
}

// Update the ChartCard component to use the new DonutChart props

function ChartCard({ title, percentage }: ChartCardProps) {
  // Calculate additional data based on the chart type
  let centerText = `${percentage}%`
  let centerSubtext = ""

  if (title === "Varões") {
    centerText = `${percentage}%`
    centerSubtext = "Homens"
  } else if (title === "Vagas") {
    centerText = `${percentage}%`
    centerSubtext = "Disponíveis"
  } else if (title === "Treinamentos") {
    centerText = `${percentage}%`
    centerSubtext = "Válidos"
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-48 h-48 mb-2">
        <DonutChart percentage={percentage} centerText={centerText} centerSubtext={centerSubtext} />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
    </div>
  )
}

interface PersonItemProps {
  name: string
  count: number
  image: string
  blurred?: boolean
}

function PersonItem({ name, count, image, blurred = false }: PersonItemProps) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className={`font-medium ${blurred ? "blur-sm select-none" : ""}`}>{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded-full">{count}</span>
        {/*<ChevronRight className="h-5 w-5 text-gray-400" />*/}
      </div>
    </div>
  )
}
