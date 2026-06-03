import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without it, Turbopack walks up
  // and picks a stray lockfile on the Desktop as the root, which skews
  // module resolution and output-file tracing.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
