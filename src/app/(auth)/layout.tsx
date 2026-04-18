import { Toaster } from '@/components/ui/sonner'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left — form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span>🐾</span>
            <span>PetFlow</span>
          </div>
          {children}
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PetFlow. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right — animated illustration (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-emerald-600 text-white relative overflow-hidden">
        {/* Floating paw prints */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {[
            { top: '8%',  left: '15%', size: '3rem',  delay: '0s',   dur: '6s'  },
            { top: '20%', left: '70%', size: '2rem',  delay: '1s',   dur: '8s'  },
            { top: '50%', left: '10%', size: '2.5rem',delay: '2s',   dur: '7s'  },
            { top: '70%', left: '60%', size: '3.5rem',delay: '0.5s', dur: '9s'  },
            { top: '85%', left: '25%', size: '2rem',  delay: '3s',   dur: '6.5s'},
            { top: '35%', left: '45%', size: '4rem',  delay: '1.5s', dur: '10s' },
            { top: '60%', left: '80%', size: '2.5rem',delay: '2.5s', dur: '7.5s'},
          ].map((p, i) => (
            <span
              key={i}
              className="absolute opacity-20"
              style={{
                top: p.top,
                left: p.left,
                fontSize: p.size,
                animation: `float ${p.dur} ease-in-out ${p.delay} infinite alternate`,
              }}
            >🐾</span>
          ))}
        </div>

        <div className="relative z-10 text-center space-y-6 px-8">
          <div className="text-8xl animate-bounce">🐶</div>
          <h2 className="text-3xl font-bold leading-tight">
            Seu pet shop,<br />no controle total.
          </h2>
          <p className="text-emerald-100 text-base max-w-xs mx-auto">
            Agenda inteligente, clientes organizados e WhatsApp integrado — tudo em um lugar.
          </p>
          <div className="flex justify-center gap-4 text-4xl">
            <span className="animate-pulse">🐱</span>
            <span className="animate-pulse" style={{ animationDelay: '0.3s' }}>✂️</span>
            <span className="animate-pulse" style={{ animationDelay: '0.6s' }}>🛁</span>
          </div>
        </div>

        <style>{`
          @keyframes float {
            from { transform: translateY(0px) rotate(0deg); }
            to   { transform: translateY(-20px) rotate(15deg); }
          }
        `}</style>
      </div>

      <Toaster />
    </div>
  )
}
