const withImages = require('next-images')
const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    disableStaticImages: true,
    },
};


// module.exports = withNextra()
// module.exports = withImages(withNextra({...nextConfig}))
// ;

// const { withExpo } = require("@expo/next-adapter");
const withPlugins = require("next-compose-plugins");
// const withFonts = require("next-fonts");
// const withTM = require("next-transpile-modules")(["react-native-web"]);



module.exports = withPlugins(
[withImages, withNextra],
nextConfig
);