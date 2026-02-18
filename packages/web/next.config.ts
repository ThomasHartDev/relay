import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@relay/shared", "@relay/db"],
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
};

export default nextConfig;
