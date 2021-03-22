import * as React from 'react'
import { PolymorphicPropsWithoutRef } from 'react-polymorphic-types'
import clsx from 'clsx'

const defaultElement = 'div'

const variants = {
  'sans-12': {
    fontFamilyClassName: 'gppp-font-sans',
    fontSizeClassName: 'gppp-text-12',
    leadingClassName: 'gppp-leading-1_5',
    trackingClassName: undefined,
  },
  'sans-12-14': {
    fontFamilyClassName: 'gppp-font-sans',
    fontSizeClassName: 'gppp-text-12 sm:gppp-text-14',
    leadingClassName: 'gppp-leading-1_5',
    trackingClassName: undefined,
  },
  'sans-14': {
    fontFamilyClassName: 'gppp-font-sans',
    fontSizeClassName: 'gppp-text-14',
    leadingClassName: 'gppp-leading-1_1',
    trackingClassName: undefined,
  },
  'sans-16': {
    fontFamilyClassName: 'gppp-font-sans',
    fontSizeClassName: 'gppp-text-16',
    leadingClassName: 'gppp-leading-1_1',
    trackingClassName: undefined,
  },
  'sans-24': {
    fontFamilyClassName: 'gppp-font-sans',
    fontSizeClassName: 'gppp-text-24',
    leadingClassName: 'gppp-leading-1_1',
    trackingClassName: 'gppp-tracking-tight',
  },
  'mono-20': {
    fontFamilyClassName: 'gppp-font-mono',
    fontSizeClassName: 'gppp-text-20',
    leadingClassName: 'gppp-leading-1_1',
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

export type TextProps<
  T extends React.ElementType = typeof defaultElement
> = PolymorphicPropsWithoutRef<TextOwnProps, T>

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
