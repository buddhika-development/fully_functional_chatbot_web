import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // All /api/v1/* calls are proxied to the FastAPI backend.
        // NOTE: Local Next.js route handlers in app/api/** always take priority
        // over rewrites, so app/api/v1/chat/stream/route.ts handles SSE
        // streaming without buffering, while all other endpoints go to FastAPI.
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      },
    ];
  },
};

export default nextConfig;

