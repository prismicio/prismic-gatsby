import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { PageProps } from 'gatsby'

import {
  MOCK_PAGE_PROPS,
  STATIC_DATA,
  PREVIEW_DATA,
  PREVIEW_UID,
} from './__fixtures__/pageData'

import { PreviewStoreProvider, withUnpublishedPreview } from '../src'

const Component = () => <div data-testid="content">Fallback</div>
Component.displayName = 'Template'

const Template = ({ data }: PageProps<typeof STATIC_DATA>) => (
  <div data-testid="uid">{data.prismicPage.uid}</div>
)
Template.displayName = 'Template'

const WrappedComponent = withUnpublishedPreview(Component, {
  templateMap: { page: Template },
})

describe('withUnpublishedPreview', () => {
  test('modifies displayName with `withUnpublishedPreview`', () => {
    expect(WrappedComponent.displayName).toBe(
      `withPreview(withUnpublishedPreview(${Component.displayName}))`,
    )
  })

  test('renders fallback component if preview data is not available', () => {
    render(
      <PreviewStoreProvider initialEnabled={true}>
        {/*
         // @ts-ignore */}
        <WrappedComponent {...MOCK_PAGE_PROPS} data={STATIC_DATA} />
      </PreviewStoreProvider>,
    )

    expect(screen.getByTestId('content')).toHaveTextContent('Fallback')
  })

  test('renders preview data if preview data is available', () => {
    render(
      <PreviewStoreProvider
        initialPages={{ [location.pathname]: PREVIEW_DATA }}
        initialEnabled={true}
      >
        {/*
         // @ts-ignore */}
        <WrappedComponent {...MOCK_PAGE_PROPS} data={STATIC_DATA} />
      </PreviewStoreProvider>,
    )

    expect(screen.getByTestId('uid')).toHaveTextContent(PREVIEW_UID)
  })
})
