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

export function GroupList() {
  const [groups, setGroups] = useState<IGroups[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const fetchGroups = async () => {
    try {
      const response = await fetch("https://server.tpedigital.com.br/groups")
      const data = await response.json()
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

  const mainGroups = filteredGroups.filter((group) => group.type === "MAIN")
  const additionalGroups = filteredGroups.filter((group) => group.type === "ADDITIONAL")
  const specialGroups = filteredGroups.filter((group) => group.type === "SPECIAL")

  return (
    <div className="mt-4 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar Grupo"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{filteredGroups.length} Grupos</span>
          <Link href="/grupos/novo" passHref>
            <Button className="ml-auto">
              <Plus className="mr-2 h-4 w-4" />
              Criar Novo Grupo
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <p>Carregando grupos...</p>
        </div>
      ) : (
        <>
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between border-b pb-2">
              <h2 className="text-sm font-medium">Principal</h2>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {mainGroups.map((group) => (
                  <GroupCard key={group.id} group={group} onGroupUpdated={fetchGroups} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between border-b pb-2">
              <h2 className="text-sm font-medium">Adicional</h2>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {additionalGroups.map((group) => (
                  <GroupCard key={group.id} group={group} onGroupUpdated={fetchGroups} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {specialGroups.length > 0 && (
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center justify-between border-b pb-2">
                <h2 className="text-sm font-medium">Especial</h2>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {specialGroups.map((group) => (
                    <GroupCard key={group.id} group={group} onGroupUpdated={fetchGroups} />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </>
      )}
    </div>
  )
}
