const autoprefixer = require('autoprefixer')

// Use Browserslist from package.json or .browserslistrc (no overrideBrowserslist here)
const autoprefixerPlugin = autoprefixer({
  grid: false,
  ignoreUnknownVersions: true,
})

// Suppress gradient direction warning from Autoprefixer (Tailwind output uses older syntax)
const origPostcss = autoprefixerPlugin.postcss
if (origPostcss) {
  autoprefixerPlugin.postcss = function (root, result) {
    const origWarn = console.warn
    console.warn = function (msg) {
      if (typeof msg === 'string' && msg.includes('Gradient has outdated direction syntax')) return
      origWarn.apply(console, arguments)
    }
    try {
      return origPostcss.call(this, root, result)
    } finally {
      console.warn = origWarn
    }
  }
}

module.exports = {
  plugins: {
    tailwindcss: {},
    './postcss-normalize-radial-gradient.js': {},
    autoprefixer: autoprefixerPlugin,
  },
}
