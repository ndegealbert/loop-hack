/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',          // <-- this replaces "next export"
    images: { unoptimized: true } // needed for static export on Netlify
  };
  module.exports = nextConfig;
  