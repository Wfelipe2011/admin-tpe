"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { ProtectedLayout } from "@/app/layout-protected"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CalendarCheck, MapPin, ClipboardList, Eye, EyeOff } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DonutChart } from "@/components/dashboard/donut-chart"
import type { IDashboard } from "@/types/dashboard"
import { apiClient } from "@/lib/api-client"
import { useGroupStore } from "@/lib/stores/use-group-store"

// Remove the Cookies import since we're using Zustand now

// Add a helper function to format the metric values
const formatMetricValue = (value: number | string): string => {
  return String(value)
}

export default function DashboardPage() {
  // Use the Zustand store instead of local state and cookies
  const { selectedGroupId } = useGroupStore()

  const [dashboardData, setDashboardData] = useState<IDashboard | null>(null)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [namesVisible, setNamesVisible] = useState<boolean>(false)

  const toggleNamesVisibility = () => {
    setNamesVisible(true)

    // Configurar timer para esconder os nomes após 30 segundos
    setTimeout(() => {
      setNamesVisible(false)
    }, 30000) // 30 segundos
  }

  // Remove the cookie checking effect since we're using Zustand now

  // Fetch dashboard data when selectedGroupId changes
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoadingDashboard(true)

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
  const calculateTrainingsPercentage = () => {
    if (!dashboardData?.trainings) return 0

    const total = dashboardData.trainings.valid + dashboardData.trainings.expired
    if (total === 0) return 0

    return Math.round((dashboardData.trainings.valid / total) * 100)
  }

  const isLoading = isLoadingDashboard

  return (
    <ProtectedLayout title="Dashboard" breadcrumbs={[]}>
      <div className="space-y-8">
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

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
          <AvatarImage src={image || "/placeholder.svg"} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className={`font-medium ${blurred ? "blur-sm select-none" : ""}`}>{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded-full">{count}</span>
      </div>
    </div>
  )
}
