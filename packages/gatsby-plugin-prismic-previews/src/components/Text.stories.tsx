import * as React from 'react'

import { Text } from './Text'

export default {
  title: 'Components/Text',
  component: Text,
}

const content = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'

export const Sans12 = (): JSX.Element => (
  <div className="gppp-border gppp-border-debug">
    <Text variant="sans-12">{content}</Text>
  </div>
)

export const Sans1214 = (): JSX.Element => (
  <div className="gppp-border gppp-border-debug">
    <Text variant="sans-12-14">{content}</Text>
  </div>
)
Sans1214.storyName = 'Sans 12-14'

export const Sans14 = (): JSX.Element => (
  <div className="gppp-border gppp-border-debug">
    <Text variant="sans-14">{content}</Text>
  </div>
)

export const Sans16 = (): JSX.Element => (
  <div className="gppp-border gppp-border-debug">
    <Text variant="sans-16">{content}</Text>
  </div>
)

export const Sans24 = (): JSX.Element => (
  <div className="gppp-border gppp-border-debug">
    <Text variant="sans-24">{content}</Text>
  </div>
)
