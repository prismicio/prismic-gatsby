import * as React from 'react'

import { Button } from './Button'

export default {
  title: 'Components/Button',
  component: Button,
}

const content = 'Lorem ipsum'

export const White = (): JSX.Element => (
  <Button variant="white">{content}</Button>
)

export const Purple = (): JSX.Element => (
  <Button variant="purple">{content}</Button>
)

export const WhiteOutline = (): JSX.Element => (
  <div className="gppp-bg-red-40 gppp-p-6">
    <Button variant="whiteOutline">{content}</Button>
  </div>
)
