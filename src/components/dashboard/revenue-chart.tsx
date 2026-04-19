'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface RevenueChartDay {
  day: string
  revenue: number
}

export interface PeriodData {
  data: RevenueChartDay[]
  totalRevenue: number
  trendPct: number
}

interface RevenueChartProps {
  period7: PeriodData
  period15: PeriodData
  period30: PeriodData
}

const currencyShort = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const currencyFull = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm">
      <p className="font-medium">{label}</p>
      <p className="text-emerald-600 dark:text-emerald-400">
        {currencyFull.format(payload[0].value)}
      </p>
    </div>
  )
}

type Period = 7 | 15 | 30

export function RevenueChart({ period7, period15, period30 }: RevenueChartProps) {
  const [period, setPeriod] = useState<Period>(7)

  const current = period === 7 ? period7 : period === 15 ? period15 : period30
  const { data, totalRevenue, trendPct } = current
  const hasData = data.some((d) => d.revenue > 0)
  const trendUp = trendPct >= 0

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Faturamento — últimos {period} dias
          </p>
          <p className="text-2xl font-semibold tracking-tight mt-0.5">
            {currencyFull.format(totalRevenue)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {trendPct !== 0 && (
            <span
              className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
                trendUp
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
              }`}
            >
              {trendUp ? '+' : ''}
              {trendPct.toFixed(0)}% vs período anterior
            </span>
          )}
          <div
            role="tablist"
            aria-label="Período do gráfico"
            className="inline-flex items-center gap-1 rounded-lg border bg-card p-0.5 text-xs"
          >
            {([7, 15, 30] as Period[]).map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={period === p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'rounded-md px-2.5 py-1 font-medium transition-colors',
                  period === p
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {p}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
          Nenhum faturamento registrado nos últimos {period} dias.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => currencyShort.format(v)}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Bar
              dataKey="revenue"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={44}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
