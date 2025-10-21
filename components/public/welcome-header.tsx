import Image from "next/image"

export function WelcomeHeader() {
  return (
    <div className="relative bg-[#1e2b6b] text-white pt-12 sm:pt-16 pb-16 sm:pb-24 px-3 sm:px-4 rounded-b-[50%] w-full overflow-hidden">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-xl sm:text-3xl font-bold">Bem-vindo(a) ao TPE DIGITAL</h1>
      </div>

      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
        <div className="bg-[#1e2b6b] p-3 sm:p-4 rounded-full w-24 h-24 sm:w-40 sm:h-40 flex items-center justify-center">
          <Image
            src="/images/logo-tpe.png"
            alt="TPE Digital Logo"
            width={120}
            height={120}
            className="object-contain w-16 h-16 sm:w-[120px] sm:h-[120px]"
          />
        </div>
      </div>
    </div>
  )
}
