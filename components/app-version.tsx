import { version } from "@/lib/build-version.json"

export function AppVersion() {
  return (
    <footer className="fixed bottom-0 right-0 z-20 rounded-tl-md border-l border-t border-border bg-tpe-bg-light px-3 py-1 text-xs text-tpe-text-medium pointer-events-none select-none pb-[max(0.25rem,env(safe-area-inset-bottom))] pr-[max(0.75rem,env(safe-area-inset-right))]">
      <span className="sr-only">Versão do sistema: </span>v{version}
    </footer>
  )
}
