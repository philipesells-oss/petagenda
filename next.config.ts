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

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: SUPABASE_HOSTNAME,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
