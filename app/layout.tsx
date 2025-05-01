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
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className={inter.className + ""}>
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
