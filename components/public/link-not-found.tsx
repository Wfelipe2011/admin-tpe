export function LinkNotFound() {
  return (
    <div className="flex flex-col justify-center items-center relative gap-4 max-w-[500px] h-screen m-auto text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        <line x1="4" y1="4" x2="20" y2="20"></line>
      </svg>
      <div>
        <strong>Link não encontrado</strong>
      </div>
      <div>
        O link que você está tentando acessar não existe ou foi removido.
        <br />
        Por favor, verifique com o responsável para mais informações.
      </div>
    </div>
  )
}
