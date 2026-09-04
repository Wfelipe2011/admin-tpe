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

// DEV ONLY: injeta um token de homologação no navegador antes do React hidratar,
// pra não precisar logar no ambiente local. Só é renderizado quando
// NODE_ENV=development E existe NEXT_PUBLIC_DEV_TOKEN (definido no .env.local,
// que é gitignored). Em build de produção/homologação isto nem aparece no HTML.
const devAutoLoginToken =
  process.env.NODE_ENV === "development" ? process.env.NEXT_PUBLIC_DEV_TOKEN : undefined

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <head>
        {devAutoLoginToken ? (
          <script
            dangerouslySetInnerHTML={{
              // Sempre sincroniza o token com o .env.local (sobrescreve). Assim, trocar o
              // NEXT_PUBLIC_DEV_TOKEN (ex.: pra testar como capitão) + reiniciar já vale,
              // sem precisar limpar o storage na mão. Se o token mudou, zera também o
              // group-storage (seleção de grupo do menu) pra não ficar preso num grupo.
              __html: `(function(){try{var t=${JSON.stringify(
                devAutoLoginToken,
              )};try{if(localStorage.getItem("auth_token")!==t){localStorage.removeItem("group-storage");}localStorage.setItem("auth_token",t);localStorage.setItem("auth_token_ts",Date.now().toString());}catch(e){}document.cookie="auth_token="+t+"; path=/; max-age=604800; SameSite=Lax";}catch(e){}})();`,
            }}
          />
        ) : null}
      </head>
      <body className={inter.className}>
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
