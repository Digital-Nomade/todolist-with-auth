import { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement>{
  isLoading: boolean
}

export function LoadingIcon({ isLoading }: Props) {
  if (!isLoading) return null

  return (
    <div className={`bg-gradient-to-r from-primary-dark to-transparent rotat animate-spin h-8 w-8 rounded-full absolute right-2 flex justify-center items-center`}>
      <div className="h-6 w-6 bg-secondary rounded-full" />
    </div>
  )
}