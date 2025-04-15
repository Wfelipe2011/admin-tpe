"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface PDFViewerProps {
  url: string
  zoomLevel: number
}

export function PDFViewer({ url, zoomLevel }: PDFViewerProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Reset loading state when URL changes
    setLoading(true)
  }, [url])

  return (
    <div className="relative w-full bg-gray-100 rounded-md overflow-hidden" style={{ height: "70vh" }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Carregando documento...</p>
          </div>
        </div>
      )}
      <iframe
        src={`${url}#zoom=${zoomLevel * 100}%`}
        className="w-full h-full border-0"
        onLoad={() => setLoading(false)}
        title="PDF Viewer"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}
