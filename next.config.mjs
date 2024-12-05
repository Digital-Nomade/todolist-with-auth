/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  middleware: ['/api/*'],
};

export default nextConfig;
