import * as React from 'react'

// import styles from './Button.module.css'
const styles: Record<string, never> = {}

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
    className={[
      styles.button,
      variant === 'purple' && styles.purple,
      variant === 'white' && styles.white,
      variant === 'whiteOutline' && styles.whiteOutline,
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  />
)
