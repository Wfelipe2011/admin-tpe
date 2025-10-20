import type { ReactNode } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Smartphone } from "lucide-react"

interface MobileOnlyWrapperProps {
  children: ReactNode
}

export function MobileOnlyWrapper({ children }: MobileOnlyWrapperProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  if (!isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-[#374192]/10 rounded-full">
              <Smartphone className="h-8 w-8 text-[#374192]" />
            </div>
          </div>

          <h1 className="text-xl font-semibold text-[#333333] mb-4">
            Visualização apenas para dispositivos móveis
          </h1>

          <p className="text-[#666666] leading-relaxed">
            Esta página só pode ser acessada em dispositivos móveis. Por favor, acesse novamente em um smartphone ou
            tablet.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
