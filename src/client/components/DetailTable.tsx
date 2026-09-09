// DetailTable — AntD Table, one row per month. Columns grouped 当月损益 / 累计损益,
// with a multiple "×" pill. Itemized deposits are revealed via an expandable row so a
// month with several deposits stays a single table row.

import { Card, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Row } from '../../domain/compute'
import type { MonthRow } from '../../domain/wallet'
import { monthLabel, signClass, signedYuan, yuan } from '../format'

interface MonthRecord extends Row {
  key: string
  deposits: MonthRow['deposits']
}

const pill = (num: number | null) => {
  if (num === null) return <span className="dim">—</span>
  return (
    <Tag className={'pill' + (num < 0 ? ' neg' : '')} bordered={false}>
      {num.toFixed(2)}×
    </Tag>
  )
}

const columns: ColumnsType<MonthRecord> = [
  {
    title: '月份',
    dataIndex: 'month',
    key: 'month',
    fixed: 'left', // 手机横向滚动时保持月份可见
    width: 64,
    render: (m: string) => monthLabel(m),
  },
  {
    title: '存入',
    dataIndex: 'deposit',
    key: 'deposit',
    align: 'right',
    render: (d: number) => <span className="dim">{d ? yuan(d) : '—'}</span>,
  },
  {
    title: '当月损益',
    children: [
      {
        title: '投资',
        dataIndex: 'investIncome',
        key: 'investIncome',
        align: 'right',
        render: (n: number) => <span className={signClass(n)}>{signedYuan(n)}</span>,
      },
      {
        title: '银行',
        dataIndex: 'bankInterest',
        key: 'bankInterest',
        align: 'right',
        render: (n: number) => <span className="dim">{yuan(n)}</span>,
      },
    ],
  },
  {
    title: '累计损益',
    children: [
      {
        title: '投资',
        dataIndex: 'cumIncome',
        key: 'cumIncome',
        align: 'right',
        render: (n: number) => <span className={signClass(n)}>{yuan(n)}</span>,
      },
      {
        title: '银行',
        dataIndex: 'cumBankInterest',
        key: 'cumBankInterest',
        align: 'right',
        render: (n: number) => <span className="dim">{yuan(n)}</span>,
      },
      {
        title: '倍数',
        key: 'multiple',
        align: 'right',
        render: (_, r) => pill(r.cumBankInterest > 0 ? r.cumIncome / r.cumBankInterest : null),
      },
    ],
  },
]

interface Props {
  rows: Row[]
  months: MonthRow[]
}

export function DetailTable({ rows, months }: Props) {
  const data: MonthRecord[] = rows.map((r, i) => ({
    ...r,
    key: r.month,
    deposits: months[i]?.deposits ?? [],
  }))

  return (
    <Card className="card reveal" variant="borderless" style={{ animationDelay: '.28s' }}>
      <h2>逐月明细</h2>
      <Table<MonthRecord>
        columns={columns}
        dataSource={data}
        pagination={false}
        size="middle"
        scroll={{ x: 'max-content' }}
        rowClassName={(r, i) =>
          [r.deposits.length > 0 ? 'row-clickable' : '', i % 2 === 1 ? 'row-alt' : '']
            .filter(Boolean)
            .join(' ')
        }
        expandable={{
          showExpandColumn: false, // 去掉 + 号列
          expandRowByClick: true, // 点击整行展开/收起
          rowExpandable: (r) => r.deposits.length > 0,
          expandedRowRender: (r) => (
            <ul className="detail-deposits">
              {r.deposits.map((d, i) => (
                <li key={i}>
                  <span>{yuan(d.amount)}</span>
                  <span className={d.notes ? 'notes' : 'empty'}>{d.notes || '未备注'}</span>
                </li>
              ))}
            </ul>
          ),
        }}
      />
    </Card>
  )
}
