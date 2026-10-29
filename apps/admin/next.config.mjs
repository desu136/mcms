/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@mcms/api-client',
    '@mcms/contracts',
    '@mcms/domain',
    '@mcms/validation',
  ],
};

export default nextConfig;
