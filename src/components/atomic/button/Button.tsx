import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = 'outlined' | 'fill'
type ButtonType = 'primary' | 'secondary' | 'danger' | 'success' | 'alert' | 'info'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: Variant
  rounded: boolean
  buttonType: ButtonType,
  children: ReactNode
}

const variantMap = {
  outlined: 'border bg-transparent',
  fill: ''
}

const buttonTypeMap = {
  primary: 'bg-primary-dark text-danger',
  secondary: 'bg-primary-light text-primary-dark',
  danger: 'bg-danger text-primary-dark',
  success: 'bg-success text-primary-dark',
  alert: 'bg-alert text-primary',
  info: 'bg-info text-primary-dark'
}

export function Button({
  children,
  variant,
  buttonType,
  rounded = false,
  className,
  ...props
}: Props) {
  const buttonStyles = `${variantMap[variant]} ${buttonTypeMap[buttonType]}` 
  return (
    <button
      className={`${buttonStyles} w-full p-2 ${rounded ? 'rounded-full' : 'rounded'} ${props.style} font-light text-2xl ${className} justify-center`} {...props}
    >
      {children}
    </button>
  )
}
