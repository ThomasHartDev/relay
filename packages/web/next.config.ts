import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@relay/shared", "@relay/db"],
  outputFileTracingIncludes: {
    "/**": ["../../node_modules/.prisma/client/*"],
  },
};

export default nextConfig;
