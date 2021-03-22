import * as React from 'react'

import { VERSION } from '../constants'

import { Modal, ModalProps } from './Modal'
import { Button } from './Button'
import { Text } from './Text'

type ModalErrorProps = {
  errorMessage?: string
} & Pick<ModalProps, 'repositoryName' | 'isOpen' | 'onDismiss'>

export const ModalError = ({
  repositoryName,
  errorMessage,
  isOpen,
  onDismiss,
}: ModalErrorProps): JSX.Element => {
  return (
    <Modal
      variant="red"
      repositoryName={repositoryName}
      onDismiss={onDismiss}
      isOpen={isOpen}
    >
      <div className="gppp-grid gppp-gap-6 sm:gppp-gap-7 gppp-justify-items-center">
        <div className="gppp-grid gppp-gap-4">
          <Text
            variant="sans-24"
            className="gppp-text-center gppp-font-semibold"
          >
            Error
          </Text>
          <Text variant="sans-12-14" className="gppp-text-center">
            The preview could not be loaded.
          </Text>
        </div>

        {errorMessage && (
          <Text variant="mono-20" className="gppp-text-center gppp-my-2">
            {errorMessage}
          </Text>
        )}

        <Button variant="whiteOutline" onClick={onDismiss} className="mx-auto">
          <Text variant="sans-14" className="gppp-font-medium">
            Cancel Preview
          </Text>
        </Button>

        <dl className="gppp-text-red-80 gppp-flex gppp-flex-wrap gppp--mt-5 gppp--ml-5 gppp-justify-center">
          <div className="gppp-grid gppp-gap-2 gppp-pl-5 gppp-pt-5 gppp-grid-flow-col">
            <dt>
              <Text variant="sans-12" className="gppp-font-semibold">
                Repository
              </Text>
            </dt>
            <dd>
              <Text variant="sans-12">{repositoryName}</Text>
            </dd>
          </div>
          <div className="gppp-grid gppp-gap-2 gppp-pl-5 gppp-pt-5 gppp-grid-flow-col">
            <dt>
              <Text variant="sans-12" className="gppp-font-semibold">
                Plugin Version
              </Text>
            </dt>
            <dd>
              <Text variant="sans-12">{VERSION}</Text>
            </dd>
          </div>
        </dl>
      </div>
    </Modal>
  )
}
