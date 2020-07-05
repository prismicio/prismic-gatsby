import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { PageProps } from 'gatsby'

import {
  MOCK_PAGE_PROPS,
  STATIC_DATA,
  PREVIEW_DATA,
  STATIC_UID,
  PREVIEW_UID,
} from './__fixtures__/pageData'

import { PreviewStoreProvider, withPreview } from '../src'

const Template = ({ data }: PageProps<typeof STATIC_DATA>) => (
  <div data-testid="uid">{data.prismicPage.uid}</div>
)
Template.displayName = 'Template'

const WrappedComponent = withPreview(Template)

describe('withPreview', () => {
  test('modifies displayName with `withPreview`', () => {
    expect(WrappedComponent.displayName).toBe(
      `withPreview(${Template.displayName})`,
    )
  })

  test('renders static data if preview data is not available', () => {
    render(
      <PreviewStoreProvider initialEnabled={true}>
        {/*
         // @ts-ignore */}
        <WrappedComponent {...MOCK_PAGE_PROPS} data={STATIC_DATA} />
      </PreviewStoreProvider>,
    )

    expect(screen.getByTestId('uid')).toHaveTextContent(STATIC_UID)
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
