import Link from 'next/link'
import { CheckIcon, StarIcon, ShieldCheckIcon, SmartphoneIcon, ClockIcon, TrendingUpIcon } from 'lucide-react'
import { CheckoutButton } from '@/components/landing/checkout-button'
import { TypingHeadline } from '@/components/landing/typing-headline'
import { PlatformShowcase } from '@/components/landing/platform-showcase'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="text-lg font-bold tracking-tight">🐾 PetFlow</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              Entrar
            </Link>
            <CheckoutButton label="Assinar agora" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" />
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-20 text-center dark:from-emerald-950/30 dark:via-gray-950 dark:to-teal-950/20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            🆕 Agenda por profissional já disponível · R$29,90/mês · Sem fidelidade
          </span>
          <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            Seu pet shop merece{' '}
            <br className="hidden sm:block" />
            <TypingHeadline />
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-gray-600 dark:text-gray-400">
            Cada profissional tem seu horário, seus serviços e sua agenda — o cliente agenda direto com quem faz.
            Menos confusão, menos conflito, mais dinheiro no caixa.
          </p>
          <CheckoutButton className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30" />
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
            7 dias de garantia · Cancele quando quiser · Suporte humano em português
          </p>
        </div>
      </section>

      {/* ── Barra de prova social ───────────────────────────────── */}
      <section className="border-y border-gray-100 bg-white py-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { value: '232+', label: 'agendamentos processados', icon: ClockIcon },
              { value: '71+', label: 'pets cadastrados', icon: '🐾' },
              { value: '20+', label: 'serviços configurados', icon: '✂️' },
              { value: '100%', label: 'dados seus, sempre', icon: ShieldCheckIcon },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                {typeof s.icon === 'string' ? (
                  <span className="text-xl">{s.icon}</span>
                ) : (
                  <s.icon className="size-5 text-emerald-600" />
                )}
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problemas ──────────────────────────────────────────── */}
      <section className="bg-gray-50 px-4 py-16 dark:bg-gray-900/40">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">Você se identifica?</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { emoji: '📱', title: 'Agenda bagunçada no WhatsApp', body: 'Você perde horários, esquece confirmações e ainda atende dois banhos no mesmo horário.' },
              { emoji: '😕', title: 'Cliente volta e ninguém lembra do pet', body: 'Sem histórico, você pergunta tudo de novo — e passa a impressão de amador.' },
              { emoji: '💸', title: 'No fim do dia, não sabe quanto entrou', body: 'Caderno rasurado, maquininha de um lado, Pix do outro. O caixa vira adivinhação.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-3 text-3xl">{item.emoji}</div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparativo PetFlow vs. jeito antigo ───────────────── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 text-center text-2xl font-bold md:text-3xl">
            Do caderninho para o controle total
          </h2>
          <p className="mb-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Veja o que muda quando você sai do improviso e entra no PetFlow.
          </p>
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[540px] overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="grid grid-cols-3 border-b border-gray-200 dark:border-gray-700">
              <div className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Situação</div>
              <div className="border-x border-gray-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-600 dark:border-gray-700 dark:bg-red-950/30 dark:text-red-400">
                😰 Antes
              </div>
              <div className="bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                ✅ Com PetFlow
              </div>
            </div>
            {/* Rows */}
            {[
              { situation: 'Agendar um banho', before: 'WhatsApp + caderno + torcer pra não conflitar', after: 'Atendente abre o sistema, escolhe horário livre e confirma' },
              { situation: 'Lembrar o histórico do pet', before: 'Pergunta tudo de novo a cada visita', after: 'Ficha completa com raça, alergias e todos os banhos anteriores' },
              { situation: 'Saber o faturamento do dia', before: 'Soma no caderno ou na maquininha no final do dia', after: 'Dashboard em tempo real, atualizado a cada serviço concluído' },
              { situation: 'Saber quais serviços mais vendem', before: 'Achismo ou planilha desatualizada', after: 'Gráfico de faturamento por período, atualizado a cada serviço concluído' },
              { situation: 'Clientes que sumiram', before: 'Não sabe quem parou de vir', after: 'Lista de inativos com data da última visita' },
              { situation: 'Agenda por profissional', before: 'Um único horário pra todo mundo — conflito na certa', after: 'Cada profissional com sua grade, seus serviços e sua disponibilidade' },
            ].map((row, i) => (
              <div key={row.situation} className={`grid grid-cols-3 border-b border-gray-100 last:border-0 dark:border-gray-800 ${i % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-900/20' : ''}`}>
                <div className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">{row.situation}</div>
                <div className="border-x border-gray-100 p-4 text-center text-sm text-red-500 dark:border-gray-800 dark:text-red-400">{row.before}</div>
                <div className="p-4 text-center text-sm text-emerald-700 dark:text-emerald-400">{row.after}</div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="bg-gray-50 px-4 py-16 dark:bg-gray-900/40">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 text-center text-2xl font-bold md:text-3xl">Tudo que seu pet shop precisa</h2>
          <p className="mb-10 text-center text-gray-500 dark:text-gray-400">Em menos de uma tarde você configura e já começa a usar.</p>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { emoji: '📅', title: 'Agenda inteligente', body: 'Marque banho, tosa e consulta sem conflito de horário — e confirme com o tutor em 2 toques.' },
              { emoji: '🐶', title: 'Ficha do cliente e do pet', body: 'Raça, pelagem, manias, vacinas. Tudo na mão quando o tutor cruzar a porta.' },
              { emoji: '✂️', title: 'Catálogo de serviços', body: 'Cadastre banho, tosa, hidratação e pacotes com preço certinho — sem calcular na ponta do lápis.' },
              { emoji: '📊', title: 'Faturamento e KPIs do dia', body: 'Veja quanto entrou, quais serviços venderam mais e quem são seus melhores clientes.' },
              { emoji: '👩‍💼', title: 'Cada profissional, seus serviços', body: 'Defina quais serviços cada funcionário realiza. O atendente agenda sem erro — zero overbooking, zero serviço no profissional errado.' },
              { emoji: '🕐', title: 'Horário individual por profissional', body: 'Configure entrada, saída e folgas separado pra cada membro da equipe. O sistema bloqueia automaticamente quem não está disponível.' },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <span className="text-3xl">{f.emoji}</span>
                <div>
                  <h3 className="mb-1 font-semibold">{f.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plataforma por dentro ───────────────────────────────── */}
      <PlatformShowcase />

      {/* ── Depoimentos ────────────────────────────────────────── */}
      <section className="bg-emerald-50 py-16 dark:bg-emerald-950/20 overflow-hidden">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-2 text-center text-2xl font-bold md:text-3xl">
            Donos de pet shop que já saíram do caderninho
          </h2>
          <p className="mb-8 text-center text-sm text-gray-500 dark:text-gray-400">Deslize para ver mais →</p>
        </div>
        {/* Scroll-snap carousel — full bleed so cards peek at edges */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 px-4 md:px-[max(1rem,calc((100vw-56rem)/2))]"
             style={{ scrollbarWidth: 'none' }}>
          {[
            { name: 'Carla Meneses', city: 'Belo Horizonte, MG', text: 'Eu anotava tudo num caderno e vivia perdendo horário. No primeiro mês com o PetFlow, parei de marcar banhos em cima um do outro e ainda descobri que minha tosa higiênica era o serviço que mais dava dinheiro. Pago os R$29,90 sem pensar.' },
            { name: 'Rogério Tavares', city: 'Campinas, SP', text: 'Meu pet shop é pequeno, somos eu e mais duas meninas. Achei que sistema ia ser complicado, mas em uma tarde já tava com tudo cadastrado. O que mais gosto é abrir o celular de manhã e ver a agenda do dia inteirinha, sem bagunça no WhatsApp.' },
            { name: 'Juliana Martins', city: 'Pet Space · Campinas, SP', text: 'A gente tinha 3 tosadoras e uma agenda só pra todo mundo. Virava bagunça toda semana. Com o PetFlow cada uma tem o próprio horário e os próprios serviços — o atendente já sabe exatamente quem faz o quê. Reduziu reclamação e o caixa melhorou porque paramos de perder agendamento por confusão.' },
          ].map((t) => (
            <div key={t.name}
              className="snap-start shrink-0 w-[85vw] max-w-sm md:w-80 rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} className="size-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">"{t.text}"</p>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.city}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Dot indicators (CSS only) */}
        <div className="mt-4 flex justify-center gap-2">
          {[0,1,2].map((i) => (
            <span key={i} className="inline-block h-2 w-2 rounded-full bg-emerald-300 dark:bg-emerald-700" />
          ))}
        </div>
      </section>

      {/* ── Preço ──────────────────────────────────────────────── */}
      <section className="px-4 py-16" id="preco">
        <div className="mx-auto max-w-md">
          <h2 className="mb-2 text-center text-2xl font-bold md:text-3xl">Um plano. Tudo incluído.</h2>
          <p className="mb-8 text-center text-sm text-gray-500 dark:text-gray-400">Valor único · Tudo incluso · Sem pegadinha, sem surpresa na fatura.</p>
          <div className="rounded-3xl border-2 border-emerald-500 p-8 shadow-xl shadow-emerald-100 dark:shadow-emerald-900/20">
            <div className="mb-6 text-center">
              <p className="text-5xl font-bold text-gray-900 dark:text-white">R$29<span className="text-2xl">,90</span></p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">/mês · Cancele quando quiser</p>
            </div>
            <ul className="mb-8 space-y-3">
              {[
                'Agenda inteligente sem conflito de horários',
                'Clientes e pets com ficha completa e histórico',
                'Catálogo de serviços e pacotes ilimitados',
                'Faturamento diário e dashboard de KPIs',
                'Agenda individual por profissional com serviços e horários próprios',
                'Acesso pelo celular, tablet ou computador',
                'Suporte humano em português, de verdade',
                'Seus dados em servidores seguros — sempre disponíveis',
                '🛡️ Garantia de 7 dias ou seu dinheiro de volta',
              ].map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  {b}
                </li>
              ))}
            </ul>
            <CheckoutButton label="Quero começar por R$29,90/mês" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" />
          </div>
        </div>
      </section>

      {/* ── Garantia ───────────────────────────────────────────── */}
      <section className="px-4 py-10 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-xl">
          <div className="flex items-start gap-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-6 py-6 dark:border-emerald-800 dark:bg-emerald-950/40">
            <span className="text-4xl shrink-0">🛡️</span>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-lg mb-1">Garantia de 7 dias — risco zero</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Se em 7 dias você não ficar satisfeito, devolvemos 100% do valor pago. Sem perguntas,
                sem burocracia. É o seu direito garantido pelo{' '}
                <strong>Código de Defesa do Consumidor, Art. 49</strong> — e a gente cumpre com prazer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Seus dados, sempre seus ─────────────────────────────── */}
      <section className="bg-gray-50 px-4 py-12 dark:bg-gray-900/40">
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: ShieldCheckIcon, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40', title: 'Seus dados são seus', body: 'Exporte clientes, pets e histórico a qualquer momento, em qualquer formato. Você nunca fica refém.' },
              { icon: SmartphoneIcon, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40', title: 'Funciona em qualquer tela', body: 'Celular, tablet, notebook. Sem instalar nada — basta abrir o navegador e fazer login.' },
              { icon: TrendingUpIcon, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/40', title: 'LGPD desde o dia 1', body: 'Dados dos seus clientes protegidos conforme a lei. Nenhuma informação é vendida ou compartilhada.' },
            ].map((item) => (
              <div key={item.title} className={`rounded-2xl ${item.bg} p-5`}>
                <item.icon className={`mb-3 size-5 ${item.color}`} />
                <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-16 dark:bg-gray-950">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">Perguntas frequentes</h2>
          <div className="space-y-4">
            {[
              { q: 'Preciso instalar alguma coisa?', a: 'Não. O PetFlow funciona direto no navegador do celular, tablet ou computador. Basta fazer login e usar.' },
              { q: 'Tem fidelidade ou multa pra cancelar?', a: 'Nenhuma. Você paga mês a mês e cancela quando quiser, sem burocracia.' },
              { q: 'E se eu cancelar — perco meus dados?', a: 'Não. Seus dados ficam seguros nos nossos servidores e nossa equipe te ajuda a extrair tudo antes do cancelamento. Clientes, pets, histórico — tudo seu, sempre.' },
              { q: 'Consigo migrar minha agenda atual?', a: 'Sim. A gente te ajuda a cadastrar seus clientes e pets na primeira semana, mesmo que esteja tudo no caderno ou no WhatsApp.' },
              { q: 'Funciona pra pet shop pequeno, com 1 ou 2 funcionários?', a: 'Foi feito pra isso. O PetFlow foi desenhado pro dono que atende no balcão e precisa de algo simples, rápido e que não atrapalhe o dia.' },
              { q: 'E se eu não gostar? Tem garantia?', a: 'Sim. Você tem 7 dias de garantia total. Se não ficar satisfeito por qualquer motivo, devolvemos 100% do valor pago — sem perguntas e sem burocracia. É seu direito pelo Código de Defesa do Consumidor (Art. 49) e a gente cumpre com prazer.' },
            ].map((item) => (
              <details key={item.q} className="group rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <summary className="cursor-pointer list-none font-medium">{item.q}</summary>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ──────────────────────────────────────────── */}
      <section className="bg-emerald-600 px-4 py-20 text-center dark:bg-emerald-800">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Seu próximo banho pode já sair organizado.
          </h2>
          <p className="mb-8 text-emerald-100">
            R$29,90/mês pra ter agenda, equipe e caixa organizados num só lugar.
            Ative agora e comece a usar hoje mesmo.
          </p>
          <CheckoutButton className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 shadow-lg" />
          <p className="mt-4 text-sm text-emerald-200">
            🛡️ Garantia de 7 dias — não gostou, devolvemos tudo. Sem perguntas.
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 px-4 py-8 text-center text-xs text-gray-400 dark:border-gray-800">
        <p>© {new Date().getFullYear()} PetFlow · Todos os direitos reservados</p>
        <p className="mt-1">
          <Link href="/login" className="hover:underline">Entrar</Link>
          {' · '}
          <a href="mailto:suporte@getpetflow.com" className="hover:underline">suporte@getpetflow.com</a>
        </p>
      </footer>
    </div>
  )
}
