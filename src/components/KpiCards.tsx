// KpiCards — the blue wallet banner: the 7 headline numbers from deriveKpis().
// Rendered as faithful custom markup (white-on-blue, 涨红跌绿 pills) for visual parity
// with the original page; AntD owns the chart/table sections and the theme.

import type { Kpis } from '../kpi'
import { signedYuan, yuan } from '../format'

/** positive -> red pill, otherwise green pill (matches original posRed). */
const posRed = (n: number): 'up' | 'down' => (n > 0 ? 'up' : 'down')

interface Props {
  kpis: Kpis
  year: number
}

export function KpiCards({ kpis, year }: Props) {
  const rate =
    (kpis.investIncomeRate * 100).toFixed(2) +
    '% · 年化 ' +
    (kpis.annualizedRate * 100).toFixed(2) +
    '%'

  return (
    <header className="banner reveal" style={{ animationDelay: '.04s' }}>
      <div className="banner-top">
        <span className="brand">福宝钱包 · 总览</span>
        <span className="badge">{year} 年度</span>
      </div>
      <p className="banner-label">总金额 (元)</p>
      <p className="banner-amount">{yuan(kpis.totalAmount)}</p>

      <div className="breakdown">
        <div>
          <span>本金</span>
          <b>{yuan(kpis.cumPrincipal)}</b>
        </div>
        <div>
          <span>投资收益</span>
          <b className={posRed(kpis.investIncome)}>{signedYuan(kpis.investIncome)}</b>
        </div>
        <div>
          <span>收益率</span>
          <b className={posRed(kpis.investIncomeRate)}>{rate}</b>
        </div>
      </div>

      <div className="chips">
        <div className="chip">
          <span>比定存</span>
          <b className={posRed(kpis.lead)}>{signedYuan(kpis.lead)}</b>
        </div>
        <div className="chip">
          <span>收益倍数 (vs 定存)</span>
          <b>{kpis.multiple.toFixed(2)}×</b>
        </div>
        <div className="chip">
          <span>1.4% 定存收益</span>
          <b className="soft">{yuan(kpis.bankInterest)}</b>
        </div>
      </div>
    </header>
  )
}
