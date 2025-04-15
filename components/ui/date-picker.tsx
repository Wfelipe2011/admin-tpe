"use client"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { Locale } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  mode?: "single" | "range" | "multiple"
  locale?: Locale
  disabled?: boolean
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = "Selecionar data",
  className,
  mode = "single",
  locale,
  disabled = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-start text-left font-normal", !selected && "text-muted-foreground", className)}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "dd/MM/yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode={mode} selected={selected} onSelect={onSelect} initialFocus locale={locale} />
      </PopoverContent>
    </Popover>
  )
}
