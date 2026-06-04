import * as React from 'react'
import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-brand-black text-brand-white hover:bg-brand-graphite border border-transparent',
  outline: 'bg-transparent text-brand-black border border-brand-black hover:bg-brand-black hover:text-brand-white',
  ghost:   'bg-transparent text-brand-graphite border border-transparent hover:bg-brand-surface2',
  olive:   'bg-brand-olive text-brand-white border border-transparent hover:opacity-90',
  navy:    'bg-brand-navy text-brand-white border border-transparent hover:opacity-90',
  coffee:  'bg-brand-coffee text-brand-white border border-transparent hover:opacity-90',
  beige:   'bg-brand-beige text-brand-black border border-transparent hover:opacity-90',
} as const

const sizes = {
  sm:   'h-8 px-3 text-sm gap-1.5',
  md:   'h-10 px-5 text-sm gap-2',
  lg:   'h-12 px-7 text-base gap-2',
  icon: 'h-10 w-10 p-0',
} as const

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      asChild = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const buttonClass = cn(
      'inline-flex items-center justify-center rounded font-body font-medium tracking-wide transition-all duration-150',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy',
      'disabled:pointer-events-none disabled:opacity-50',
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      className
    )

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
        className: cn(buttonClass, (children as React.ReactElement<React.HTMLAttributes<HTMLElement>>).props.className),
      })
    }

    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={buttonClass}
        {...props}
      >
        {loading ? (
          <>
            <Spinner />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
