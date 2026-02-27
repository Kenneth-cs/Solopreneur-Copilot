import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // 不用 <Image> 组件的图片优化，禁用 sharp 避免跨平台问题
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
