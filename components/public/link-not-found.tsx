import { Link2Off } from "lucide-react"

export function LinkNotFound() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 px-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-[#E74C3C]/10 rounded-full">
            <Link2Off className="h-8 w-8 text-[#E74C3C]" />
          </div>
        </div>

        <h1 className="text-xl font-semibold text-[#333333] mb-3">
          Link não encontrado
        </h1>

        <p className="text-[#666666] leading-relaxed">
          O link que você está tentando acessar não existe ou foi removido.
          <br />
          <br />
          Por favor, verifique com o responsável para mais informações.
        </p>
      </div>
    </div>
  )
}
