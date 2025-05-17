"use client"

import type * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

interface Options {
  label: string
  value: string
}

interface ComboboxProps {
  placeholder?: string
  inputPlaceholder?: string
  empytText?: string
  onChange?: (value: string, label?: string) => void
  disabled?: boolean
  value?: string
  options: Options[]
}

export function NewCombobox({
  placeholder,
  inputPlaceholder,
  empytText,
  onChange,
  disabled = false,
  value,
  options,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  // Função para lidar com a seleção de uma congregação
  const handleSelect = (option: Options) => {
    if (onChange) {
      onChange(option.value, option.label)
    }

    setIsOpen(false)
    setSearchTerm("")
  }

  // Função para alternar o estado do dropdown
  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault() // Previne qualquer comportamento padrão
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setSearchTerm("")
      }
    }
  }

  const optionsFiltered = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
  return (
    <div>
      <div ref={dropdownRef} className="relative w-full">
        <div
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-sm border border-l-0 bg-background px-3 py-2 text-sm ring-offset-background",
            disabled && "cursor-not-allowed opacity-50",
            "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          )}
          onClick={toggleDropdown}
        >
          <span className={cn("truncate", !placeholder ? "text-muted-foreground" : "")}>
            {value ? value : placeholder}
          </span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>

        {isOpen && (
          <div className="absolute z-50 right-0 mt-1 max-h-60 w-full min-w-[250px] overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
            <div className="sticky top-0 z-10 bg-popover p-1">
              <Input
                ref={inputRef}
                type="text"
                placeholder={inputPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="h-8"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsOpen(false)
                  } else if (e.key === "Enter" && optionsFiltered?.length === 1) {
                    handleSelect(optionsFiltered[0])
                  }
                }}
              />
            </div>
            <div className="mt-1">
              <div role="listbox" className="py-1">
                {optionsFiltered?.length ? (
                  optionsFiltered.map((option) => (
                    <button
                      key={option.value}
                      title={option.label}
                      type="button" // Importante para não submeter o formulário
                      role="option"
                      className={cn(
                        "flex w-full cursor-default select-none gap-4 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      )}
                      onClick={(e) => {
                        e.preventDefault() // Previne submissão do formulário
                        e.stopPropagation() // Evita propagação do evento
                        handleSelect(option)
                      }}
                    >
                      <span className="truncate">{option.label}</span>
                    </button>
                  ))
                ) : (
                  <div className="py-2 px-2 text-sm text-muted-foreground">{empytText}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
