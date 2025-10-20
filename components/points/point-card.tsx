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
    <Card className={`min-h-[400px] relative border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${isNew ? "border-dashed border-2 border-[#374192]/50 bg-[#374192]/5" : "bg-white"
      }`}>
      <CardHeader className="p-6 pb-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-lg ${isNew ? "bg-[#374192]/20" : "bg-[#374192]/10"}`}>
              <MapPinned className={`h-5 w-5 ${isNew ? "text-[#374192]" : "text-[#374192]"}`} />
            </div>
            {isEditing ? (
              <Input
                value={formData.pointName}
                onChange={(e) => setFormData({ ...formData, pointName: e.target.value })}
                placeholder="Nome do ponto"
                className="text-lg font-semibold border-gray-200 focus:border-[#374192] focus:ring-[#374192]/20 flex-1"
              />
            ) : (
              <CardTitle className="text-lg font-semibold text-[#333333]">
                {formData.pointName || "Novo Ponto"}
              </CardTitle>
            )}
          </div>
          <Badge
            variant={formData.status ? "default" : "outline"}
            className={`${formData.status
                ? "bg-[#2ECC71] text-white border-[#2ECC71]"
                : "border-gray-300 text-[#666666] bg-gray-50"
              }`}
          >
            {formData.status ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-6 pt-0">
        {/* Status Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
          <Label htmlFor={`status-${point.id}`} className="text-sm font-medium text-[#333333]">
            Status do Ponto
          </Label>
          <Checkbox
            id={`status-${point.id}`}
            checked={formData.status}
            onCheckedChange={(checked: boolean) => setFormData({ ...formData, status: checked })}
            disabled={!isEditing}
            className="data-[state=checked]:bg-[#374192] data-[state=checked]:border-[#374192]"
          />
        </div>

        {/* Cart Name */}
        <div className="space-y-2">
          <Label htmlFor={`cart-${point.id}`} className="text-sm font-semibold text-[#333333]">
            Nome do Carrinho
          </Label>
          {isEditing ? (
            <Input
              id={`cart-${point.id}`}
              value={formData.cartName}
              onChange={(e) => setFormData({ ...formData, cartName: e.target.value })}
              placeholder="Ex: Carrinho A, Carrinho Principal..."
              className="border-gray-200 focus:border-[#374192] focus:ring-[#374192]/20"
            />
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm text-[#666666]">
              {formData.cartName || "Não informado"}
            </div>
          )}
        </div>

        {/* Min Participants */}
        <div className="space-y-2">
          <Label htmlFor={`min-${point.id}`} className="text-sm font-semibold text-[#333333]">
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
              className="border-gray-200 focus:border-[#374192] focus:ring-[#374192]/20"
            />
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm">
              <span className="font-medium text-[#333333]">{formData.minParticipants}</span>
              <span className="text-[#666666] ml-1">
                {formData.minParticipants === 1 ? "participante" : "participantes"}
              </span>
            </div>
          )}
        </div>

        {/* Max Participants */}
        <div className="space-y-2">
          <Label htmlFor={`max-${point.id}`} className="text-sm font-semibold text-[#333333]">
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
              className="border-gray-200 focus:border-[#374192] focus:ring-[#374192]/20"
            />
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm">
              <span className="font-medium text-[#333333]">{formData.maxParticipants}</span>
              <span className="text-[#666666] ml-1">
                {formData.maxParticipants === 1 ? "participante" : "participantes"}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 bg-[#374192] hover:bg-[#46607F] text-white"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar
                  </div>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="border-gray-300 text-[#666666] hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex-1 border-[#929BD2] text-[#374192] hover:bg-[#374192]/10"
            >
              Editar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}