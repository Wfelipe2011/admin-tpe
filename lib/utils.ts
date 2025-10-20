import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { IGroups } from "@/types/groups"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ordena grupos por dia da semana e depois por horário
 */
export function sortGroupsByDayAndTime(groups: IGroups[]): IGroups[] {
  const weekdayOrder = {
    "SUNDAY": 0,
    "MONDAY": 1,
    "TUESDAY": 2,
    "WEDNESDAY": 3,
    "THURSDAY": 4,
    "FRIDAY": 5,
    "SATURDAY": 6,
  }

  return groups.sort((a, b) => {
    // Primeiro, ordena por dia da semana
    const dayA = weekdayOrder[a.configWeekday as keyof typeof weekdayOrder] ?? 7
    const dayB = weekdayOrder[b.configWeekday as keyof typeof weekdayOrder] ?? 7

    if (dayA !== dayB) {
      return dayA - dayB
    }

    // Se o dia for o mesmo, ordena por horário
    const timeA = a.configStartHour || "00:00"
    const timeB = b.configStartHour || "00:00"

    return timeA.localeCompare(timeB)
  })
}
