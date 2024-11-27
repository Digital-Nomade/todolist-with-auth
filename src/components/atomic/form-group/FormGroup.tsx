import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export function FormGroup({ children } : Props) {
  return (
    <div className="w-full mb-12 last-of-type:mb-0">
      {children}
    </div>
  )
}