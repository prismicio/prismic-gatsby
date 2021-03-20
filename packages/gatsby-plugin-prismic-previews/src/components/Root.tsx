import * as React from 'react'

// import styles from './Root.module.css'
const styles: Record<string, never> = {}

type RootProps = {
  children?: React.ReactNode
}

export const Root = ({ children }: RootProps): JSX.Element | null =>
  React.Children.count(children) > 0 ? (
    <div className={styles.root}>
      {children && <div className={styles.content}>{children}</div>}
    </div>
  ) : null
