import type React from "react"
import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbItemUI,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { Home } from "lucide-react"

interface BreadcrumbItemProps {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbNavProps {
  items: BreadcrumbItemProps[]
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {/* Home icon links to the main page */}
        <BreadcrumbItemUI>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItemUI>
        <BreadcrumbSeparator />

        {items.map((item, index) => (
          <BreadcrumbItemUI key={index}>
            {index === items.length - 1 ? (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink asChild>
                  <Link href={item.href || "#"}>{item.label}</Link>
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            )}
          </BreadcrumbItemUI>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
