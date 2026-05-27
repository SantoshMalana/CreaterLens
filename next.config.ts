/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['chromadb'],
  turbopack: {
    resolveAlias: {
      'onnxruntime-node': './src/lib/empty.ts',
      sharp: './src/lib/empty.ts',
    },
  },
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      'onnxruntime-node$': false,
    };
    return config;
  },
};

export default nextConfig;
