import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'outlined' | 'fill'
type ButtonType = 'primary' | 'secondary' | 'danger' | 'success' | 'alert' | 'info'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: Variant
  rounded?: boolean
  buttonType: ButtonType,
  children: ReactNode
}

const buttonTypeMap = {
  primary: {
    outlined: 'border bg-transparent border-primary',
    fill: 'bg-primary-dark text-danger'
  },
  secondary: {
    outlined: 'border bg-transparent border-secondary',
    fill: 'bg-secondary text-primary-dark',
  },
  danger: {
    outlined: 'border bg-transparent border-danger text-danger',
    fill: 'bg-danger text-primary-dark'
  },
  success: {
    outlined: 'border bg-transparent border-success text-success',
    fill: 'bg-success text-primary-dark',
  },
  alert: {
    outlined: 'border bg-transparent border-alert text-alert',
    fill: 'bg-alert text-primary',
  },
  info: {
    outlined: 'border bg-transparent border-info text-info',
    fill: 'bg-info text-primary-dark'
  }
}

export function Button({
  children,
  variant,
  buttonType,
  rounded = false,
  className,
  ...props
}: Props) {
  const buttonStyles = buttonTypeMap[buttonType][variant]

  return (
    <button
      className={`flex items-center relative ${buttonStyles} w-full p-2 ${rounded ? 'rounded-full' : 'rounded-2xl'} ${props.style} font-light text-2xl ${className} justify-center`} 
      {...props}
    >
      {children}
    </button>
  )
}