import * as React from 'react'

import { Modal, ModalProps } from './Modal'
import { Button } from './Button'
import { Text } from './Text'

type ModalLoadingProps = Pick<
  ModalProps,
  'repositoryName' | 'isOpen' | 'onDismiss'
>

export const ModalLoading = ({
  repositoryName,
  isOpen,
  onDismiss,
}: ModalLoadingProps): JSX.Element => {
  return (
    <Modal
      repositoryName={repositoryName}
      onDismiss={onDismiss}
      isOpen={isOpen}
      aria-label={`Prismic preview loading for ${repositoryName}`}
    >
      <div className="gppp-grid gppp-gap-6 sm:gppp-gap-7 gppp-justify-items-center">
        <div className="gppp-grid gppp-gap-5">
          <Text
            variant="sans-24"
            className="gppp-text-slate-10 gppp-text-center gppp-font-semibold"
          >
            Fetching preview
          </Text>
          <Text variant="sans-12-14" className="gppp-text-center">
            Please wait while your updates are loading&hellip;
          </Text>
        </div>

        <Button variant="white" onClick={onDismiss} className="mx-auto">
          <Text variant="sans-14" className="gppp-font-medium">
            Cancel Preview
          </Text>
        </Button>
      </div>
    </Modal>
  )
}
