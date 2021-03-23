import * as React from 'react'

type RootProps = {
  children?: React.ReactNode
}

export const Root = ({ children }: RootProps): JSX.Element => (
  <div className="gppp-root">{children}</div>
)
