import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // สั่งให้ ignore การเช็ก ESLint ตอน Build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // สั่งให้ ignore Error ของ TypeScript ไปด้วยเลยเพื่อความชัวร์
    ignoreBuildErrors: true,
  },
}

export default nextConfig;