"use client"

import { ChevronDown, Menu } from "lucide-react"
import { useState } from "react"
import type { IToken } from "@/types/auth"
import { logout } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"
import { GroupSelector } from "@/components/group-selector"

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
    <header className="bg-gradient-to-r from-[#181C43] to-[#374192] text-white shadow-sm border-b border-[#374192]/20">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 border-0 transition-colors"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Add the GroupSelector component here */}
          <div className="hidden md:block">
            <GroupSelector />
          </div>

          {user && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 rounded-lg p-2 hover:bg-white/10 focus:outline-none text-white transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30">
                  {user.profile_photo ? (
                    <img
                      src={user.profile_photo || "/placeholder.svg"}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-white">{user.name.charAt(0)}</span>
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium text-white">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-white" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg bg-white py-2 shadow-lg ring-1 ring-black/5 border border-gray-100 focus:outline-none z-50">
                  <div className="px-4 py-3 text-sm border-b border-gray-100">
                    <p className="font-semibold text-[#333333]">{user.name}</p>
                    <p className="text-xs text-[#666666] mt-1">{translateProfile(user.profile)}</p>
                  </div>
                  {/* Add the GroupSelector for mobile view with isMobileView prop */}
                  <div className="md:hidden px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-medium text-[#333333] mb-2">Grupo selecionado:</p>
                    <GroupSelector className="w-full" isMobileView={true} />
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
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
