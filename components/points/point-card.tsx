"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPinned, Save, X } from "lucide-react"
import type { GroupPoint, UpdateGroupPointRequest } from "@/types/points"
import { useToast } from "@/hooks/use-toast"

interface PointCardProps {
  point: GroupPoint
  onUpdate: (pointId: string, data: UpdateGroupPointRequest) => Promise<void>
  onCancel?: () => void
  isNew?: boolean
}

export function PointCard({ point, onUpdate, onCancel, isNew = false }: PointCardProps) {
  const [isEditing, setIsEditing] = useState(isNew)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    pointName: point.pointName,
    cartName: point.cartName || "",
    minParticipants: point.minParticipants,
    maxParticipants: point.maxParticipants,
    status: point.status,
  })
  const { toast } = useToast()

  const handleSave = async () => {
    // Validações
    if (!formData.pointName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do ponto é obrigatório",
        variant: "destructive",
      })
      return
    }

    if (!formData.cartName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do carrinho é obrigatório",
        variant: "destructive",
      })
      return
    }

    if (formData.minParticipants < 1) {
      toast({
        title: "Erro",
        description: "Quantidade mínima deve ser pelo menos 1",
        variant: "destructive",
      })
      return
    }

    if (formData.maxParticipants < formData.minParticipants) {
      toast({
        title: "Erro",
        description: "Quantidade máxima deve ser maior ou igual à mínima",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await onUpdate(point.id, formData)
      setIsEditing(false)
      toast({
        title: "Sucesso",
        description: `Ponto ${isNew ? "criado" : "atualizado"} com sucesso`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao ${isNew ? "criar" : "atualizar"} ponto`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (isNew && onCancel) {
      onCancel()
    } else {
      // Reset form data
      setFormData({
        pointName: point.pointName,
        cartName: point.cartName || "",
        minParticipants: point.minParticipants,
        maxParticipants: point.maxParticipants,
        status: point.status,
      })
      setIsEditing(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  return (
    <Card className={`min-h-[300px] relative ${isNew ? "border-dashed border-2 border-primary/30" : ""}`}>
      <CardHeader className="p-4 pt-7">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPinned className="h-5 w-5 text-primary" />
            {isEditing ? (
              <Input
                value={formData.pointName}
                onChange={(e) => setFormData({ ...formData, pointName: e.target.value })}
                placeholder="Nome do ponto"
                className="text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0"
              />
            ) : (
              <CardTitle className="text-lg">{formData.pointName || "Novo Ponto"}</CardTitle>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={formData.status ? "default" : "outline"} className="absolute top-0 right-0 m-1 mr-2">
              {formData.status ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor={`status-${point.id}`} className="text-sm font-medium">
            Status Inicial
          </Label>
          <Checkbox
            id={`status-${point.id}`}
            checked={formData.status}
            onCheckedChange={(checked: boolean) => setFormData({ ...formData, status: checked })}
            disabled={!isEditing}
          />
        </div>

        {/* Cart Name */}
        <div className="space-y-2">
          <Label htmlFor={`cart-${point.id}`} className="text-sm font-medium">
            Nome do Carrinho
          </Label>
          {isEditing ? (
            <Input
              id={`cart-${point.id}`}
              value={formData.cartName}
              onChange={(e) => setFormData({ ...formData, cartName: e.target.value })}
              placeholder="Nome do carrinho"
            />
          ) : (
            <div className="p-2 bg-muted rounded-md text-sm">
              {formData.cartName || "Não informado"}
            </div>
          )}
        </div>

        {/* Min Participants */}
        <div className="space-y-2">
          <Label htmlFor={`min-${point.id}`} className="text-sm font-medium">
            Quantidade Mínima
          </Label>
          {isEditing ? (
            <Input
              id={`min-${point.id}`}
              type="number"
              min="1"
              value={formData.minParticipants}
              onChange={(e) =>
                setFormData({ ...formData, minParticipants: parseInt(e.target.value) || 1 })
              }
            />
          ) : (
            <div className="p-2 bg-muted rounded-md text-sm">
              {formData.minParticipants} {formData.minParticipants === 1 ? "participante" : "participantes"}
            </div>
          )}
        </div>

        {/* Max Participants */}
        <div className="space-y-2">
          <Label htmlFor={`max-${point.id}`} className="text-sm font-medium">
            Quantidade Máxima
          </Label>
          {isEditing ? (
            <Input
              id={`max-${point.id}`}
              type="number"
              min={formData.minParticipants}
              value={formData.maxParticipants}
              onChange={(e) =>
                setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 1 })
              }
            />
          ) : (
            <div className="p-2 bg-muted rounded-md text-sm">
              {formData.maxParticipants} {formData.maxParticipants === 1 ? "participante" : "participantes"}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Salvando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar
                  </div>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleEdit} className="flex-1">
              Editar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}