import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    // Server-side debug logging to detect any `data-` attributes being added before hydration.
    if (typeof window === 'undefined') {
      try {
        const dataAttrs = Object.keys(props).filter((k) => k.startsWith('data-')).reduce((acc, k) => { acc[k] = (props as any)[k]; return acc }, {} as Record<string, any>)
        console.log('[SSR] Input render props:', { id: (props as any).id, type, dataAttrs })
      } catch (e) {
        // ignore logging failures
      }
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
