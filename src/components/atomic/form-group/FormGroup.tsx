import { ReactNode } from "react"

interface Props {
  children: ReactNode
  className?: string
}

export function FormGroup({ children, className } : Props) {
  return (
    <div className={`w-full last-of-type:mb-0 ${className}`}>
      {children}
    </div>
  )
}