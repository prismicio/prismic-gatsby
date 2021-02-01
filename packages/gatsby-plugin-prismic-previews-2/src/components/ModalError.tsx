import * as React from 'react'

import { VERSION } from '../constants'

import { Modal } from './Modal'
import { Button } from './Button'

import styles from './ModalError.module.css'

type ModalProps = {
  repositoryName: string
  errorMessage: string
}

export const ModalError = ({
  repositoryName,
  errorMessage,
}: ModalProps): JSX.Element => {
  return (
    <Modal variant="red" repositoryName={repositoryName}>
      <div className={styles.content}>
        <div className={styles.intro}>
          <h1 className={styles.heading}>Error</h1>
          <p className={styles.p}>The preview could not be loaded.</p>
        </div>
        <p className={styles.errorMessage}>{errorMessage}</p>
        <Button
          variant="whiteOutline"
          type="button"
          className={styles.cancelButton}
        >
          Cancel Preview
        </Button>
        <dl className={styles.details}>
          <div className={styles.detailsItem}>
            <dt className={styles.detailsLabel}>Repository</dt>
            <dd className={styles.detailsValue}>{repositoryName}</dd>
          </div>
          <div className={styles.detailsItem}>
            <dt className={styles.detailsLabel}>Plugin Version</dt>
            <dd className={styles.detailsValue}>{VERSION}</dd>
          </div>
        </dl>
      </div>
    </Modal>
  )
}
