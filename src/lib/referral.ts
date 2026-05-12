export function generateReferralCode(userId: string): string {
  return userId.replace(/-/g, '').toUpperCase().slice(0, 8)
}

export function getReferralUrl(code: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getpetflow.com'
  return `${appUrl}/?ref=${code}`
}
