import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"

// Load Inter font with all subsets
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "TPE Digital",
  description: "Sistema de gerenciamento TPE Digital",
  generator: "v0.dev",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
      {
        url: "/logo.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
    shortcut: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className={inter.className + " overflow-hidden"}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#333",
            },
            success: {
              style: {
                background: "#ECFDF5",
                border: "1px solid #10B981",
                color: "#065F46",
              },
            },
            error: {
              style: {
                background: "#FEF2F2",
                border: "1px solid #EF4444",
                color: "#991B1B",
              },
              duration: 5000,
            },
          }}
        />
      </body>
    </html>
  )
}
