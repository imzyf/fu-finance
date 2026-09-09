// App — 页面布局：KPI 横幅、收益图表和明细表。
// 数据运行时从 /api/wallet 读取（loadWallet），分为加载中、出错和就绪三种状态。
// 就绪后依次执行 computeSeries → deriveKpis → 渲染。

import { useEffect, useState } from 'react'
import './App.css'
import { computeSeries } from '../domain/compute'
import { deriveKpis } from '../domain/kpi'
import type { WalletData } from '../domain/wallet'
import { loadWallet } from './loadWallet'
import { KpiCards } from './components/KpiCards'
import { IncomeChart } from './components/IncomeChart'
import { SavingsChart } from './components/SavingsChart'
import { DetailTable } from './components/DetailTable'
import { SkeletonScreen, ErrorScreen } from './components/StatusScreens'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; wallet: WalletData }

export default function App() {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    loadWallet()
      .then((wallet) => {
        if (!cancelled) setState({ status: 'ready', wallet })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : '网络错误，请稍后重试'
          setState({ status: 'error', message })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (state.status === 'loading') return <SkeletonScreen />
  if (state.status === 'error') return <ErrorScreen message={state.message} />

  const { wallet } = state
  const { rows, totals } = computeSeries(wallet.months)
  const kpis = deriveKpis(rows, totals)

  return (
    <main className="wrap">
      <KpiCards kpis={kpis} year={wallet.year} />
      <IncomeChart months={wallet.months} />
      <SavingsChart months={wallet.months} />
      <DetailTable rows={rows} months={wallet.months} />
      <footer className="slogan reveal" style={{ animationDelay: '.36s' }}>
        <p className="slogan-text">
          理财多谨慎，目标 <b>3 冲 5</b> 💪
        </p>
        <p className="copyright">© {wallet.year} 福宝钱包 · All rights reserved</p>
      </footer>
    </main>
  )
}
