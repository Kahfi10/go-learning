import { cn } from "@/lib/utils"

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  fluid?: boolean
}

export function PageContainer({ children, className, fluid = false, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 md:px-8",
        fluid ? "max-w-[1920px]" : "max-w-[1920px] 2xl:max-w-screen-2xl", // Use fluid to span out, non-fluid to cap at a readable width but much wider than max-w-7xl
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
