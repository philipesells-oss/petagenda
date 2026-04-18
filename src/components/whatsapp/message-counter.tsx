import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  used: number
  limit: number
}

export function MessageCounter({ used, limit }: Props) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const color =
    pct >= 90 ? 'bg-destructive' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500'

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Mensagens do Plano</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Usadas</span>
          <span className="font-medium">
            {used.toLocaleString('pt-BR')} / {limit.toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{pct}% utilizado</p>
      </CardContent>
    </Card>
  )
}
