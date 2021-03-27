import * as gatsby from 'gatsby'
import * as sinon from 'sinon'

export const createPageProps = <TData extends Record<PropertyKey, unknown>>(
  data: TData = {} as TData,
): gatsby.PageProps => ({
  path: '/',
  uri: '/',
  // @ts-expect-error - Partial Location provided
  location: window.location,
  // @ts-expect-error - Partial navigate provided
  navigate: sinon.stub(),
  children: undefined,
  params: {},
  // @ts-expect-error - Partial pageResources provided
  pageResources: {},
  data,
  pageContext: {},
})
