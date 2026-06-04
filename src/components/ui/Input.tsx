import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const hintId = hint ? `${inputId}-hint` : undefined
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-brand-graphite"
          >
            {label}
            {props.required && (
              <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
            )}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-describedby={
            [hintId, errorId].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={!!error}
          className={cn(
            'h-10 w-full rounded border bg-white px-3 py-2 text-sm font-body text-brand-black',
            'placeholder:text-brand-muted',
            'border-brand-border focus:border-brand-black focus:outline-none focus:ring-1 focus:ring-brand-black',
            'transition-colors duration-150',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-400',
            'disabled:cursor-not-allowed disabled:bg-brand-surface2 disabled:opacity-60',
            className
          )}
          {...props}
        />

        {hint && !error && (
          <p id={hintId} className="text-xs text-brand-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export { Input }
