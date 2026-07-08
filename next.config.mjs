/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth', 'pdfkit', 'tesseract.js', 'pdf-to-png-converter'],
  },
};

export default nextConfig;
