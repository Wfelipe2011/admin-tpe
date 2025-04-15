import type { ReactNode } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

interface MobileOnlyWrapperProps {
  children: ReactNode
}

export function MobileOnlyWrapper({ children }: MobileOnlyWrapperProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  if (!isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h1 className="text-xl font-bold mb-4">Visualização apenas para dispositivos móveis</h1>
          <p>
            Esta página só pode ser acessada em dispositivos móveis. Por favor, acesse novamente em um smartphone ou
            tablet.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
