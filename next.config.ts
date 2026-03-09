import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,

  // performance.
  compress: true,

  // External packages for server
  serverExternalPackages: ["pino", "pino-pretty"],

  experimental: {
    ppr: false,

    // performance.
    optimizePackageImports: ["zod", "uuid"],

    // routing, navigation.
    dynamicOnHover: true,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.devtool = "source-map";
    }
    return config;
  },
};

export default nextConfig;
