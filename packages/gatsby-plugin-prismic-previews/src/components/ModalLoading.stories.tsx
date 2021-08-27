import * as React from 'react'

import { ModalLoading } from './ModalLoading'
import { Root } from './Root'

export default {
  title: 'Components/ModalLoading',
  component: ModalLoading,
}

export const Default = (): JSX.Element => (
  <Root>
    <ModalLoading
      repositoryName="qwerty"
      isOpen={true}
      onDismiss={() => console.log('Dismissed')}
    />
  </Root>
)
