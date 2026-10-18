/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@mcms/ui-web',
    '@mcms/api-client',
    '@mcms/contracts',
    '@mcms/domain',
    '@mcms/validation',
    '@mcms/sync-core',
  ],
};

export default nextConfig;
