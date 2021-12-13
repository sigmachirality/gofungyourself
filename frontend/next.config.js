/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // basePath: process.env.BASE_PATH || "",
  // assetPrefix: process.env.BASE_PATH || ""
  publicRuntimeConfig: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH
}
}
