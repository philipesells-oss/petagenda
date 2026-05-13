/**
 * Edge Middleware — Auth + Tenant Routing
 *
 * Runs on every request (except static assets). Responsibilities:
 *  1. Refresh the Supabase session cookies (required by @supabase/ssr)
 *  2. Redirect unauthenticated users away from protected routes → /login
 *  3. Redirect authenticated users away from public auth pages → /
 *  4. Force canceled-plan users into /settings/billing
 *
 * Keep this file lightweight — it runs in the Edge Runtime. Do not perform
 * heavy DB queries here; use Server Components/Actions for that.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/first-access']
const BILLING_ROUTE = '/settings/billing'
const FIRST_ACCESS_ROUTE = '/first-access'

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // IMPORTANT: getUser() revalidates the JWT against the Supabase server and
  // refreshes the session cookie when needed. Do NOT replace with getSession().
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const pathIsPublic = isPublicRoute(pathname)

  // Case 1: unauthenticated → redirect to /login (except on public routes)
  if (!user && !pathIsPublic) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Case 2: authenticated on auth pages → redirect to /dashboard
  // Exception: /first-access stays accessible so force_password_change flow works
  if (
    user &&
    pathname !== FIRST_ACCESS_ROUTE &&
    PUBLIC_ROUTES.some((route) => pathname === route)
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Case 3: authenticated but must set password on first access (Stripe onboarding flow).
  // Flag is stored in user_metadata to avoid a DB round-trip on every request.
  if (user && user.user_metadata?.force_password_change === true) {
    if (pathname !== FIRST_ACCESS_ROUTE) {
      return NextResponse.redirect(new URL(FIRST_ACCESS_ROUTE, request.url))
    }
  }

  // Case 4: authenticated but subscription canceled — gate to billing page.
  // plan_status is stored in user_metadata (set by webhook) to avoid DB on every request.
  if (user && user.user_metadata?.plan_status === 'canceled') {
    if (pathname !== BILLING_ROUTE && !pathname.startsWith(BILLING_ROUTE)) {
      return NextResponse.redirect(new URL(BILLING_ROUTE, request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|auth|_next/static|_next/image|favicon.ico|public).*)'],
}
