/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Prevent Next.js from trying to bundle packages that use native bindings,
  // file-system access, or dynamic requires at runtime. Without this, the
  // build or the runtime can crash with "Module not found" errors.
  serverExternalPackages: [
    '@prisma/client',
    'prisma',
    '@mastra/core',
    '@ai-sdk/openai',
  ],
};

export default nextConfig;
