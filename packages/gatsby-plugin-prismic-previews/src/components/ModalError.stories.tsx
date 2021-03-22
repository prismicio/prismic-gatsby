import * as React from 'react'

import { ModalError } from './ModalError'

export default {
  title: 'Components/ModalError',
  component: ModalError,
}

const errorMessage = 'Unexpected authorization 401 error'

export const Default = (): JSX.Element => (
  <ModalError
    repositoryName="qwerty"
    errorMessage={errorMessage}
    isOpen={true}
    onDismiss={() => console.log('Dismissed')}
  />
)

export const WithoutErrorMessage = (): JSX.Element => (
  <ModalError
    repositoryName="qwerty"
    isOpen={true}
    onDismiss={() => console.log('Dismissed')}
  />
)
