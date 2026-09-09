// KpiCards — 蓝色钱包横幅：展示 deriveKpis() 生成的 7 个核心数值。
// 每个数值使用 AntD <Statistic>（标题和值），年份徽标使用 <Tag>；
// 蓝底白字和涨红跌绿的样式定义在 App.css 中，以保持与原版一致的视觉效果。

import { Statistic, Tag } from 'antd'
import type { Kpis } from '../../domain/kpi'
import { signedYuan, yuan } from '../format'

/** 正数使用红色胶囊，否则使用绿色胶囊（与原 posRed 逻辑一致）。 */
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
        <span className="brand">福宝钱包 · 收支与投资损益</span>
        <Tag className="badge" bordered={false}>
          {year} 年度
        </Tag>
      </div>

      <Statistic
        className="amount-stat"
        title="总金额 (元)"
        value={kpis.totalAmount}
        formatter={() => yuan(kpis.totalAmount)}
      />

      <div className="breakdown">
        <Statistic
          className="principal"
          title="本金"
          value={kpis.cumPrincipal}
          formatter={() => yuan(kpis.cumPrincipal)}
        />
        <Statistic
          title="投资损益"
          value={kpis.investIncome}
          formatter={() => (
            <span className={posRed(kpis.investIncome)}>{signedYuan(kpis.investIncome)}</span>
          )}
        />
        <Statistic
          title="损益率"
          value={kpis.investIncomeRate}
          formatter={() => <span className={posRed(kpis.investIncomeRate)}>{rate}</span>}
        />
      </div>

      <div className="chips">
        <Statistic
          className="chip"
          title="比定存"
          value={kpis.lead}
          formatter={() => <span className={posRed(kpis.lead)}>{signedYuan(kpis.lead)}</span>}
        />
        <Statistic
          className="chip"
          title={
            <>
              <span className="title-full">损益倍数 (vs 定存)</span>
              <span className="title-short">损益倍数</span>
            </>
          }
          value={kpis.multiple}
          formatter={() => kpis.multiple.toFixed(2) + '×'}
        />
        <Statistic
          className="chip"
          title="1.4% 定存损益"
          value={kpis.bankInterest}
          formatter={() => <span className="soft">{yuan(kpis.bankInterest)}</span>}
        />
      </div>
    </header>
  )
}
