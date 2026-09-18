import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Highcharts from 'highcharts'
import { HighchartsReact } from 'highcharts-react-official'

describe('HighchartsReact import', () => {
  it('resolves to a renderable React component', () => {
    const html = renderToStaticMarkup(
      createElement(HighchartsReact, {
        highcharts: Highcharts,
        options: { series: [] },
      }),
    )

    expect(html).toBe('<div></div>')
  })
})
