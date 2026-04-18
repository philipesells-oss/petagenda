'use client'

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

export interface RevenueChartDay {
  day: string
  revenue: number
}

interface RevenueChartProps {
  data: RevenueChartDay[]
  totalRevenue: number
  trendPct: number
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

export function RevenueChart({ data, totalRevenue, trendPct }: RevenueChartProps) {
  const hasData = data.some((d) => d.revenue > 0)
  const trendUp = trendPct >= 0

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Faturamento — últimos 7 dias
          </p>
          <p className="text-2xl font-semibold tracking-tight mt-0.5">
            {currencyFull.format(totalRevenue)}
          </p>
        </div>
        {trendPct !== 0 && (
          <span
            className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
              trendUp
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
            }`}
          >
            {trendUp ? '+' : ''}
            {trendPct.toFixed(0)}% vs semana anterior
          </span>
        )}
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
          Nenhum faturamento registrado nos últimos 7 dias.
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
