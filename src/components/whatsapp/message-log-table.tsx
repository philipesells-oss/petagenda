import { Badge } from '@/components/ui/badge'
import type { MessageLog } from '@/actions/whatsapp'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  sent: 'Enviado',
  delivered: 'Entregue',
  read: 'Lido',
  failed: 'Falhou',
}

const STATUS_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending: 'outline',
  sent: 'secondary',
  delivered: 'default',
  read: 'default',
  failed: 'destructive',
}

interface Props {
  logs: MessageLog[]
}

export function MessageLogTable({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Nenhuma mensagem enviada ainda.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="border-b text-left">
            <th className="px-4 py-3 font-medium">Data</th>
            <th className="px-4 py-3 font-medium">Telefone</th>
            <th className="px-4 py-3 font-medium">Mensagem</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {new Date(log.created_at).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-4 py-3">{log.phone}</td>
              <td className="max-w-xs px-4 py-3">
                <p className="line-clamp-2 text-sm">{log.body}</p>
                {log.error_message && (
                  <p className="mt-0.5 text-xs text-destructive">{log.error_message}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant={STATUS_VARIANTS[log.status] ?? 'outline'}
                  className="text-xs"
                >
                  {STATUS_LABELS[log.status] ?? log.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
