"use client"

import { useEffect, useState } from "react"
import { Megaphone, X } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface Announcement {
  enabled: boolean
  message: string
  updatedAt: string | null
}

const STORAGE_KEY = "tpe-announcement-dismissed"

/**
 * Aviso aos capitães (texto definido em Coordenação > Configurações).
 * Some quando a pessoa clica no X e só volta a aparecer se o coordenador editar o aviso.
 */
export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    apiClient
      .get<Announcement>("/settings/announcement", { endpoint: "new" })
      .then((res) => {
        setAnnouncement(res)
        try {
          setDismissed(localStorage.getItem(STORAGE_KEY) === res.updatedAt)
        } catch {
          setDismissed(false)
        }
      })
      .catch(() => setAnnouncement(null))
  }, [])

  if (!announcement?.enabled || !announcement.message || dismissed) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(STORAGE_KEY, announcement.updatedAt ?? "")
    } catch {
      // sem storage (janela privada): some só até recarregar
    }
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#929BD2]/60 bg-[#374192]/5 p-3 sm:p-4">
      <div className="p-2 rounded-lg bg-[#374192]/10 text-[#374192] flex-shrink-0">
        <Megaphone className="h-4 w-4" />
      </div>
      <p className="flex-1 text-sm text-[#333333] whitespace-pre-line">{announcement.message}</p>
      <button onClick={dismiss} aria-label="Fechar aviso" className="text-[#666666] hover:text-[#333333] flex-shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
