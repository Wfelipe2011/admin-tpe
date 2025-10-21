"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { DesignationParticipant } from "@/types/participant-designation"

interface DesignationCardProps {
  designation: DesignationParticipant
  onRefuse: () => void
}

export function DesignationCard({ designation, onRefuse }: DesignationCardProps) {
  // Safely calculate total carts with null checking
  const totalCarts = designation?.publication_carts
    ? designation.publication_carts.reduce((acc, cart) => acc + (cart.quantity || 0), 0)
    : 15 // Fallback to 15 if publication_carts is undefined

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4 sm:p-6">
        <ul className="space-y-3 sm:space-y-4">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span className="font-bold text-sm sm:text-base">Ponto:</span>
            <span className="ml-1 text-sm sm:text-base">
              {designation?.point || "Não especificado"} /Carrinhos: {totalCarts}
            </span>
          </li>

          <li className="flex flex-col">
            <div className="flex items-start">
              <span className="mr-2">•</span>
              <span className="font-bold text-sm sm:text-base">Companheiros:</span>
            </div>

            <ul className="ml-6 mt-2 space-y-1 sm:space-y-2">
              {designation?.participants?.length > 0 ? (
                designation.participants.map((participant, index) => (
                  <li key={index} className="flex items-center text-sm sm:text-base">
                    {participant.name}
                    <span className="ml-1">{index % 2 === 0 ? "(👨)" : "(👩)"}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm sm:text-base">Nenhum participante encontrado</li>
              )}
            </ul>
          </li>
        </ul>

        <div className="mt-4 sm:mt-6 flex justify-end">
          <Button onClick={onRefuse} className="bg-[#c34a4a] hover:bg-[#b43e3e] text-white">
            RECUSAR
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
