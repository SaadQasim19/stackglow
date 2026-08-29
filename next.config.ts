import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/**/*": ["./icons/**/*"],
    "/api/icons": ["./icons/**/*"],
    "/api/icons/list": ["./icons/**/*"],
  },
};

export default nextConfig;
