import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Fallback to a default or throw a clear error during build
    const apiBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!apiBaseUrl) {
      console.error("ERROR: NEXT_PUBLIC_BASE_URL is not defined in environment variables.");
      // Return an empty array or a dummy route to avoid crashing the build immediately 
      // if you need to debug, but ideally, it should stop here.
      return []; 
    }

    return [
      {
        source: "/api/v1/:path*",
        // Ensure you append the path parameter if it's missing in your env var
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
