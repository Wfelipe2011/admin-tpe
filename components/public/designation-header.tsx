import Image from "next/image"

export function DesignationHeader() {
  return (
    <div className="relative">
      <Image
        src="/images/ellipse.png"
        alt="ellipse"
        width={500}
        height={300}
        className="w-full -z-10 -mt-11 md:hidden"
      />

      <div className="flex flex-col justify-center items-center -mt-28 gap-4 text-md font-semibold">
        <div className="text-gray-50">Bem-vindo(a) ao TPE DIGITAL</div>
        <Image src="/images/logo.png" alt="logo" width={200} height={100} className="w-1/2" />
      </div>
    </div>
  )
}
