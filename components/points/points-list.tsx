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
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="text-muted-foreground">
          <svg
            className="mx-auto h-16 w-16 mb-4"
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
          <h3 className="text-lg font-medium text-foreground">Selecione um grupo</h3>
          <p className="text-sm">Selecione um grupo para visualizar e editar os pontos.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
          Carregando pontos...
        </div>
      </div>
    )
  }

  const allPoints = [...points, ...newPoints]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pontos do Grupo</h2>
          <p className="text-muted-foreground">
            {allPoints.length === 0
              ? "Nenhum ponto cadastrado"
              : `${points.length} ${points.length === 1 ? "ponto cadastrado" : "pontos cadastrados"}${
                  newPoints.length > 0 ? ` (+${newPoints.length} novo${newPoints.length > 1 ? "s" : ""})` : ""
                }`}
          </p>
        </div>
        <Button onClick={handleCreatePoint}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Ponto
        </Button>
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
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <svg
              className="mx-auto h-16 w-16 mb-4"
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
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum ponto cadastrado</h3>
            <p className="text-sm mb-4">Adicione pontos para organizar as designações do grupo.</p>
            <Button onClick={handleCreatePoint}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Ponto
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}