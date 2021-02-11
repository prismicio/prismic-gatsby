import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { PageProps } from 'gatsby'
import * as gatsby from 'gatsby'

import { MOCK_PAGE_PROPS, STATIC_DATA } from './__fixtures__/pageData'

import {
  PreviewStoreProvider,
  withPreviewResolver,
  WithPreviewResolverProps,
} from '../src'
import { BROWSER_STORE_KEY } from '../src/constants'

const navigateSpy = jest
  .spyOn(gatsby, 'navigate')
  .mockImplementation(async () => {})

const Component = ({
  isLoading,
  isPreview,
}: PageProps & WithPreviewResolverProps) => (
  <>
    <div data-testid="isLoading">{String(isLoading)}</div>
    <div data-testid="isPreview">{String(isPreview)}</div>
  </>
)
Component.displayName = 'Template'

const WrappedComponent = withPreviewResolver(Component, {
  repositoryName: 'repositoryName',
  linkResolver: () => () => '/doc/',
})

window[BROWSER_STORE_KEY] = {
  repositoryName: {
    pluginOptions: {
      plugins: [],
      repositoryName: 'repositoryName',
      // schemas: {},
    },
    schemasDigest: 'schemasDigest',
  },
}

describe('withPreviewResolver', () => {
  test('modifies displayName with `withPreviewResolver`', () => {
    expect(WrappedComponent.displayName).toBe(
      `withPreviewResolver(${Component.displayName})`,
    )
  })

  test('isPreview is false if not a preview', () => {
    render(
      <PreviewStoreProvider initialEnabled={true}>
        {/*
         // @ts-ignore */}
        <WrappedComponent {...MOCK_PAGE_PROPS} data={STATIC_DATA} />
      </PreviewStoreProvider>,
    )

    expect(screen.getByTestId('isPreview')).toHaveTextContent('false')
    expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
    expect(navigateSpy).not.toHaveBeenCalled()
  })

  // TODO: Test when prevew data is available.
})
