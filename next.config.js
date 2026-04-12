const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep tracing scoped to this repo even if parent folders contain other lockfiles.
  outputFileTracingRoot: path.join(__dirname),
  allowedDevOrigins: [
    'http://172.29.50.122:3000',
    '172.29.50.122',
  ],
}

module.exports = nextConfig
