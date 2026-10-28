import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// Marker-cap pills: every button is a capped pen. Brand and outline carry the cap
// dot; icon buttons are round caps with no dot.
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-full border-2 border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-200 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[size^=icon]:before:hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary),var(--ink-violet)_14%)]",
        outline:
          "border-input bg-transparent text-foreground before:mr-2 before:size-2.5 before:shrink-0 before:rounded-full before:bg-ink-violet-light hover:border-ink-violet-light hover:bg-accent aria-expanded:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent aria-expanded:bg-accent",
        ghost:
          "hover:bg-accent hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground",
        destructive:
          "bg-destructive/15 text-destructive hover:bg-destructive/25",
        link: "rounded-none border-0 px-0 text-ink-pink-light underline-offset-4 hover:underline",
        brand:
          "border-[color-mix(in_oklch,var(--ink-magenta),white_18%)] bg-brand text-brand-foreground before:mr-2 before:size-2.5 before:shrink-0 before:rounded-full before:bg-white hover:bg-[color-mix(in_oklch,var(--brand),black_14%)]",
      },
      size: {
        default:
          "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 px-2.5 text-xs before:size-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3.5 text-[0.8rem] before:size-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 text-[0.95rem] font-semibold has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
