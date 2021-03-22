import * as React from 'react'

import { ModalAccessToken } from './ModalAccessToken'

export default {
  title: 'Components/ModalAccessToken',
  component: ModalAccessToken,
}

const setAccessToken = (accessToken: string) =>
  console.log(`Set access token to: ${accessToken}`)

const onDismiss = () => console.log('Dismissed')

export const Default = (): JSX.Element => (
  <ModalAccessToken
    isOpen={true}
    repositoryName="qwerty"
    setAccessToken={setAccessToken}
    onDismiss={onDismiss}
  />
)

export const Idle = (): JSX.Element => (
  <ModalAccessToken
    state="IDLE"
    isOpen={true}
    repositoryName="qwerty"
    setAccessToken={setAccessToken}
    onDismiss={onDismiss}
  />
)

export const Incorrect = (): JSX.Element => (
  <ModalAccessToken
    state="INCORRECT"
    isOpen={true}
    repositoryName="qwerty"
    initialAccessToken="incorrect-access-token-abc123-incorrect-access-token-abc123"
    setAccessToken={setAccessToken}
    onDismiss={onDismiss}
  />
)
