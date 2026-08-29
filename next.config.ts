import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TASKMANAGEMENT用EC2に同居させる際、nginxが/inquiries配下でリバースプロキシするため
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
};

export default nextConfig;
