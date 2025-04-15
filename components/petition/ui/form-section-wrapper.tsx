import type { ReactNode } from "react"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface FormSectionWrapperProps {
  id: string
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export function FormSectionWrapper({ id, title, children, defaultOpen = false }: FormSectionWrapperProps) {
  return (
    <AccordionItem value={id}>
      <AccordionTrigger className="text-lg font-semibold">{title}</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-4">{children}</div>
      </AccordionContent>
    </AccordionItem>
  )
}
