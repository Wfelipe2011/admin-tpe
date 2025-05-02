"use client"

import type * as React from "react"
import { useState, useEffect, useRef } from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api-client"
import { useFormContext } from "react-hook-form"
import type { Control } from "react-hook-form"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, Check, Loader2 } from "lucide-react"

interface Congregation {
  id: number
  name: string
  city: string
  state: string
}

interface CongregationComboboxProps {
  name: string
  control?: Control<any>
  label?: string
  placeholder?: string
  onChange?: (value: string, congregationId?: number | null) => void
  disabled?: boolean
  congregationId?: number | null
}

export function CongregationCombobox({
  name,
  control,
  label = "Congregação *",
  placeholder = "Selecione uma congregação",
  onChange,
  disabled = false,
  congregationId = null,
}: CongregationComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [congregations, setCongregations] = useState<Congregation[]>([])
  const [filteredCongregations, setFilteredCongregations] = useState<Congregation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCongregation, setSelectedCongregation] = useState<Congregation | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const formContext = useFormContext()

  // Use o control fornecido ou o do contexto do formulário
  const resolvedControl = control || formContext?.control

  // Buscar dados de congregações
  useEffect(() => {
    const fetchCongregations = async () => {
      try {
        setIsLoading(true)
        const data = await apiClient.get<Congregation[]>("/congregations", { endpoint: "new" })
        setCongregations(data)
        setFilteredCongregations(data)

        // Após carregar as congregações, verificamos se há um ID para selecionar
        if (congregationId && data.length > 0) {
          const matchingCongregation = data.find((cong) => cong.id === congregationId)
          if (matchingCongregation) {
            setSelectedCongregation(matchingCongregation)
            if (formContext) {
              // Atualizamos o valor do campo com o nome da congregação encontrada
              formContext.setValue(name, matchingCongregation.name)
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar congregações:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCongregations()
  }, [congregationId, name, formContext])

  // Filtrar congregações com base no termo de busca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCongregations(congregations)
    } else {
      const filtered = congregations.filter((congregation) =>
        congregation.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredCongregations(filtered)
    }
  }, [searchTerm, congregations])

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Focar no input quando o dropdown é aberto
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  return (
    <FormField
      control={resolvedControl}
      name={name}
      render={({ field }) => {
        // Função para lidar com a seleção de uma congregação
        const handleSelect = (congregation: Congregation) => {
          // Set the value as a string, not the object
          field.onChange(congregation.name)
          setSelectedCongregation(congregation)

          // Chamar o onChange fornecido pelo componente pai, se existir
          if (onChange) {
            onChange(congregation.name, congregation.id)
          }

          setIsOpen(false)
          setSearchTerm("")
        }

        // Função para alternar o estado do dropdown
        const toggleDropdown = (e: React.MouseEvent) => {
          e.preventDefault() // Previne qualquer comportamento padrão
          if (!disabled && !isLoading) {
            setIsOpen(!isOpen)
            if (!isOpen) {
              setSearchTerm("")
            }
          }
        }

        // Determinar o texto a ser exibido
        let displayText = placeholder
        if (field.value && typeof field.value === "string") {
          displayText = field.value
        } else if (selectedCongregation) {
          displayText = selectedCongregation.name
        }

        return (
          <FormItem className="space-y-2">
            <FormLabel>{label}</FormLabel>
            <div ref={dropdownRef} className="relative">
              <FormControl>
                <div
                  className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                    disabled && "cursor-not-allowed opacity-50",
                    "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                  )}
                  onClick={toggleDropdown}
                >
                  <span
                    className={cn(
                      "truncate",
                      !displayText || displayText === placeholder ? "text-muted-foreground" : "",
                    )}
                  >
                    {displayText}
                  </span>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </FormControl>

              {isOpen && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                  <div className="sticky top-0 z-10 bg-popover p-1">
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Buscar congregação..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-8"
                    />
                  </div>
                  <div className="mt-1">
                    {filteredCongregations.length === 0 ? (
                      <div className="py-2 px-2 text-sm text-muted-foreground">Nenhuma congregação encontrada</div>
                    ) : (
                      <div role="listbox" className="py-1">
                        {filteredCongregations.map((congregation) => {
                          const isSelected =
                            field.value === congregation.name ||
                            (selectedCongregation && selectedCongregation.id === congregation.id)

                          return (
                            <button
                              key={congregation.id}
                              type="button" // Importante para não submeter o formulário
                              role="option"
                              aria-selected={isSelected}
                              className={cn(
                                "flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                                isSelected
                                  ? "bg-accent text-accent-foreground"
                                  : "hover:bg-accent hover:text-accent-foreground",
                              )}
                              onClick={(e) => {
                                e.preventDefault() // Previne submissão do formulário
                                e.stopPropagation() // Evita propagação do evento
                                handleSelect(congregation)
                              }}
                            >
                              <span className="flex-1 truncate">{congregation.name}</span>
                              {isSelected && <Check className="ml-2 h-4 w-4 shrink-0 opacity-100" />}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
