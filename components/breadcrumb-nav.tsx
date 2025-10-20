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
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItemUI>
          <BreadcrumbLink asChild>
            <Link href="/dashboard" className="flex items-center gap-2 hover:text-[#374192] transition-colors group">
              <div className="p-1 rounded-md group-hover:bg-[#374192]/10 transition-colors">
                <Home className="h-4 w-4 text-[#666666] group-hover:text-[#374192]" />
              </div>
              <span className="sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItemUI>

        {items.length > 0 && <BreadcrumbSeparator className="text-[#929BD2]" />}

        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <React.Fragment key={index}>
              <BreadcrumbItemUI>
                {item.href && !isLast ? (
                  <BreadcrumbLink asChild>
                    <Link
                      href={item.href}
                      className="text-sm font-medium hover:text-[#374192] transition-colors max-w-[200px] truncate text-[#666666]"
                    >
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="text-sm font-semibold text-[#333333] max-w-[200px] truncate">{item.label}</span>
                )}
              </BreadcrumbItemUI>

              {!isLast && <BreadcrumbSeparator className="text-[#929BD2]" />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
