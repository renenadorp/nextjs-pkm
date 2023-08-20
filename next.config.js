const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

const standaloneNextConfig=
  /**
   * @type {import('next').NextConfig}
   */
  nextConfig = {
    output: 'standalone',
  };

// module.exports = withNextra()
module.exports = withNextra({standaloneNextConfig})
;

