"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import { GroupCard } from "@/components/group-card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import type { IGroups } from "@/types/groups"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { sortGroupsByDayAndTime } from "@/lib/utils"

export function GroupList() {
  const [groups, setGroups] = useState<IGroups[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const fetchGroups = async () => {
    try {
      const data = await apiClient.get<IGroups[]>("/groups", { endpoint: "new" })
      setGroups(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching groups:", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const mainGroups = sortGroupsByDayAndTime(filteredGroups.filter((group) => group.type === "MAIN"))
  const additionalGroups = sortGroupsByDayAndTime(filteredGroups.filter((group) => group.type === "ADDITIONAL"))
  const specialGroups = sortGroupsByDayAndTime(filteredGroups.filter((group) => group.type === "SPECIAL"))

  return (
    <div className="p-8 space-y-8">
      {/* Search and Actions Header */}
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar grupos..."
            className="pl-10 h-10 border-gray-200 focus:border-[#374192] focus:ring-[#374192] rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#F8F8F8] px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-[#666666]">
              {filteredGroups.length} {filteredGroups.length === 1 ? 'Grupo' : 'Grupos'}
            </span>
          </div>
          <Link href="/grupos/novo" passHref>
            <Button className="bg-[#374192] hover:bg-[#46607F] text-white h-10 px-6 rounded-lg font-medium transition-colors">
              <Plus className="mr-2 h-4 w-4" />
              Criar Novo Grupo
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-[#374192] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[#666666] font-medium">Carregando grupos...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between bg-[#F8F8F8] rounded-lg p-4 hover:bg-gray-100 transition-colors group">
              <h2 className="text-lg font-semibold text-[#333333] flex items-center gap-3">
                <div className="w-3 h-3 bg-[#374192] rounded-full"></div>
                Grupos Principais
                <span className="text-sm font-normal text-[#666666] bg-white px-2 py-1 rounded-full">
                  {mainGroups.length}
                </span>
              </h2>
              <ChevronDown className="h-5 w-5 text-[#666666] group-data-[state=open]:rotate-180 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mainGroups.map((group) => (
                  <GroupCard key={group.id} group={group} onGroupUpdated={fetchGroups} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between bg-[#F8F8F8] rounded-lg p-4 hover:bg-gray-100 transition-colors group">
              <h2 className="text-lg font-semibold text-[#333333] flex items-center gap-3">
                <div className="w-3 h-3 bg-[#929BD2] rounded-full"></div>
                Grupos Adicionais
                <span className="text-sm font-normal text-[#666666] bg-white px-2 py-1 rounded-full">
                  {additionalGroups.length}
                </span>
              </h2>
              <ChevronDown className="h-5 w-5 text-[#666666] group-data-[state=open]:rotate-180 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {additionalGroups.map((group) => (
                  <GroupCard key={group.id} group={group} onGroupUpdated={fetchGroups} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {specialGroups.length > 0 && (
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center justify-between bg-[#F8F8F8] rounded-lg p-4 hover:bg-gray-100 transition-colors group">
                <h2 className="text-lg font-semibold text-[#333333] flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#F1C40F] rounded-full"></div>
                  Grupos Especiais
                  <span className="text-sm font-normal text-[#666666] bg-white px-2 py-1 rounded-full">
                    {specialGroups.length}
                  </span>
                </h2>
                <ChevronDown className="h-5 w-5 text-[#666666] group-data-[state=open]:rotate-180 transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {specialGroups.map((group) => (
                    <GroupCard key={group.id} group={group} onGroupUpdated={fetchGroups} />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}
    </div>
  )
}
