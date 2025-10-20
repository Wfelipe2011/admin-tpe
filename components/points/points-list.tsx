"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useGroupStore } from "@/lib/stores/use-group-store"
import { PointsService, DEFAULT_NEW_POINT } from "@/lib/points-service"
import { PointCard } from "@/components/points/point-card"
import type { GroupPoint, CreateGroupPointRequest, UpdateGroupPointRequest } from "@/types/points"
import { useToast } from "@/hooks/use-toast"

export function PointsList() {
  const [points, setPoints] = useState<GroupPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [newPoints, setNewPoints] = useState<GroupPoint[]>([])
  const { selectedGroupId } = useGroupStore()
  const { toast } = useToast()

  // Load points when group changes
  useEffect(() => {
    const loadPoints = async () => {
      if (!selectedGroupId || selectedGroupId === "todos") {
        setPoints([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const groupPoints = await PointsService.getGroupPoints(selectedGroupId)
        setPoints(groupPoints)
      } catch (error) {
        console.error("Error loading points:", error)
        toast({
          title: "Erro",
          description: "Falha ao carregar pontos do grupo",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadPoints()
    // Clear new points when group changes
    setNewPoints([])
  }, [selectedGroupId, toast])

  const handleCreatePoint = () => {
    if (!selectedGroupId || selectedGroupId === "todos") {
      toast({
        title: "Erro",
        description: "Selecione um grupo para adicionar pontos",
        variant: "destructive",
      })
      return
    }

    const newPoint: GroupPoint = {
      id: `new-${Date.now()}`,
      pointId: `new-point-${Date.now()}`,
      pointName: DEFAULT_NEW_POINT.pointName,
      cartName: DEFAULT_NEW_POINT.cartName,
      minParticipants: DEFAULT_NEW_POINT.minParticipants,
      maxParticipants: DEFAULT_NEW_POINT.maxParticipants,
      status: DEFAULT_NEW_POINT.status,
      groupId: selectedGroupId,
    }

    setNewPoints((prev) => [...prev, newPoint])
  }

  const handleUpdatePoint = async (pointId: string, data: UpdateGroupPointRequest) => {
    try {
      // Check if it's a new point
      const isNewPoint = newPoints.some((p) => p.id === pointId)

      if (isNewPoint) {
        // Create new point
        const createData: CreateGroupPointRequest = {
          pointName: data.pointName,
          cartName: data.cartName,
          minParticipants: data.minParticipants,
          maxParticipants: data.maxParticipants,
          status: data.status,
          groupId: selectedGroupId!,
        }

        const createdPoint = await PointsService.createGroupPoint(createData)

        // Remove from new points and add to main points
        setNewPoints((prev) => prev.filter((p) => p.id !== pointId))
        setPoints((prev) => [...prev, createdPoint])
      } else {
        // Update existing point
        const updatedPoint = await PointsService.updateGroupPoint(pointId, data)

        setPoints((prev) => prev.map((p) => (p.id === pointId ? updatedPoint : p)))
      }
    } catch (error) {
      console.error("Error updating point:", error)
      throw error // Re-throw to let the component handle the error display
    }
  }

  const handleCancelNewPoint = (pointId: string) => {
    setNewPoints((prev) => prev.filter((p) => p.id !== pointId))
  }

  // Show message when no group is selected
  if (!selectedGroupId || selectedGroupId === "todos") {
    return (
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#374192]/10">
            <svg
              className="w-8 h-8 text-[#374192]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#333333] mb-2">Selecione um Grupo</h3>
            <p className="text-[#666666]">
              Selecione um grupo específico para visualizar e gerenciar os pontos de designação.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-8 h-8 border-4 border-[#374192] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#666666] font-medium">Carregando pontos...</p>
        </div>
      </div>
    )
  }

  const allPoints = [...points, ...newPoints]

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#333333] flex items-center gap-2">
              <div className="w-2 h-2 bg-[#374192] rounded-full"></div>
              Pontos do Grupo
            </h2>
            <p className="text-[#666666] mt-2">
              {allPoints.length === 0
                ? "Nenhum ponto cadastrado para este grupo"
                : `${points.length} ${points.length === 1 ? "ponto cadastrado" : "pontos cadastrados"}${newPoints.length > 0 ? ` (+${newPoints.length} novo${newPoints.length > 1 ? "s" : ""})` : ""
                }`}
            </p>
          </div>
          <Button
            onClick={handleCreatePoint}
            className="bg-[#374192] hover:bg-[#46607F] text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Ponto
          </Button>
        </div>
      </div>

      {/* Points Grid */}
      {allPoints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* New points first */}
          {newPoints.map((point) => (
            <PointCard
              key={point.id}
              point={point}
              onUpdate={handleUpdatePoint}
              onCancel={() => handleCancelNewPoint(point.id)}
              isNew
            />
          ))}
          {/* Existing points after */}
          {points.map((point) => (
            <PointCard key={point.id} point={point} onUpdate={handleUpdatePoint} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-12">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#929BD2]/10">
              <svg
                className="w-8 h-8 text-[#929BD2]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#333333] mb-2">Nenhum ponto cadastrado</h3>
              <p className="text-[#666666] mb-6">
                Adicione pontos para organizar as designações deste grupo de forma eficiente.
              </p>
              <Button
                onClick={handleCreatePoint}
                className="bg-[#374192] hover:bg-[#46607F] text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Ponto
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}