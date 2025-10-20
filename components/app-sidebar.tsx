"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, List, Users, FileText, LayoutDashboard, MapPinned } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useEffect, useState } from "react"
import type { ParticipantProfile } from "@/types/auth"
import { getAuthorizedMenuItems } from "@/lib/role-utils"

interface AppSidebarProps {
  collapsed?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  userProfile: ParticipantProfile
}

export function AppSidebar({ collapsed = false, isOpen, onOpenChange, userProfile }: AppSidebarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [internalIsOpen, setInternalIsOpen] = useState(false)

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
      default:
        icon = <LayoutDashboard className="h-5 w-5" />
    }
    return { ...item, icon }
  })

  const SidebarContent = () => (
    <div className={`h-full ${collapsed && !isMobile ? "w-16" : "w-64"} bg-gradient-to-b from-[#181C43] to-[#374192] text-white shadow-lg`}>
      {/* Header */}
      <div className="h-16 flex items-center border-b border-white/10">
        {collapsed && !isMobile ? (
          <div className="px-4 py-2 flex justify-center w-full">
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
          <div className="flex items-center mx-4 gap-3">
            <Image
              src="/images/design-mode/logo_branco.png"
              alt="TPE Digital"
              width={200}
              height={200}
              className="w-auto h-12"
              priority
            />
            <span className="text-sm sm:text-base font-semibold tracking-wide">TPE DIGITAL</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItemsWithIcons.map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 ${pathname === item.path
                    ? "bg-white/20 text-white font-semibold shadow-sm border border-white/30"
                    : "hover:bg-white/10 text-white/90 hover:text-white font-medium"
                  } ${collapsed && !isMobile ? "justify-center" : ""}`}
                title={collapsed && !isMobile ? item.name : undefined}
                onClick={() => isMobile && setOpen(false)}
              >
                <div className={`flex-shrink-0 ${pathname === item.path ? "text-white" : "text-white/80"}`}>
                  {item.icon}
                </div>
                {(!collapsed || isMobile) && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  // Render for mobile (Sheet component)
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-[250px] max-w-[80vw] border-r-0 bg-transparent [&>button]:hidden">
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
