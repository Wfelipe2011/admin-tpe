"use client"

import type React from "react"

import { useEffect, useState, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, FileText, Calendar } from "lucide-react"
import type { IPetitions, Status } from "@/types/petitions"
import { InfoIcon, CheckIcon, BanIcon, XIcon, ClockIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Upload } from "lucide-react"

// Add import for getUserFromToken and ParticipantProfile
import { getUserFromToken } from "@/lib/auth-utils"
import { ParticipantProfile } from "@/types/auth"

export function PetitionList() {
  const [allPetitions, setAllPetitions] = useState<IPetitions[]>([])
  const [displayedPetitions, setDisplayedPetitions] = useState<IPetitions[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<Status>("ALL")
  const [itemsToShow, setItemsToShow] = useState(10)
  const [hasMoreItems, setHasMoreItems] = useState(false)
  
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  // In the PetitionList component, add this code near the beginning of the component function:
  const user = getUserFromToken()
  const isAdminAnalyst = user?.profile === ParticipantProfile.ADMIN_ANALYST

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
    WAITING_INFORMATION: <InfoIcon className="h-4 w-4 mr-2 text-[#D4C159]" />,
    WAITING: <CheckIcon className="h-4 w-4 mr-2 text-[#89B275]" />,
    ACTIVE: <CheckIcon className="h-4 w-4 mr-2 text-[#89B275]" />,
    SUSPENDED: <BanIcon className="h-4 w-4 mr-2 text-[#D4C159]" />,
    EXCLUDED: <XIcon className="h-4 w-4 mr-2 text-[#D46559]" />,
    CREATED: <ClockIcon className="h-4 w-4 mr-2 text-[#D48859]" />,
    ALL: null,
  }

  const statusColor: Record<Status, string> = {
    WAITING_INFORMATION: "text-[#D4C159]",
    WAITING: "text-[#89B275]",
    ACTIVE: "text-[#89B275]",
    SUSPENDED: "text-[#D4C159]",
    EXCLUDED: "text-[#D46559]",
    CREATED: "text-[#D48859]",
    ALL: "",
  }

  const statusBgColor: Record<Status, string> = {
    WAITING_INFORMATION: "bg-[#FFF8E1]",
    WAITING: "bg-[#E8F5E9]",
    ACTIVE: "bg-[#E8F5E9]",
    SUSPENDED: "bg-[#FFF8E1]",
    EXCLUDED: "bg-[#FFEBEE]",
    CREATED: "bg-[#FFF3E0]",
    ALL: "bg-gray-100",
  }

  const fetchPetitions = useCallback(async () => {
    setIsLoading(true)
    try {
      let url = "https://server.tpedigital.com.br/petitions"
      const params = new URLSearchParams()

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      if (statusFilter && statusFilter !== "ALL") {
        params.append("status", statusFilter)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      const data = await response.json()
      
      // Armazenar todos os dados
      setAllPetitions(data)
      // Reset para mostrar apenas os primeiros 10
      setItemsToShow(10)
      setDisplayedPetitions(data.slice(0, 10))
      setHasMoreItems(data.length > 10)
      
    } catch (error) {
      console.error("Error fetching petitions:", error)
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, statusFilter])

  // Função simples para carregar mais itens
  const loadMoreItems = useCallback(() => {
    if (!hasMoreItems) return
    
    const newItemsToShow = itemsToShow + 10
    setItemsToShow(newItemsToShow)
    setDisplayedPetitions(allPetitions.slice(0, newItemsToShow))
    setHasMoreItems(newItemsToShow < allPetitions.length)
  }, [itemsToShow, allPetitions, hasMoreItems])

  // Observer simples para o scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreItems) {
          loadMoreItems()
        }
      },
      { threshold: 1 }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [loadMoreItems, hasMoreItems])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPetitions()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [fetchPetitions])

  const formatDate = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-10 gap-4 mb-8">
        <div className="md:col-span-5 lg:col-span-5">
          <div className="relative">
            <Input
              placeholder="Pesquisar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
              className="pl-10 pr-4 py-2 bg-white rounded-md border-gray-200 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="md:col-span-3 lg:col-span-3">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Status)} disabled={isLoading}>
            <SelectTrigger className="bg-white border-gray-200 w-full">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="WAITING_INFORMATION">
                <span className="flex items-center">
                  {statusIcon.WAITING_INFORMATION}
                  {status.WAITING_INFORMATION}
                </span>
              </SelectItem>
              <SelectItem value="WAITING">
                <span className="flex items-center">
                  {statusIcon.WAITING}
                  {status.WAITING}
                </span>
              </SelectItem>
              <SelectItem value="ACTIVE">
                <span className="flex items-center">
                  {statusIcon.ACTIVE}
                  {status.ACTIVE}
                </span>
              </SelectItem>
              <SelectItem value="SUSPENDED">
                <span className="flex items-center">
                  {statusIcon.SUSPENDED}
                  {status.SUSPENDED}
                </span>
              </SelectItem>
              <SelectItem value="EXCLUDED">
                <span className="flex items-center">
                  {statusIcon.EXCLUDED}
                  {status.EXCLUDED}
                </span>
              </SelectItem>
              <SelectItem value="CREATED">
                <span className="flex items-center">
                  {statusIcon.CREATED}
                  {status.CREATED}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Then modify the Upload Petição button in the grid layout section to be conditionally rendered: */}
        <div className="md:col-span-2 lg:col-span-2 flex justify-start md:justify-end">
          {!isAdminAnalyst && (
            <Link href="/peticoes/upload-peticao" className="w-full md:w-auto">
              <Button size="default" className="flex items-center gap-2 w-full md:w-auto">
                <Upload className="h-4 w-4" />
                <span>Upload Petição</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Cabeçalho da tabela - visível apenas em telas médias e maiores */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 font-medium text-gray-600 border-b">
          <div className="col-span-3 text-center">Voluntário</div>
          <div className="col-span-3 text-center">Protocolo</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-2 text-center">Data</div>
          <div className="col-span-2 text-center">Ação</div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Carregando petições...</p>
          </div>
        ) : displayedPetitions.length > 0 ? (
          <div>
            {displayedPetitions.map((petition, index) => (
              <div
                key={petition.id}
                className={`md:grid md:grid-cols-12 gap-4 p-4 items-center ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 transition-colors border-b`}
              >
                {/* Layout para dispositivos móveis */}
                <div className="flex flex-col md:hidden mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`flex-shrink-0 w-10 h-10 flex items-center justify-center ${statusBgColor[petition.status]} ${statusColor[petition.status]} rounded`}
                    >
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="font-medium">{petition.name}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-sm text-gray-500">Protocolo:</div>
                    <div className="text-sm font-mono">{petition.protocol}</div>

                    <div className="text-sm text-gray-500">Status:</div>
                    <div className={`text-sm ${statusColor[petition.status]}`}>
                      {status[petition.status] || "- - -"}
                    </div>

                    <div className="text-sm text-gray-500">Data:</div>
                    <div className="text-sm flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(petition.createdAt)}
                    </div>
                  </div>

                  <div className="mt-2">
                    {petition.status === "WAITING" ? (
                      <Button
                        variant="default"
                        className="w-full bg-[#374192] hover:bg-[#2d3575]"
                        onClick={() => router.push(`/peticoes/completar/${petition.id}`)}
                      >
                        Editar
                      </Button>
                    ) : petition.status === "CREATED" ? (
                      <Button
                        variant="default"
                        className="bg-[#374192] hover:bg-[#2d3575]"
                        onClick={() => router.push(`/peticoes/visualizar/${petition.id}`)}
                      >
                        Visualizar
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        className="w-full bg-[#374192] hover:bg-[#2d3575]"
                        onClick={() => router.push(`/peticoes/completar/${petition.id}`)}
                      >
                        Completar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Layout para desktop */}
                <div className="hidden md:flex md:col-span-3 gap-3">
                  <div
                    className={`flex-shrink-0 w-10 h-10 flex items-center justify-center ${statusBgColor[petition.status]} ${statusColor[petition.status]} rounded`}
                  >
                    <FileText size={20} />
                  </div>
                  <div className="flex items-center">
                    <div className="font-medium">{petition.name}</div>
                  </div>
                </div>
                <div className="hidden md:block md:col-span-3 font-mono text-sm text-center">{petition.protocol}</div>
                <div className={`hidden md:block md:col-span-2 ${statusColor[petition.status]} text-center`}>
                  {status[petition.status] || "- - -"}
                </div>
                <div className="hidden md:block md:col-span-2 text-center">{formatDate(petition.createdAt)}</div>
                <div className="hidden md:block md:col-span-2 text-center">
                  {petition.status === "WAITING" ? (
                    <Button
                      variant="default"
                      className="bg-[#374192] hover:bg-[#2d3575] min-w-[100px]"
                      onClick={() => router.push(`/peticoes/completar/${petition.id}`)}
                    >
                      Editar
                    </Button>
                  ) : petition.status === "CREATED" ? (
                    <Button
                      variant="default"
                      className="bg-[#374192] hover:bg-[#2d3575] min-w-[100px]"
                      onClick={() => router.push(`/peticoes/visualizar/${petition.id}`)}
                    >
                      Visualizar
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      className="bg-[#374192] hover:bg-[#2d3575] min-w-[100px]"
                      onClick={() => router.push(`/peticoes/completar/${petition.id}`)}
                    >
                      Completar
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {/* Elemento trigger para scroll infinito */}
            {hasMoreItems && (
              <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <p className="mt-4 text-gray-500">Nenhuma petição encontrada</p>
            <p className="text-sm text-gray-400">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </div>
    </div>
  )
}
