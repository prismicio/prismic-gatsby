import * as React from 'react'

import { Button } from './Button'
import { Root } from './Root'

export default {
  title: 'Components/Button',
  component: Button,
}

const content = 'Lorem ipsum'

export const White = (): JSX.Element => (
  <Root>
    <Button variant="white">{content}</Button>
  </Root>
)

export const Purple = (): JSX.Element => (
  <Root>
    <Button variant="purple">{content}</Button>
  </Root>
)

export const WhiteOutline = (): JSX.Element => (
  <Root>
    <div className="gppp-bg-red-40 gppp-p-6">
      <Button variant="whiteOutline">{content}</Button>
    </div>
  </Root>
)
