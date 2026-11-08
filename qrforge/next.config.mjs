/** @type {import('next').NextConfig} */
const nextConfig = {
  // PGlite ships WASM files it loads from disk, so keep it out of the bundle.
  serverExternalPackages: ['@electric-sql/pglite'],
};

export default nextConfig;
