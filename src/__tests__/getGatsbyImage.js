import { getFixedGatsbyImage, getFluidGatsbyImage } from '../getGatsbyImage'

const url =
  'https://images.prismic.io/pvadev/7802e8de-6b1a-4e65-b6bc-69cde942f727_LG_6250R_crop.JPG?auto=compress,format&rect=0,0,3599,1803&w=2000&h=1002'

describe('getFixedGatsbyImage', () => {
  test('jpg without params', () => {
    expect(getFixedGatsbyImage(url, 2000, 1002)).toMatchSnapshot()
  })

  test('jpg with width (600)', () => {
    expect(
      getFixedGatsbyImage(url, 2000, 1002, { width: 600 }),
    ).toMatchSnapshot()
  })
})

describe('getFluidGatsbyImage', () => {
  test('jpg without params', () => {
    expect(getFluidGatsbyImage(url, 2000, 1002)).toMatchSnapshot()
  })

  test('jpg with max width (1000)', () => {
    expect(
      getFluidGatsbyImage(url, 2000, 1002, { maxWidth: 1000 }),
    ).toMatchSnapshot()
  })

  test('jpg with max width (1000) and srcSetBreakpoints', () => {
    expect(
      getFluidGatsbyImage(url, 2000, 1002, {
        maxWidth: 1000,
        srcSetBreakpoints: [400],
      }),
    ).toMatchSnapshot()
  })
})
