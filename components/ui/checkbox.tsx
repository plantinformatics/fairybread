"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { CheckIcon, MinusIcon } from "lucide-react"

const checkboxVariants = cva(
  "border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 flex items-center justify-center rounded-[4px] border shadow-xs transition-shadow group-has-disabled/field:opacity-50 focus-visible:ring-3 aria-invalid:ring-3 peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "size-3.5 [&_svg]:size-3",
        md: "size-4 [&_svg]:size-3.5",
        lg: "size-5 [&_svg]:size-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

function Checkbox({
  className,
  size = "md",
  ...props
}: CheckboxPrimitive.Root.Props & VariantProps<typeof checkboxVariants>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn("group/checkbox", checkboxVariants({ size }), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="[&>svg]:size-3.5 grid place-content-center text-current transition-none"
      >
        <CheckIcon className="hidden group-data-[checked]/checkbox:block group-data-[indeterminate]/checkbox:hidden" />
        <MinusIcon className="hidden group-data-[indeterminate]/checkbox:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
