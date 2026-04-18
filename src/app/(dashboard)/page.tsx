import { redirect } from 'next/navigation'

// Dashboard root: redirect authenticated users to /dashboard
export default function DashboardRoot() {
  redirect('/dashboard')
}
