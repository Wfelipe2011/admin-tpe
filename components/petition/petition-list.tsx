"use client"

import type React from "react"

import { useEffect, useState, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Calendar, Trash2, RotateCcw } from "lucide-react"
import type { IPetitions, Status } from "@/types/petitions"
import { InfoIcon, CheckIcon, BanIcon, XIcon, ClockIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Upload } from "lucide-react"
import { petitionApi, apiClient } from "@/lib/api-client"
import toast from "react-hot-toast"

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

  const handleExcludePetition = async (petitionId: string) => {
    try {
      await petitionApi.exclude(petitionId)
      toast.success("Petição excluída com sucesso")
      fetchPetitions() // Refresh the list
    } catch (error) {
      console.error("Error excluding petition:", error)
      toast.error("Erro ao excluir petição")
    }
  }

  const handleActivatePetition = async (petitionId: string) => {
    try {
      await petitionApi.activate(petitionId)
      toast.success("Petição ativada com sucesso")
      fetchPetitions() // Refresh the list
    } catch (error) {
      console.error("Error activating petition:", error)
      toast.error("Erro ao ativar petição")
    }
  }

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
    WAITING_INFORMATION: <InfoIcon className="h-4 w-4 mr-2 text-[#F1C40F]" />,
    WAITING: <CheckIcon className="h-4 w-4 mr-2 text-[#2ECC71]" />,
    ACTIVE: <CheckIcon className="h-4 w-4 mr-2 text-[#2ECC71]" />,
    SUSPENDED: <BanIcon className="h-4 w-4 mr-2 text-[#F1C40F]" />,
    EXCLUDED: <XIcon className="h-4 w-4 mr-2 text-[#E74C3C]" />,
    CREATED: <ClockIcon className="h-4 w-4 mr-2 text-[#374192]" />,
    ALL: null,
  }

  const statusColor: Record<Status, string> = {
    WAITING_INFORMATION: "text-[#F1C40F]",
    WAITING: "text-[#2ECC71]",
    ACTIVE: "text-[#2ECC71]",
    SUSPENDED: "text-[#F1C40F]",
    EXCLUDED: "text-[#E74C3C]",
    CREATED: "text-[#374192]",
    ALL: "",
  }

  const statusBgColor: Record<Status, string> = {
    WAITING_INFORMATION: "bg-[#F1C40F]/10 border border-[#F1C40F]/20",
    WAITING: "bg-[#2ECC71]/10 border border-[#2ECC71]/20",
    ACTIVE: "bg-[#2ECC71]/10 border border-[#2ECC71]/20",
    SUSPENDED: "bg-[#F1C40F]/10 border border-[#F1C40F]/20",
    EXCLUDED: "bg-[#E74C3C]/10 border border-[#E74C3C]/20",
    CREATED: "bg-[#374192]/10 border border-[#374192]/20",
    ALL: "bg-gray-100",
  }

  const fetchPetitions = async () => {
    setIsLoading(true)
    try {
      let url = "/petitions"
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

      const data = await apiClient.get<IPetitions[]>(url, { endpoint: "new" }).catch((error) => {
        if (error.response.status === 404) {
          return null
        } else {
          throw error
        }
      })
      console.log("Fetched petitions:", data)
      if (!data) {
        setAllPetitions([])
        setDisplayedPetitions([])
        setHasMoreItems(false)
        return
      }
      // Ordenar por data de atualização (mais novo primeiro) - DESC
      const sortedData = data.sort((a: IPetitions, b: IPetitions) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })

      // Armazenar todos os dados ordenados
      setAllPetitions(sortedData)
      // Reset para mostrar apenas os primeiros 10
      setItemsToShow(10)
      setDisplayedPetitions(sortedData.slice(0, 10))
      setHasMoreItems(sortedData.length > 10)

    } catch (error) {
      console.error("Error fetching petitions:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
    fetchPetitions()
  }, [statusFilter])

  const formatDate = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const formatWeekday = (weekday: string) => {
    const weekdayMap: Record<string, string> = {
      SUNDAY: "Dom",
      MONDAY: "Seg",
      TUESDAY: "Ter",
      WEDNESDAY: "Qua",
      THURSDAY: "Qui",
      FRIDAY: "Sex",
      SATURDAY: "Sáb",
    }
    return weekdayMap[weekday] || weekday
  }

  const formatTime = (time: string) => {
    // Remove segundos se existir (HH:MM:SS -> HH:MM)
    return time.substring(0, 5)
  }

  return (
    <div className="space-y-6">
      {/* Seção de Filtros */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-[#333333] mb-3 sm:mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#374192] rounded-full"></div>
          Filtros e Busca
        </h3>
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1 min-w-0">
                <Input
                  placeholder="Pesquisar por nome, telefone ou congregação"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      fetchPetitions()
                    }
                  }}
                  disabled={isLoading}
                  className="pl-8 sm:pl-10 pr-4 py-2 sm:py-3 bg-white border-gray-200 focus:border-[#374192] focus:ring-[#374192]/20 w-full h-9 sm:h-10"
                />
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-[#666666]" />
              </div>
              <Button
                onClick={fetchPetitions}
                disabled={isLoading}
                className="w-full sm:w-auto bg-[#374192] hover:bg-[#46607F] text-white h-9 sm:h-10 text-xs sm:text-sm"
              >
                Pesquisar
              </Button>
            </div>
          </div>
          <div className="w-full md:w-72">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Status)} disabled={isLoading}>
              <SelectTrigger className="bg-white border-gray-200 focus:border-[#374192] focus:ring-[#374192]/20 w-full h-10">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="ALL" className="hover:bg-[#374192]/10">Todos os Status</SelectItem>
                <SelectItem value="WAITING_INFORMATION" className="hover:bg-[#374192]/10">
                  <span className="flex items-center">
                    {statusIcon.WAITING_INFORMATION}
                    {status.WAITING_INFORMATION}
                  </span>
                </SelectItem>
                <SelectItem value="WAITING" className="hover:bg-[#374192]/10">
                  <span className="flex items-center">
                    {statusIcon.WAITING}
                    {status.WAITING}
                  </span>
                </SelectItem>
                <SelectItem value="ACTIVE" className="hover:bg-[#374192]/10">
                  <span className="flex items-center">
                    {statusIcon.ACTIVE}
                    {status.ACTIVE}
                  </span>
                </SelectItem>
                <SelectItem value="SUSPENDED" className="hover:bg-[#374192]/10">
                  <span className="flex items-center">
                    {statusIcon.SUSPENDED}
                    {status.SUSPENDED}
                  </span>
                </SelectItem>
                <SelectItem value="EXCLUDED" className="hover:bg-[#374192]/10">
                  <span className="flex items-center">
                    {statusIcon.EXCLUDED}
                    {status.EXCLUDED}
                  </span>
                </SelectItem>
                <SelectItem value="CREATED" className="hover:bg-[#374192]/10">
                  <span className="flex items-center">
                    {statusIcon.CREATED}
                    {status.CREATED}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-start md:justify-end w-full md:w-auto">
            {!isAdminAnalyst && (
              <Link href="/peticoes/upload-peticao" className="w-full md:w-auto">
                <Button size="default" className="flex items-center gap-2 w-full md:w-auto bg-[#374192] hover:bg-[#46607F] text-white h-9 sm:h-10 text-xs sm:text-sm">
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Upload Petição</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabela de Petições */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 sm:p-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-[#333333] flex items-center gap-2">
            <div className="w-2 h-2 bg-[#929BD2] rounded-full"></div>
            Lista de Petições
          </h3>
        </div>

        {/* Cabeçalho da tabela - visível apenas em telas médias e maiores */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-3 sm:p-4 font-semibold text-[#333333] bg-[#F8F8F8] border-b border-gray-200 text-sm">
          <div className="col-span-3 text-center">Voluntário</div>
          <div className="col-span-4 text-center">Grupos</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-center">Data</div>
          <div className="col-span-2 text-center">Ações</div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-[#374192] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#666666] font-medium">Carregando petições...</p>
            </div>
          </div>
        ) : displayedPetitions.length > 0 ? (
          <div>
            {displayedPetitions.map((petition, index) => (
              <div
                key={petition.id}
                className={`md:grid md:grid-cols-12 gap-4 p-4 items-center ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  } hover:bg-[#374192]/5 transition-colors border-b border-gray-100 last:border-b-0`}
              >
                {/* Layout para dispositivos móveis */}
                <div className="flex flex-col md:hidden space-y-4">
                  <div className="flex items-center gap-3">
                    {petition.participants[0]?.profilePhoto ? (
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={petition.participants[0].profilePhoto}
                          alt={petition.participants[0]?.name || petition.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`flex-shrink-0 w-12 h-12 flex items-center justify-center ${statusBgColor[petition.status]} rounded-lg`}
                      >
                        <FileText className={`w-5 h-5 ${statusColor[petition.status]}`} />
                      </div>
                    )}
                    <div className="flex-1">
                      <div
                        className="font-semibold text-[#333333] truncate"
                        title={petition.participants[0]?.name || petition.name}
                      >
                        {petition.participants[0]?.name || petition.name}
                      </div>
                      {petition.participants[0]?.phone && (
                        <div className="text-sm text-[#666666] mt-1">{formatPhone(petition.participants[0].phone)}</div>
                      )}
                      {/* adicionar nome congregação */}
                      <div className="text-sm text-[#666666] mt-1">
                        <span>Cong: </span>{petition.participants[0]?.congregation?.name || "- - -"}
                      </div>
                    </div>
                  </div>

                  {petition.participants[0]?.participantsGroup && petition.participants[0].participantsGroup.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-[#666666] mb-2">Grupos:</div>
                      <div className="flex flex-col gap-1.5">
                        {petition.participants[0].participantsGroup.map((pg) => (
                          <Badge
                            key={pg.id}
                            variant="secondary"
                            className="text-xs bg-[#374192]/10 text-[#374192] hover:bg-[#374192]/20 truncate w-fit"
                            title={`${pg.group.name} - ${formatWeekday(pg.group.configWeekday)} ${formatTime(pg.group.configStartHour)}-${formatTime(pg.group.configEndHour)}`}
                          >
                            <span className="truncate">
                              {pg.group.name} • {formatWeekday(pg.group.configWeekday)} {formatTime(pg.group.configStartHour)}-{formatTime(pg.group.configEndHour)}
                            </span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-medium text-[#666666] mb-1">Status:</div>
                      <div className={`text-sm font-medium ${statusColor[petition.status]}`}>
                        {status[petition.status] || "- - -"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#666666] mb-1">Data:</div>
                      <div className="text-sm text-[#333333] flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#666666]" />
                        {formatDate(petition.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {petition.status === "WAITING" ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 min-w-[100px] h-9 bg-[#374192] hover:bg-[#46607F] text-white font-medium"
                          onClick={() => window.open(`/peticoes/completar/${petition.id}`, '_blank')}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-w-[44px] h-9 border-[#E74C3C] text-[#E74C3C] hover:bg-[#E74C3C]/10"
                          onClick={() => handleExcludePetition(petition.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : petition.status === "CREATED" ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 min-w-[100px] h-9 bg-[#374192] hover:bg-[#46607F] text-white font-medium"
                          onClick={() => router.push(`/peticoes/visualizar/${petition.id}`)}
                        >
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-w-[44px] h-9 border-[#E74C3C] text-[#E74C3C] hover:bg-[#E74C3C]/10"
                          onClick={() => handleExcludePetition(petition.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : petition.status === "EXCLUDED" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full min-w-[100px] h-9 border-[#2ECC71] text-[#2ECC71] hover:bg-[#2ECC71]/10 font-medium"
                        onClick={() => handleActivatePetition(petition.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Ativar
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 min-w-[100px] h-9 bg-[#374192] hover:bg-[#46607F] text-white font-medium"
                          onClick={() => window.open(`/peticoes/completar/${petition.id}`, '_blank')}
                        >
                          Completar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-w-[44px] h-9 border-[#E74C3C] text-[#E74C3C] hover:bg-[#E74C3C]/10"
                          onClick={() => handleExcludePetition(petition.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Layout para desktop */}
                <div className="hidden md:flex md:col-span-3 gap-3 items-center">
                  {petition.participants[0]?.profilePhoto ? (
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={petition.participants[0].profilePhoto}
                        alt={petition.participants[0]?.name || petition.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`flex-shrink-0 w-10 h-10 flex items-center justify-center ${statusBgColor[petition.status]} rounded-lg`}
                    >
                      <FileText className={`w-5 h-5 ${statusColor[petition.status]}`} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-semibold text-[#333333] truncate"
                      title={petition.participants[0]?.name || petition.name}
                    >
                      {petition.participants[0]?.name || petition.name}
                    </div>
                    {petition.participants[0]?.phone && (
                      <div className="text-xs text-[#666666] truncate">{formatPhone(petition.participants[0].phone)}</div>
                    )}
                    <div className="text-sm text-[#666666] mt-1">
                      <span>Cong: </span>{petition.participants[0]?.congregation?.name || "- - -"}
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex md:col-span-4 justify-start items-center px-2">
                  {petition.participants[0]?.participantsGroup && petition.participants[0].participantsGroup.length > 0 ? (
                    <div className="flex flex-col gap-1 w-full">
                      {petition.participants[0].participantsGroup.map((pg) => (
                        <Badge
                          key={pg.id}
                          variant="secondary"
                          className="text-xs bg-[#374192]/10 text-[#374192] hover:bg-[#374192]/20 truncate w-fit max-w-full"
                          title={`${pg.group.name} - ${formatWeekday(pg.group.configWeekday)} ${formatTime(pg.group.configStartHour)}-${formatTime(pg.group.configEndHour)}`}
                        >
                          <span className="truncate">
                            {pg.group.name} • {formatWeekday(pg.group.configWeekday)} {formatTime(pg.group.configStartHour)}-{formatTime(pg.group.configEndHour)}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-[#999999]">-</span>
                  )}
                </div>
                <div className={`hidden md:flex md:col-span-1 justify-center items-center gap-1 ${statusColor[petition.status]} font-medium`}>
                  <span className="text-center text-xs">{status[petition.status] || "- - -"}</span>
                </div>
                <div className="hidden md:block md:col-span-2 text-center text-[#666666] text-sm">{formatDate(petition.createdAt)}</div>
                <div className="hidden md:block md:col-span-2 text-center">
                  <div className="flex gap-2 justify-center">
                    {petition.status === "WAITING" ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="min-w-[100px] h-8 bg-[#374192] hover:bg-[#46607F] text-white font-medium"
                          onClick={() => window.open(`/peticoes/completar/${petition.id}`, '_blank')}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-w-[44px] h-8 border-[#E74C3C] text-[#E74C3C] hover:bg-[#E74C3C]/10"
                          onClick={() => handleExcludePetition(petition.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : petition.status === "CREATED" ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="min-w-[100px] h-8 bg-[#374192] hover:bg-[#46607F] text-white font-medium"
                          onClick={() => router.push(`/peticoes/visualizar/${petition.id}`)}
                        >
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-w-[44px] h-8 border-[#E74C3C] text-[#E74C3C] hover:bg-[#E74C3C]/10"
                          onClick={() => handleExcludePetition(petition.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : petition.status === "EXCLUDED" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-w-[100px] h-8 border-[#2ECC71] text-[#2ECC71] hover:bg-[#2ECC71]/10 font-medium"
                        onClick={() => handleActivatePetition(petition.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Ativar
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="min-w-[100px] h-8 bg-[#374192] hover:bg-[#46607F] text-white font-medium"
                          onClick={() => window.open(`/peticoes/completar/${petition.id}`, '_blank')}
                        >
                          Completar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-w-[44px] h-8 border-[#E74C3C] text-[#E74C3C] hover:bg-[#E74C3C]/10"
                          onClick={() => handleExcludePetition(petition.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Elemento trigger para scroll infinito */}
            {hasMoreItems && (
              <div ref={loadMoreRef} className="h-12 flex items-center justify-center bg-gray-50 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#374192] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[#666666] font-medium">Carregando mais petições...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#929BD2]/10">
                <Search className="h-8 w-8 text-[#929BD2]" />
              </div>
              <div>
                <p className="text-[#333333] font-semibold">Nenhuma petição encontrada</p>
                <p className="text-sm text-[#666666] mt-1">Tente ajustar os filtros de busca ou verificar se há petições cadastradas</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
