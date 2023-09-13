const withImages = require('next-images')
const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};


// module.exports = withNextra()
module.exports = withImages(withNextra({...nextConfig}))
;