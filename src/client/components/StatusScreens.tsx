// StatusScreens — loading / error placeholders shown while /api/wallet is in flight or has failed.
// 仅覆盖网络/空数据（DB + 类型化 assemble 已保证数据形状），形状错误不在此处理。

import { Skeleton, Result, Button } from 'antd'

/** 加载中：KPI 横幅 + 图表 + 明细表的占位骨架，尺寸贴近真实布局以减少跳动。 */
export function SkeletonScreen() {
  return (
    <main className="wrap" aria-busy="true">
      <Skeleton.Node active style={{ width: '100%', height: 240, borderRadius: 16 }} />
      <Skeleton.Node active style={{ width: '100%', height: 320, borderRadius: 16, marginTop: 16 }} />
      <Skeleton active paragraph={{ rows: 6 }} style={{ marginTop: 16 }} />
    </main>
  )
}

interface ErrorProps {
  message: string
}

/** 出错：网络不可达 / 接口非 200 / 空数据时的中文提示 + 重试。 */
export function ErrorScreen({ message }: ErrorProps) {
  return (
    <main className="wrap">
      <Result
        status="warning"
        title="加载钱包数据失败"
        subTitle={message}
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            重试
          </Button>
        }
      />
    </main>
  )
}
