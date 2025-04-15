"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated, getUserFromToken, getAuthToken } from "@/lib/auth-utils"
import { TopBar } from "@/components/top-bar"
import { AppSidebar } from "@/components/app-sidebar"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import type { IToken } from "@/types/auth"

// Import the ParticipantProfile and role utils
import { ParticipantProfile } from "@/types/auth"
import { hasRouteAccess } from "@/lib/role-utils"

interface ProtectedLayoutProps {
  children: React.ReactNode
  title: string
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function ProtectedLayout({ children, title, breadcrumbs = [] }: ProtectedLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<IToken | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Update the useEffect that checks authentication to also check role-based access
  useEffect(() => {
    let isMounted = true

    // Function to check authentication
    const checkAuth = () => {
      const token = getAuthToken()
      const isAuthed = isAuthenticated()

      console.log("[ProtectedLayout] Token exists:", !!token)
      console.log("[ProtectedLayout] Authentication check result:", isAuthed)

      // Only update state if component is still mounted
      if (isMounted) {
        setAuthenticated(isAuthed)

        if (isAuthed) {
          // Get user information
          const userInfo = getUserFromToken()
          if (userInfo) {
            setUser(userInfo)

            // Check if user has access to the current route
            if (userInfo.profile === ParticipantProfile.PARTICIPANT) {
              console.log("[ProtectedLayout] User is a PARTICIPANT, redirecting to login")
              router.replace("/login?error=unauthorized")
              return false
            }

            if (!hasRouteAccess(userInfo.profile, pathname)) {
              console.log("[ProtectedLayout] User does not have access to this route, redirecting to dashboard")
              router.replace("/dashboard")
              return false
            }
          }
        }
      }

      return isAuthed
    }

    // Initial check
    const initialAuthResult = checkAuth()

    if (initialAuthResult) {
      // If authenticated on first check, we can stop loading
      if (isMounted) {
        setLoading(false)
      }
    } else {
      // If not authenticated on first check, try again after a delay
      // This helps with race conditions where the token might not be available yet
      const timeoutId = setTimeout(() => {
        const secondAuthResult = checkAuth()

        if (isMounted) {
          setLoading(false) // Stop loading regardless of result

          // If still not authenticated after second check, redirect
          if (!secondAuthResult) {
            console.log("[ProtectedLayout] Not authenticated after second check, redirecting to login")
            router.replace("/login?error=missing")
          }
        }
      }, 100) // Slightly longer delay to ensure token is available

      return () => {
        clearTimeout(timeoutId)
        isMounted = false
      }
    }

    return () => {
      isMounted = false
    }
  }, [router, pathname])

  // Add this useEffect after the existing authentication useEffect
  useEffect(() => {
    // Function to handle resize and set sidebar state based on screen width
    const handleResize = () => {
      const mobileView = window.innerWidth < 768
      setIsMobile(mobileView)
      setSidebarOpen(!mobileView)
    }

    // Set initial state based on screen size
    handleResize()

    // Add event listener for window resize
    window.addEventListener("resize", handleResize)

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Create a toggle function that works for both mobile and desktop
  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen)
    } else {
      setSidebarOpen(!sidebarOpen)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // If not authenticated and not loading, don't render anything
  // The redirect will happen in the useEffect
  if (!authenticated) {
    return null
  }

  // If authenticated and not loading, render the layout with the sidebar
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block transition-all duration-300">
        <AppSidebar
          collapsed={!sidebarOpen}
          isOpen={mobileSidebarOpen}
          onOpenChange={setMobileSidebarOpen}
          userProfile={user?.profile || ParticipantProfile.PARTICIPANT}
        />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title={title} user={user} sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 min-h-0 flex-1">
            <div className="flex justify-between items-center mb-4">
              {breadcrumbs.length > 0 ? <BreadcrumbNav items={breadcrumbs} /> : <div></div>}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
