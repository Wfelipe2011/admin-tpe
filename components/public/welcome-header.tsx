import Image from "next/image"

export function WelcomeHeader() {
  return (
    <div className="relative bg-[#1e2b6b] text-white pt-16 pb-24 px-4 rounded-b-[50%] w-full overflow-hidden">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold">Bem-vindo(a) ao TPE DIGITAL</h1>
      </div>

      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
        <div className="bg-[#1e2b6b] p-4 rounded-full w-40 h-40 flex items-center justify-center">
          <Image
            src="/images/logo-tpe.png"
            alt="TPE Digital Logo"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  )
}
