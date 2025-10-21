"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { ProtectedLayout } from "@/app/layout-protected"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CalendarCheck, MapPin, ClipboardList, Eye, EyeOff, BarChart3 } from "lucide-react"
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
    <ProtectedLayout title="Dashboard" breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-4 sm:space-y-8">
        {/* Header Section - Mobile optimized */}
        <div className="bg-gradient-to-r from-[#181C43] to-[#374192] rounded-lg p-4 sm:p-8 text-white">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2">Dashboard</h1>
              <p className="text-blue-100 text-xs sm:text-sm">
                Visão geral dos dados e métricas importantes da congregação
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Content Section - Mobile optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Dados Gerais */}
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#374192] rounded-full"></div>
                <CardTitle className="text-base sm:text-lg font-semibold text-[#333333]">Dados Gerais</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
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
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#929BD2] rounded-full"></div>
                <CardTitle className="text-base sm:text-lg font-semibold text-[#333333]">Gráficos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="space-y-4 sm:space-y-8">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
                    <div className="text-center space-y-4">
                      <div
                        className="w-8 h-8 border-4 border-[#374192] border-t-transparent rounded-full animate-spin mx-auto"
                        aria-hidden="true"
                      ></div>
                      <p className="text-[#666666] font-medium">Carregando gráficos...</p>
                      <span className="sr-only">Carregando dados dos gráficos</span>
                    </div>
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
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4 flex flex-row justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#E74C3C] rounded-full"></div>
                <CardTitle className="text-base sm:text-lg font-semibold text-[#333333]">Lista de Atenção</CardTitle>
              </div>
              <button
                onClick={toggleNamesVisibility}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-[#F8F8F8] transition-colors"
                aria-label={namesVisible ? "Ocultar nomes" : "Mostrar nomes"}
                title={namesVisible ? "Ocultar nomes" : "Mostrar nomes"}
              >
                {namesVisible ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-[#666666]" />
                ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[#666666]" />
                )}
              </button>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
                  <div className="text-center space-y-4">
                    <div
                      className="w-8 h-8 border-4 border-[#374192] border-t-transparent rounded-full animate-spin mx-auto"
                      aria-hidden="true"
                    ></div>
                    <p className="text-[#666666] font-medium">Carregando lista...</p>
                    <span className="sr-only">Carregando dados da lista de atenção</span>
                  </div>
                </div>
              ) : dashboardData?.incidents && dashboardData.incidents.length > 0 ? (
                <div className="divide-y divide-gray-100">
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
                <div className="p-4 sm:p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#F8F8F8]">
                    <ClipboardList className="h-6 w-6 sm:h-8 sm:w-8 text-[#929BD2]" aria-hidden="true" />
                  </div>
                  <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#333333] font-medium">Nenhum incidente encontrado</p>
                  <p className="text-xs sm:text-sm text-[#666666] mt-1">Não há itens de atenção no momento</p>
                </div>
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
    <Card className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#374192] to-[#929BD2] rounded-lg text-white flex-shrink-0">
            <div className="w-4 h-4 sm:w-6 sm:h-6">
              {icon}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="space-y-1 sm:space-y-2">
                <div
                  className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse"
                  aria-hidden="true"
                ></div>
                <div
                  className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 animate-pulse"
                  aria-hidden="true"
                ></div>
              </div>
            ) : (
              <>
                <p className="text-lg sm:text-2xl font-bold text-[#333333] leading-none">
                  {formatMetricValue(value)}
                </p>
                <p className="text-xs sm:text-sm text-[#666666] mt-0.5 sm:mt-1 font-medium">
                  {label === "Grupos" && selectedGroupId !== "todos" ? "Voluntários" : label}
                </p>
              </>
            )}
          </div>
        </div>
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
    <div className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 sm:w-32 sm:h-32 mb-2 sm:mb-4">
          <DonutChart percentage={percentage} centerText={centerText} centerSubtext={centerSubtext} />
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-[#333333] text-center">{title}</h3>
      </div>
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
    <div className="flex items-center justify-between p-3 sm:p-6 hover:bg-gray-50/80 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <Avatar className={`w-8 h-8 sm:w-10 sm:h-10 ${blurred ? "blur-sm select-none" : ""}`}>
          <AvatarImage src={image || "/placeholder.svg"} alt={name} />
          <AvatarFallback className="bg-gradient-to-br from-[#374192] to-[#929BD2] text-white font-medium text-xs sm:text-sm">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className={`font-medium text-sm sm:text-base text-[#333333] ${blurred ? "blur-sm select-none" : ""}`}>
          {name}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm font-semibold bg-red-50 text-red-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-red-200">
          {count}
        </span>
      </div>
    </div>
  )
}
