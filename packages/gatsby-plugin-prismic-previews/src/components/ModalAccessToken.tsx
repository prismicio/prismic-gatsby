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
  const [ephemeralAccessToken, setEphemeralAccessToken] =
    React.useState(initialAccessToken)

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
      <div className="grid gap-6 sm:gap-7">
        <div className="grid gap-5">
          <Text
            variant="sans-24"
            className="text-slate-10 text-center font-semibold"
          >
            Enter your Prismic <br className="sm:hidden" />
            access token
          </Text>
          <Text variant="sans-12-14" className="text-center">
            An access token is required to view this preview.
            <br />
            Repository Name:{' '}
            <strong className="font-medium text-slate-10">
              {repositoryName}
            </strong>
          </Text>
        </div>

        <form onSubmit={onSubmit} className="grid gap-5">
          <label className="grid gap-3">
            <span className="sr-only">Access token</span>
            <input
              name="access-token"
              placeholder="your-access-token"
              value={ephemeralAccessToken}
              spellCheck={false}
              required={true}
              onChange={onAccessTokenChange}
              className={clsx(
                'border rounded px-5 py-3 block font-mono text-base leading-none w-full',
                !ephemeralAccessToken && 'text-center',
                state === 'IDLE' &&
                  'border-slate-90 bg-slate-95 text-slate-30 placeholder-slate-70',
                state === 'INCORRECT' &&
                  'border-red-40 bg-red-95 text-red-40 placeholder-red-80',
              )}
            />
            {state === 'INCORRECT' && (
              <Text
                variant="sans-12-14"
                className="text-red-40 font-semibold text-center"
              >
                Incorrect token
              </Text>
            )}
          </label>
          <ul className="-ml-4 -mt-4 flex flex-wrap justify-center pointer-events-none">
            <li className="pl-4 pt-4 pointer-events-auto">
              <Button variant="white" type="button" onClick={onDismiss}>
                <Text variant="sans-14" className="font-semibold">
                  Cancel
                </Text>
              </Button>
            </li>
            <li className="pl-4 pt-4 pointer-events-auto">
              <Button variant="purple" type="submit">
                <Text variant="sans-14" className="font-semibold">
                  Continue
                </Text>
              </Button>
            </li>
          </ul>
        </form>

        <Text variant="sans-12" className="text-center">
          Not sure what your access token is? <br className="sm:hidden" />
          <a
            href={PRISMIC_DOCS_GENERATING_AN_ACCESS_TOKEN}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-purple-50 focus:text-purple-40 hover:text-purple-40 transition"
          >
            Learn about generating one here.
          </a>
        </Text>
      </div>
    </Modal>
  )
}
