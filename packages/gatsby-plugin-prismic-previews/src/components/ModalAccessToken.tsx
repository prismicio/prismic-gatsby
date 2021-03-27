import * as React from 'react'
import clsx from 'clsx'

import { SetAccessTokenFn } from '../usePrismicPreviewAccessToken'

import { Modal, ModalProps } from './Modal'
import { Button } from './Button'
import { Text } from './Text'

const PRISMIC_DOCS_GENERATING_AN_ACCESS_TOKEN =
  'https://user-guides.prismic.io/en/articles/1036153-generating-an-access-token'

type ModalAccessTokenProps = {
  state?: 'IDLE' | 'INCORRECT'
  initialAccessToken?: string
  setAccessToken: SetAccessTokenFn
  afterSubmit?: () => void
} & Pick<ModalProps, 'repositoryName' | 'isOpen' | 'onDismiss'>

export const ModalAccessToken = ({
  repositoryName,
  state = 'IDLE',
  initialAccessToken = '',
  afterSubmit,
  setAccessToken,
  isOpen,
  onDismiss,
}: ModalAccessTokenProps): JSX.Element => {
  const [ephemeralAccessToken, setEphemeralAccessToken] = React.useState(
    initialAccessToken,
  )

  React.useEffect(() => {
    setEphemeralAccessToken(initialAccessToken)
  }, [initialAccessToken])

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
    <Modal
      repositoryName={repositoryName}
      onDismiss={onDismiss}
      isOpen={isOpen}
      aria-label={`Prismic access token for ${repositoryName}`}
    >
      <div className="gppp-grid gppp-gap-6 sm:gppp-gap-7">
        <div className="gppp-grid gppp-gap-5">
          <Text
            variant="sans-24"
            className="gppp-text-slate-10 gppp-text-center gppp-font-semibold"
          >
            Enter your Prismic <br className="sm:gppp-hidden" />
            access token
          </Text>
          <Text variant="sans-12-14" className="gppp-text-center">
            An access token is required to view this preview.
            <br />
            Repository Name:{' '}
            <strong className="gppp-font-medium gppp-text-slate-10">
              {repositoryName}
            </strong>
          </Text>
        </div>

        <form onSubmit={onSubmit} className="gppp-grid gppp-gap-5">
          <label className="gppp-grid gppp-gap-3">
            <span className="gppp-sr-only">Access token</span>
            <input
              name="access-token"
              placeholder="your-access-token"
              value={ephemeralAccessToken}
              spellCheck={false}
              required={true}
              onChange={onAccessTokenChange}
              className={clsx(
                'gppp-border gppp-rounded gppp-px-5 gppp-py-3 gppp-block gppp-font-mono gppp-text-base gppp-leading-none gppp-w-full',
                !ephemeralAccessToken && 'gppp-text-center',
                state === 'IDLE' &&
                  'gppp-border-slate-90 gppp-bg-slate-95 gppp-text-slate-30 gppp-placeholder-slate-70',
                state === 'INCORRECT' &&
                  'gppp-border-red-40 gppp-bg-red-95 gppp-text-red-40 gppp-placeholder-red-80',
              )}
            />
            {state === 'INCORRECT' && (
              <Text
                variant="sans-12-14"
                className="gppp-text-red-40 gppp-font-semibold gppp-text-center"
              >
                Incorrect token
              </Text>
            )}
          </label>
          <ul className="gppp--ml-4 gppp--mt-4 gppp-flex gppp-flex-wrap gppp-justify-center gppp-pointer-events-none">
            <li className="gppp-pl-4 gppp-pt-4 gppp-pointer-events-auto">
              <Button variant="white" type="button" onClick={onDismiss}>
                <Text variant="sans-14" className="gppp-font-semibold">
                  Cancel
                </Text>
              </Button>
            </li>
            <li className="gppp-pl-4 gppp-pt-4 gppp-pointer-events-auto">
              <Button variant="purple" type="submit">
                <Text variant="sans-14" className="gppp-font-semibold">
                  Continue
                </Text>
              </Button>
            </li>
          </ul>
        </form>

        <Text variant="sans-12" className="gppp-text-center">
          Not sure what your access token is? <br className="sm:gppp-hidden" />
          <a
            href={PRISMIC_DOCS_GENERATING_AN_ACCESS_TOKEN}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="gppp-text-purple-50 focus:gppp-text-purple-40 hover:gppp-text-purple-40 gppp-transition"
          >
            Learn about generating one here.
          </a>
        </Text>
      </div>
    </Modal>
  )
}
