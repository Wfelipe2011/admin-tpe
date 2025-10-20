import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#374192] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[#374192]/20 bg-[#374192]/10 text-[#374192]",
        secondary:
          "border-[#929BD2]/20 bg-[#929BD2]/10 text-[#929BD2]",
        destructive:
          "border-[#E74C3C]/20 bg-[#E74C3C]/10 text-[#E74C3C]",
        success:
          "border-[#2ECC71]/20 bg-[#2ECC71]/10 text-[#2ECC71]",
        warning:
          "border-[#F1C40F]/20 bg-[#F1C40F]/10 text-[#F1C40F]",
        outline: "border-gray-200 bg-white text-[#333333]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
