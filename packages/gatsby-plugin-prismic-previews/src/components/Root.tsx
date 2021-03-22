import * as React from 'react'

type RootProps = {
  children?: React.ReactNode
}

export const Root = ({ children }: RootProps): JSX.Element | null =>
  React.Children.count(children) > 0 ? (
    <div className="gppp-root">{children && <div>{children}</div>}</div>
  ) : null
