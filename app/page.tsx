"use client"

// Import the necessary types and utilities
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getUserFromToken } from "@/lib/auth-utils"
import { ParticipantProfile } from "@/types/auth"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if the user is authenticated
    if (isAuthenticated()) {
      // Get user profile
      const userInfo = getUserFromToken()

      // If user is a PARTICIPANT, redirect to login with error
      if (userInfo && userInfo.profile === ParticipantProfile.PARTICIPANT) {
        router.replace("/login?error=unauthorized")
        return
      }

      // Otherwise redirect to dashboard
      router.replace("/dashboard")
    } else {
      // If not authenticated, redirect to login
      router.replace("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">
        <p className="text-gray-500">Redirecionando...</p>
      </div>
    </div>
  )
}
