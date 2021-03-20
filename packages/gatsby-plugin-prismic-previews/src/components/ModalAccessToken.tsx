import * as React from 'react'
import VisuallyHidden from '@reach/visually-hidden'

import { usePrismicPreviewAccessToken } from '../usePrismicPreviewAccessToken'

import { Modal } from './Modal'
import { Button } from './Button'

// import styles from './ModalAccessToken.module.css'
const styles: Record<string, never> = {}

const PRISMIC_DOCS_GENERATING_AN_ACCESS_TOKEN =
  'https://user-guides.prismic.io/en/articles/1036153-generating-an-access-token'

type ModalProps = {
  repositoryName: string
  afterSubmit?: () => void
}

export const ModalAccessToken = ({
  repositoryName,
  afterSubmit,
}: ModalProps): JSX.Element => {
  const inputId = `prismic-preview-access-token-input-${repositoryName}`

  const [ephemeralAccessToken, setEphemeralAccessToken] = React.useState('')
  const [, { set: setAccessToken }] = usePrismicPreviewAccessToken(
    repositoryName,
  )

  const onAccessTokenChange = (
    event: React.FormEvent<HTMLInputElement>,
  ): void => setEphemeralAccessToken(event.currentTarget.value)

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setAccessToken(ephemeralAccessToken)

    if (afterSubmit) {
      afterSubmit()
    }
  }

  return (
    <Modal repositoryName={repositoryName}>
      <div className={styles.content}>
        <div className={styles.intro}>
          <h1 className={styles.heading}>
            Enter your Prismic <br className={styles.headingBreak} />
            access token
          </h1>
          <div className={styles.details}>
            <p className={styles.p}>
              An access token is required to view this preview.
            </p>
            <p className={styles.p}>
              Repository Name:{' '}
              <strong className={styles.repositoryName}>
                gatsby-starter-ww
              </strong>
            </p>
          </div>
        </div>
        <form className={styles.form} onSubmit={onSubmit}>
          <div>
            <VisuallyHidden as="label" htmlFor={inputId}>
              Access token
            </VisuallyHidden>
            <input
              name="access-token"
              id={inputId}
              placeholder="your-access-token"
              value={ephemeralAccessToken}
              onChange={onAccessTokenChange}
              className={styles.input}
            />
          </div>
          <div className={styles.buttonList}>
            <Button variant="white" type="button">
              Cancel
            </Button>
            <Button variant="purple" type="submit">
              Continue
            </Button>
          </div>
        </form>
        <p className={[styles.helpText, styles.p].join(' ')}>
          Not sure what your access token is?{' '}
          <br className={styles.helpTextBreak} />
          <a
            href={PRISMIC_DOCS_GENERATING_AN_ACCESS_TOKEN}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={styles.link}
          >
            Learn about generating one here.
          </a>
        </p>
      </div>
    </Modal>
  )
}
