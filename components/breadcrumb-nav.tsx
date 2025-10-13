import React from "react"
import { Home } from "lucide-react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem as BreadcrumbItemUI,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbNavProps {
  items?: BreadcrumbItem[]
}

export function BreadcrumbNav({ items = [] }: BreadcrumbNavProps) {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItemUI>
          <BreadcrumbLink asChild>
            <Link href="/dashboard" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItemUI>

        {items.length > 0 && <BreadcrumbSeparator />}

        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <React.Fragment key={index}>
              <BreadcrumbItemUI>
                {item.href && !isLast ? (
                  <BreadcrumbLink asChild>
                    <Link
                      href={item.href}
                      className="text-sm font-medium hover:text-primary transition-colors max-w-[200px] truncate"
                    >
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="text-sm font-medium text-foreground max-w-[200px] truncate">{item.label}</span>
                )}
              </BreadcrumbItemUI>

              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
