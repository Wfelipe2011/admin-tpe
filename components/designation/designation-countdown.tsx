"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface DesignationCountdownProps {
  endDate: Date | string | null
  className?: string
}

export function DesignationCountdown({ endDate, className = "" }: DesignationCountdownProps) {
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [backgroundColor, setBackgroundColor] = useState("blue")

  useEffect(() => {
    if (!endDate) return

    const endDateTime = typeof endDate === "string" ? new Date(endDate) : endDate

    const startCountdown = () => {
      const timer = setInterval(() => {
        const now = new Date()
        const difference = endDateTime.getTime() - now.getTime()
        const total = difference

        if (difference <= 0) {
          clearInterval(timer)
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
          setBackgroundColor("green")
          return
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setCountdown({ days, hours, minutes, seconds })

        // Set background color based on time remaining
        if (days > 1) {
          setBackgroundColor("blue")
        } else if (total < 0) {
          setBackgroundColor("green")
        } else if (hours < 2) {
          setBackgroundColor("red")
        } else {
          setBackgroundColor("yellow")
        }
      }, 1000)

      return timer
    }

    const timer = startCountdown()

    return () => clearInterval(timer)
  }, [endDate])

  // Format countdown for display
  const formattedCountdown = `${countdown.days.toString().padStart(2, "0")}D ${countdown.hours
    .toString()
    .padStart(2, "0")}:${countdown.minutes.toString().padStart(2, "0")}:${countdown.seconds
      .toString()
      .padStart(2, "0")}`

  if (!endDate) {
    return null
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Countdown timer desktop */}
      <div className="hidden md:flex justify-end mb-4">
        <div
          className={`
          absolute top-4
          flex flex-row items-center border-[1px] border-[solid] border-[#ccc] h-[46px] py-1 px-3 md:py-4 md:px-3 rounded-lg gap-2 justify-center
          ${backgroundColor === "blue" ? "bg-blue-900" : ""}
          ${backgroundColor === "yellow" ? "bg-yellow-900" : ""}
          ${backgroundColor === "red" ? "bg-red-500" : ""}
          ${backgroundColor === "green" ? "bg-green-500" : ""}
          text-white
        `}
        >
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Prazo de Designação</span>
          <span className="text-sm font-bold">{formattedCountdown}</span>
        </div>
      </div>
      {/* Countdown timer mobile */}
      <div className="md:hidden w-full">
        <div
          className={`
          flex flex-row items-center border-[1px] border-[solid] border-[#ccc] h-[46px] py-1 px-3 rounded-lg gap-2 justify-center w-full
          ${backgroundColor === "blue" ? "bg-blue-900" : ""}
          ${backgroundColor === "yellow" ? "bg-yellow-900" : ""}
          ${backgroundColor === "red" ? "bg-red-500" : ""}
          ${backgroundColor === "green" ? "bg-green-500" : ""}
          text-white
        `}
        >
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Prazo de Designação</span>
          <span className="text-sm font-bold">{formattedCountdown}</span>
        </div>
      </div>
    </div>
  )
}
