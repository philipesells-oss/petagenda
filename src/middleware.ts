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

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password']
const BILLING_ROUTE = '/settings/billing'

function isPublicRoute(pathname: string): boolean {
  // Root is public (landing page); everything else must match exactly or as a
  // prefix for nested public pages (e.g. /login/callback).
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

  // Case 2: authenticated on /login, /signup, /forgot-password → redirect to /
  if (user && PUBLIC_ROUTES.some((route) => pathname === route)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Case 3: authenticated with canceled plan → force to billing
  // Skip the check if already on the billing route (prevents redirect loop)
  // or if the plan row hasn't been provisioned yet (fresh signup).
  //
  // NOTE: this is a round-trip per request — acceptable for MVP. Post-MVP,
  // cache `plan_status` in the auth JWT's app_metadata and read from the
  // user session instead of hitting the DB here.
  if (user && pathname !== BILLING_ROUTE) {
    type TenantLinkRow = {
      tenant:
        | { plan_status: string | null }
        | { plan_status: string | null }[]
        | null
    }

    const { data } = await supabase
      .from('users')
      .select('tenant:tenants(plan_status)')
      .eq('id', user.id)
      .maybeSingle<TenantLinkRow>()

    // PostgREST may return the FK join as a single object or an array
    // depending on cardinality inference — normalize both shapes.
    const link = data?.tenant
    const planStatus = Array.isArray(link)
      ? link[0]?.plan_status
      : link?.plan_status

    if (planStatus === 'canceled') {
      return NextResponse.redirect(new URL(BILLING_ROUTE, request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
