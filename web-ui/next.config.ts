import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    APP_NAME: process.env.APP_NAME,
  }
};

export default nextConfig;
