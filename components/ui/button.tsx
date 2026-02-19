"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDownIcon, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-md border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/80",
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        mono: "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300",
        outline: "border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground shadow-xs",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        dashed: "border-input border border-dashed bg-background hover:bg-muted hover:text-foreground",
        ghost: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        dim: "text-muted-foreground hover:text-foreground",
        foreground: "text-foreground",
        inverse: "text-inherit",
        destructive: "bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        md: "h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        default: "h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        lg: "h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9",
        "icon-xs": "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-10",
      },
      appearance: {
        default: "",
        ghost: "border-transparent bg-transparent shadow-none",
      },
      mode: {
        default: "",
        icon: "p-0",
        link: "h-auto rounded-none border-transparent bg-transparent p-0",
        input: "justify-start border-border bg-background text-foreground font-normal",
      },
      radius: {
        md: "rounded-md",
        full: "rounded-full",
      },
      autoHeight: {
        true: "h-auto",
        false: "",
      },
      placeholder: {
        true: "text-muted-foreground",
        false: "",
      },
      underline: {
        solid: "",
        dashed: "",
      },
      underlined: {
        solid: "underline underline-offset-4",
        dashed: "underline decoration-dashed underline-offset-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      mode: "default",
      appearance: "default",
      radius: "md",
      autoHeight: false,
      placeholder: false,
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "default",
  appearance = "default",
  mode = "default",
  radius = "md",
  autoHeight = false,
  placeholder = false,
  underline,
  underlined,
  selected = false,
  asChild = false,
  children,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    selected?: boolean
  }) {
  if (asChild && React.isValidElement(children)) {
    return (
      <ButtonPrimitive
        data-slot="button"
        className={cn(
          buttonVariants({
            variant,
            size,
            appearance,
            mode,
            radius,
            autoHeight,
            placeholder,
            underline,
            underlined,
            className,
          })
        )}
        render={children}
        {...(selected ? { "data-state": "open" } : {})}
        {...props}
      />
    )
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          appearance,
          mode,
          radius,
          autoHeight,
          placeholder,
          underline,
          underlined,
          className,
        })
      )}
      {...(selected ? { "data-state": "open" } : {})}
      {...props}>
      {children}
    </ButtonPrimitive>
  )
}

interface ButtonArrowProps extends React.SVGProps<SVGSVGElement> {
  icon?: LucideIcon
}

function ButtonArrow({
  icon: Icon = ChevronDownIcon,
  className,
  ...props
}: ButtonArrowProps) {
  return <Icon data-slot="button-arrow" className={cn("ms-auto -me-1", className)} {...props} />
}

export { Button, ButtonArrow, buttonVariants }
