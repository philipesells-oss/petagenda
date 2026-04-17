import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClientForm } from '@/components/clients/client-form'

export default function NewClientPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Link href="/clients" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Novo cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}
