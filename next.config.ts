import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — emits plain HTML/CSS/JS to out/ for static hosting.
  output: "export",
  images: { unoptimized: true },
  // Clean URLs without a trailing slash (e.g. /research, not /research/).
  trailingSlash: false,
};

export default nextConfig;
