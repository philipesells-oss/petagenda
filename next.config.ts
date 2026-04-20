import type { NextConfig } from "next";

const SUPABASE_HOSTNAME = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "qckasnpabjucioiemiot.supabase.co";
  try {
    return new URL(url).hostname;
  } catch {
    return "qckasnpabjucioiemiot.supabase.co";
  }
})();

const SUPABASE_URL = `https://${SUPABASE_HOSTNAME}`;

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires unsafe-inline + unsafe-eval for hydration in dev;
      // in prod the inline scripts use nonces injected by the framework.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: ${SUPABASE_URL}`,
      `connect-src 'self' ${SUPABASE_URL} wss://${SUPABASE_HOSTNAME} https://api.stripe.com`,
      "font-src 'self'",
      "frame-src https://js.stripe.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: SUPABASE_HOSTNAME,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
