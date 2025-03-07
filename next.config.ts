import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Increase limit (adjust as needed)
    },
  },
  /* config options here */
};

export default nextConfig;
