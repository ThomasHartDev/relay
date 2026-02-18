import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@relay/shared", "@relay/db"],
};

export default nextConfig;
