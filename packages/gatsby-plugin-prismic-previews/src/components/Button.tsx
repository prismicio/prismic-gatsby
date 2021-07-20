import * as React from 'react'
import clsx from 'clsx'

type ButtonProps = {
  variant: 'purple' | 'white' | 'whiteOutline'
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = ({
  className,
  variant,
  ...props
}: ButtonProps): JSX.Element => (
  <button
    {...props}
    className={clsx(
      'gppp-py-4 gppp-px-5 gppp-text-center gppp-rounded gppp-min-w-7.5rem gppp-border',
      variant === 'purple' &&
        'gppp-bg-purple-50 gppp-text-white gppp-border-purple-50 gppp-transition hover:gppp-bg-purple-40 focus:gppp-bg-purple-40 hover:gppp-border-purple-40 focus:gppp-borer-purple-40',
      variant === 'white' &&
        'gppp-bg-white gppp-border-slate-90 gppp-text-slate-60 hover:gppp-border-slate-70 focus:gppp-border-slate-70 hover:gppp-text-slate-30 focus:gppp-text-slate-30 gppp-transition',
      variant === 'whiteOutline' &&
        'gppp-bg-transparent gppp-border-white gppp-text-white hover:gppp-bg-white hover:gppp-bg-opacity-10 focus:gppp-bg-white focus:gppp-bg-opacity-10 gppp-transition',
      className,
    )}
  />
)
