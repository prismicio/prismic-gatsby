import * as React from 'react'

import { ModalLoading } from './ModalLoading'

export default {
  title: 'Components/ModalLoading',
  component: ModalLoading,
}

export const Default = (): JSX.Element => (
  <ModalLoading
    repositoryName="qwerty"
    isOpen={true}
    onDismiss={() => console.log('Dismissed')}
  />
)
