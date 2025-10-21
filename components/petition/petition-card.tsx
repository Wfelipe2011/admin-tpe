"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, ExternalLink, InfoIcon, CheckIcon, BanIcon, XIcon, ClockIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { IPetitions, Status } from "@/types/petitions"

interface PetitionCardProps {
  petition: IPetitions
}

export function PetitionCard({ petition }: PetitionCardProps) {
  const status: Record<Status, string> = {
    WAITING_INFORMATION: "Aguardando Informações",
    WAITING: "Em espera",
    ACTIVE: "Ativo",
    SUSPENDED: "Suspensa",
    EXCLUDED: "Excluída",
    CREATED: "Aguardando confirmação",
    ALL: "Todos",
  }

  const statusIcon: Record<Status, React.ReactNode> = {
    WAITING_INFORMATION: <InfoIcon className="h-4 w-4 text-[#D4C159]" />,
    WAITING: <CheckIcon className="h-4 w-4 text-[#89B275]" />,
    ACTIVE: <CheckIcon className="h-4 w-4 text-[#89B275]" />,
    SUSPENDED: <BanIcon className="h-4 w-4 text-[#D4C159]" />,
    EXCLUDED: <XIcon className="h-4 w-4 text-[#D46559]" />,
    CREATED: <ClockIcon className="h-4 w-4 text-[#D48859]" />,
    ALL: <InfoIcon className="h-4 w-4" />,
  }

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "WAITING_INFORMATION":
        return "bg-[#D4C159]/10 text-[#D4C159] hover:bg-[#D4C159]/10"
      case "WAITING":
      case "ACTIVE":
        return "bg-[#89B275]/10 text-[#89B275] hover:bg-[#89B275]/10"
      case "SUSPENDED":
        return "bg-[#D4C159]/10 text-[#D4C159] hover:bg-[#D4C159]/10"
      case "EXCLUDED":
        return "bg-[#D46559]/10 text-[#D46559] hover:bg-[#D46559]/10"
      case "CREATED":
        return "bg-[#D48859]/10 text-[#D48859] hover:bg-[#D48859]/10"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const formatDate = (date: Date) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  return (
    <Card className="overflow-hidden w-full">
      <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base sm:text-lg">{petition.name}</CardTitle>
          <Badge className={getStatusColor(petition.status)}>
            <span className="flex items-center gap-1">
              {statusIcon[petition.status]}
              <span className="text-xs sm:text-sm">{status[petition.status]}</span>
            </span>
          </Badge>
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Protocolo: {petition.protocol}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-2 sm:pb-3 p-3 sm:p-6 pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs sm:text-sm">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <span>Criado em: {formatDate(petition.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            {petition.publicUrl && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 sm:h-9 text-xs sm:text-sm"
                onClick={() => window.open(petition.publicUrl, "_blank")}
              >
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Ver Documento
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
