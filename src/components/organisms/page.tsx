import React from "react"
import { cn } from "@/lib/utils"

interface PageProps {
  children: React.ReactNode
  className?: string
}

export function Page({ children, className }: PageProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {children}
    </div>
  )
}
