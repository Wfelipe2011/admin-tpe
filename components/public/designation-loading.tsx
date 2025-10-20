export function DesignationLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-[#374192]/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-[#374192] rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <p className="text-[#333333] font-medium">Carregando designações...</p>
            <p className="text-[#666666] text-sm mt-1">Por favor, aguarde</p>
          </div>
        </div>
      </div>
    </div>
  )
}
