"use client"

import { ChevronDown, Menu } from "lucide-react"
import { useState } from "react"
import type { IToken } from "@/types/auth"
import { logout } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"

interface TopBarProps {
  title: string
  user: IToken | null
  sidebarOpen: boolean
  toggleSidebar: () => void
}

// Add a function to translate profile names to Portuguese
function translateProfile(profile: string): string {
  const profileTranslations: Record<string, string> = {
    admin: "Administrador",
    coordinator: "Coordenador",
    secretary: "Secretário",
    volunteer: "Voluntário",
    user: "Usuário",
    // Add other profile translations as needed
  }

  return profileTranslations[profile.toLowerCase()] || profile
}

export function TopBar({ title, user, sidebarOpen, toggleSidebar }: TopBarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="bg-primary text-primary-foreground shadow z-10">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-4 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 rounded-md p-2 hover:bg-primary-foreground/10 focus:outline-none text-primary-foreground"
              >
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                  {user.profile_photo ? (
                    <img
                      src={user.profile_photo || "/placeholder.svg"}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs">{user.name.charAt(0)}</span>
                  )}
                </div>
                <span className="hidden md:block text-sm text-primary-foreground">{user.name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{translateProfile(user.profile)}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
