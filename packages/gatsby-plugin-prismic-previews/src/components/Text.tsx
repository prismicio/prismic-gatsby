import * as React from 'react'
import { PolymorphicPropsWithoutRef } from 'react-polymorphic-types'
import clsx from 'clsx'

const defaultElement = 'div'

const variants = {
  'sans-12': {
    fontFamilyClassName: 'font-sans',
    fontSizeClassName: 'text-12',
    leadingClassName: 'leading-1_5',
    trackingClassName: undefined,
  },
  'sans-12-14': {
    fontFamilyClassName: 'font-sans',
    fontSizeClassName: 'text-12 sm:text-14',
    leadingClassName: 'leading-1_5',
    trackingClassName: undefined,
  },
  'sans-14': {
    fontFamilyClassName: 'font-sans',
    fontSizeClassName: 'text-14',
    leadingClassName: 'leading-1_1',
    trackingClassName: undefined,
  },
  'sans-16': {
    fontFamilyClassName: 'font-sans',
    fontSizeClassName: 'text-16',
    leadingClassName: 'leading-1_1',
    trackingClassName: undefined,
  },
  'sans-24': {
    fontFamilyClassName: 'font-sans',
    fontSizeClassName: 'text-24',
    leadingClassName: 'leading-1_1',
    trackingClassName: 'tracking-tight',
  },
  'mono-20': {
    fontFamilyClassName: 'font-mono',
    fontSizeClassName: 'text-20',
    leadingClassName: 'leading-1_4',
    trackingClassName: undefined,
  },
} as const

type TextOwnProps = {
  variant: keyof typeof variants
  fontFamilyClassName?: string
  fontSizeClassName?: string
  leadingClassName?: string
  trackingClassName?: string
  children?: React.ReactNode
}

export type TextProps<T extends React.ElementType = typeof defaultElement> =
  PolymorphicPropsWithoutRef<TextOwnProps, T>

export const Text = <T extends React.ElementType = typeof defaultElement>({
  as,
  variant: variantName,
  fontFamilyClassName,
  fontSizeClassName,
  leadingClassName,
  trackingClassName,
  className,
  ...restProps
}: TextProps<T>): JSX.Element => {
  const Element: React.ElementType = as ?? defaultElement
  const variant = variants[variantName]

  return (
    <Element
      {...restProps}
      className={clsx(
        fontFamilyClassName ?? variant.fontFamilyClassName,
        fontSizeClassName ?? variant.fontSizeClassName,
        leadingClassName ?? variant.leadingClassName,
        trackingClassName ?? variant.trackingClassName,
        className,
      )}
    />
  )
}
