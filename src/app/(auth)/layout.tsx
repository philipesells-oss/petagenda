import Link from 'next/link'
import { Toaster } from '@/components/ui/sonner'

/**
 * Auth Layout — shared shell for /login, /signup, /forgot-password.
 *
 * Centered card on a clean background, no sidebar. Middleware already
 * redirects authenticated users away from these pages.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 text-2xl font-semibold tracking-tight"
        >
          <span aria-hidden="true">🐾</span>
          <span>PetAgenda</span>
        </Link>
        <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-sm">
          {children}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} PetAgenda. Todos os direitos reservados.
        </p>
      </div>
      <Toaster />
    </div>
  )
}
