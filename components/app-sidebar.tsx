"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, List, Users, FileText, LayoutDashboard, MapPinned, ChevronDown, LogOut, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useEffect, useState } from "react"
import type { ParticipantProfile, IToken } from "@/types/auth"
import { getAuthorizedMenuItems } from "@/lib/role-utils"
import { GroupSelector } from "@/components/group-selector"
import { logout } from "@/lib/auth-utils"

interface AppSidebarProps {
  collapsed?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onToggleCollapsed?: () => void
  userProfile: ParticipantProfile
  user: IToken | null
}

// Add a function to translate profile names to Portuguese
function translateProfile(profile: string): string {
  const profileTranslations: Record<string, string> = {
    admin: "Administrador",
    coordinator: "Coordenador",
    secretary: "Secretário",
    volunteer: "Voluntário",
    user: "Usuário",
    ADMIN: "Administrador",
    COORDINATOR: "Coordenador",
    SECRETARY: "Secretário",
    CAPTAIN: "Capitão",
    PARTICIPANT: "Participante",
  }

  return profileTranslations[profile] || profile
}

export function AppSidebar({ collapsed = false, isOpen, onOpenChange, onToggleCollapsed, userProfile, user }: AppSidebarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Determine the current open state, prioritizing props if provided
  const open = isOpen !== undefined ? isOpen : internalIsOpen
  const setOpen = onOpenChange || setInternalIsOpen

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Set initial value
    checkMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Get authorized menu items based on user profile
  const authorizedMenuItems = getAuthorizedMenuItems(userProfile)

  // Map the menu items to include the Lucide icons
  const menuItemsWithIcons = authorizedMenuItems.map((item) => {
    let icon
    switch (item.icon) {
      case "LayoutDashboard":
        icon = <LayoutDashboard className="h-5 w-5" />
        break
      case "Search":
        icon = <Search className="h-5 w-5" />
        break
      case "List":
        icon = <List className="h-5 w-5" />
        break
      case "FileText":
        icon = <FileText className="h-5 w-5" />
        break
      case "Users":
        icon = <Users className="h-5 w-5" />
        break
      case "MapPinned":
        icon = <MapPinned className="h-5 w-5" />
        break
      case "AlertCircle":
        icon = <AlertCircle className="h-5 w-5" />
        break
      default:
        icon = <LayoutDashboard className="h-5 w-5" />
    }
    return { ...item, icon }
  })

  const SidebarContent = () => (
    <div className={`h-full ${collapsed && !isMobile ? "w-16" : "w-64"} bg-gradient-to-b from-[#181C43] to-[#374192] text-white shadow-lg flex flex-col relative`}>
      {/* Desktop Toggle Button */}
      {!isMobile && onToggleCollapsed && (
        <button
          onClick={onToggleCollapsed}
          className="absolute -right-3 top-6 z-10 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all duration-200 text-[#374192] hover:bg-gray-50"
          aria-label={collapsed ? "Expandir sidebar" : "Retrair sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      )}

      {/* Header - Logo + Nome do Sistema */}
      <div className="p-3 sm:p-4 border-b border-white/10">
        {collapsed && !isMobile ? (
          <div className="flex justify-center">
            <Image
              src="/images/design-mode/logo_branco.png"
              alt="TPE Digital"
              width={200}
              height={200}
              className="w-auto h-8"
              priority
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Image
              src="/images/design-mode/logo_branco.png"
              alt="TPE Digital"
              width={200}
              height={200}
              className="w-auto h-8 sm:h-10"
              priority
            />
            <span className="text-base sm:text-lg font-semibold tracking-wide">TPE DIGITAL</span>
          </div>
        )}
      </div>

      {/* Seleção de Grupo */}
      {(!collapsed || isMobile) && (
        <div className="p-3 sm:p-4 border-b border-white/10">
          {/* <div className="mb-2">
            <p className="text-xs font-medium text-white/70 uppercase tracking-wide">
              Grupo Selecionado
            </p>
          </div> */}
          <GroupSelector />
        </div>
      )}

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <ul className="space-y-1 sm:space-y-2">
          {menuItemsWithIcons.map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 rounded-lg text-xs sm:text-sm transition-all duration-200 ${pathname === item.path
                  ? "bg-white/20 text-white font-semibold shadow-sm border border-white/30"
                  : "hover:bg-white/10 text-white/90 hover:text-white font-medium"
                  } ${collapsed && !isMobile ? "justify-center" : ""}`}
                title={collapsed && !isMobile ? item.name : undefined}
                onClick={() => isMobile && setOpen(false)}
              >
                <div className={`flex-shrink-0 ${pathname === item.path ? "text-white" : "text-white/80"}`}>
                  <div className="w-4 h-4 sm:w-5 sm:h-5">
                    {item.icon}
                  </div>
                </div>
                {(!collapsed || isMobile) && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* User Menu - Fixed at bottom */}
      {user && (!collapsed || isMobile) && (
        <div className="p-3 sm:p-4 border-t border-white/10">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 sm:gap-3 w-full p-2 sm:p-3 rounded-lg hover:bg-white/10 focus:outline-none text-white transition-colors"
            >
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30 flex-shrink-0">
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
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs sm:text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-white/70 truncate">{translateProfile(user.profile)}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-white/70 transition-transform flex-shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg ring-1 ring-black/5 border border-gray-100 overflow-hidden z-50">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed user menu - just avatar */}
      {user && collapsed && !isMobile && (
        <div className="p-4 border-t border-white/10">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex justify-center p-2 rounded-lg hover:bg-white/10 focus:outline-none transition-colors"
              title={user.name}
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
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-full ml-2 mb-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black/5 border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-[#333333] text-sm">{user.name}</p>
                  <p className="text-xs text-[#666666]">{translateProfile(user.profile)}</p>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )

  // Render for mobile (Sheet component)
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-[280px] max-w-[85vw] border-r-0 bg-transparent [&>button]:hidden">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    )
  }

  // Render for desktop
  return (
    <div className={`h-screen ${collapsed ? "w-16" : "w-64"} transition-all duration-300`}>
      <SidebarContent />
    </div>
  )
}
