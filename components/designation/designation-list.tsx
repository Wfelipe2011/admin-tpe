"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, Filter, LayoutGrid, List, Clock } from "lucide-react"
import { getUserFromToken } from "@/lib/auth-utils"
import { apiClient } from "@/lib/api-client"
import { ParticipantCard } from "@/components/designation/participant-card"
import { ParticipantCardLarge } from "@/components/designation/participant-card-large"
import type { IParticipants, IDesignation } from "@/types/designation"
import Link from "next/link"
import Cookies from "js-cookie"

export function DesignationList() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [participants, setParticipants] = useState<IParticipants[]>([])
  const [designationDetails, setDesignationDetails] = useState<IDesignation | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [backgroundColor, setBackgroundColor] = useState("blue")

  // Get user token and extract groupId
  const fetchData = async () => {
    try {
      setLoading(true)
      const user = getUserFromToken()

      if (!user) {
        console.error("User not found in token")
        setLoading(false)
        return
      }

      // First try to get groupId from cookies, then fall back to user.groupId
      const cookieGroupId = Cookies.get("selectedGroupId")
      const groupId = cookieGroupId || user.groupId

      if (!groupId) {
        console.error("No groupId found in cookie or user token")
        setLoading(false)
        return
      }

      // Rest of the function remains the same
      // Fetch designation details
      const designationData = await apiClient.get<IDesignation>(`/groups/${groupId}/designations/week-details`)
      setDesignationDetails(designationData)

      // Calculate countdown if we have end date
      if (designationData?.designation?.designationEndDate) {
        startCountdown(new Date(designationData.designation.designationEndDate))
      }

      // Fetch participants
      const participantsData = await apiClient.get<IParticipants[]>(`/participants?groupId=${groupId}`)
      setParticipants(participantsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Function to start countdown timer
  const startCountdown = (endDate: Date) => {
    const timer = setInterval(() => {
      const now = new Date()
      const difference = endDate.getTime() - now.getTime()
      const total = difference

      if (difference <= 0) {
        clearInterval(timer)
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        setBackgroundColor("green")
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setCountdown({ days, hours, minutes, seconds })

      // Set background color based on time remaining
      if (days > 1) {
        setBackgroundColor("blue")
      } else if (total < 0) {
        setBackgroundColor("green")
      } else if (hours < 2) {
        setBackgroundColor("red")
      } else {
        setBackgroundColor("yellow")
      }
    }, 1000)

    return () => clearInterval(timer)
  }

  // Handle participant status change (absence added or removed)
  const handleParticipantStatusChange = () => {
    fetchData() // Refresh the data
  }

  // Filter participants based on search term
  const filteredParticipants = participants.filter((participant) =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Format countdown for display
  const formattedCountdown = `${countdown.days.toString().padStart(2, "0")}D ${countdown.hours.toString().padStart(2, "0")}:${countdown.minutes.toString().padStart(2, "0")}:${countdown.seconds.toString().padStart(2, "0")}`

  // Add the getStatusText function inside the component
  const getStatusText = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Em aberto"
      case "IN_PROGRESS":
        return "Em progresso"
      case "COMPLETED":
        return "Concluído"
      case "ARCHIVED":
        return "Arquivado"
      case "CANCELLED":
        return "Cancelado"
      default:
        return "Desconhecido"
    }
  }

  // Add the getStatusColor function inside the component
  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "text-yellow-600 font-semibold"
      case "IN_PROGRESS":
        return "text-purple-600 font-semibold"
      case "COMPLETED":
        return "text-green-600 font-semibold"
      case "ARCHIVED":
        return "text-blue-600 font-semibold"
      case "CANCELLED":
        return "text-red-600 font-semibold"
      default:
        return "text-gray-600 font-semibold"
    }
  }

  return (
    <>
      {/* Countdown timers */}
      <div className="w-full md:-mt-[3rem] mb-4 md:mb-0">
        {/* Countdown timer desktop */}
        <div className="hidden md:flex justify-end mb-4">
          <div
            className={`
            flex flex-row items-center border-[1px] border-[solid] border-[#ccc] h-[46px] py-1 px-3 md:py-4 md:px-3 rounded-lg gap-2 justify-center
            ${backgroundColor === "blue" ? "bg-blue-900" : ""}
            ${backgroundColor === "yellow" ? "bg-yellow-900" : ""}
            ${backgroundColor === "red" ? "bg-red-500" : ""}
            ${backgroundColor === "green" ? "bg-green-500" : ""}
            text-white
          `}
          >
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Prazo de Designação</span>
            <span className="text-sm font-bold">{formattedCountdown}</span>
          </div>
        </div>
        <div className="md:hidden w-full">
          <div
            className={`
            flex flex-row items-center border-[1px] border-[solid] border-[#ccc] h-[46px] py-1 px-3 rounded-lg gap-2 justify-center w-full
            ${backgroundColor === "blue" ? "bg-blue-900" : ""}
            ${backgroundColor === "yellow" ? "bg-yellow-900" : ""}
            ${backgroundColor === "red" ? "bg-red-500" : ""}
            ${backgroundColor === "green" ? "bg-green-500" : ""}
            text-white
          `}
          >
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Prazo de Designação</span>
            <span className="text-sm font-bold">{formattedCountdown}</span>
          </div>
        </div>
      </div>

      {/* Main content box */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mx-auto">
        <div className="space-y-4">
          {/* Status and Designate button */}
          <div className="flex flex-col md:flex-row justify-between items-start xs:items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Status:{" "}
              <span
                className={
                  designationDetails?.designation?.status
                    ? getStatusColor(designationDetails.designation.status)
                    : "text-gray-600"
                }
              >
                {designationDetails?.designation?.status
                  ? getStatusText(designationDetails.designation.status)
                  : "Carregando..."}
              </span>
            </div>
            <Link href="/lista-designacao/designar">
              <Button size="sm" className="px-4 w-full xs:w-auto">
                Designar
              </Button>
            </Link>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar Voluntário"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center justify-between sm:justify-start w-full sm:w-auto">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtrar</span>
              </Button>
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span className="font-medium text-primary">{filteredParticipants.length}</span> participantes
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          )}

          {/* Participants grid */}
          {!loading && (
            <div
              className={`
              grid gap-4 
              ${
                viewMode === "list"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
              }
            `}
            >
              {filteredParticipants.map((participant) =>
                viewMode === "list" ? (
                  <div key={participant.id} className="max-w-[288px] w-full justify-self-center">
                    <ParticipantCard participant={participant} onStatusChange={handleParticipantStatusChange} />
                  </div>
                ) : (
                  <ParticipantCardLarge
                    key={participant.id}
                    participant={participant}
                    onStatusChange={handleParticipantStatusChange}
                  />
                ),
              )}
            </div>
          )}

          {/* No results */}
          {!loading && filteredParticipants.length === 0 && (
            <Card className="p-8 text-center max-w-3xl mx-auto">
              <p className="text-muted-foreground">Nenhum participante encontrado.</p>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
