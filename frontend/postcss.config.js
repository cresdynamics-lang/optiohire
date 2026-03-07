const autoprefixer = require('autoprefixer')

// Suppress these warnings for the whole PostCSS run (from Autoprefixer/Browserslist/Tailwind)
const SUPPRESS = [
  'Gradient has outdated direction syntax',
  'Replace Autoprefixer browsers option',
  'browserslist',
]
// Run first; suppresses console.warn for Browserslist/Autoprefixer messages during the whole run
const suppressPlugin = () => ({
  postcssPlugin: 'suppress-browserslist-warnings',
  Once() {
    const orig = console.warn
    console.warn = function (msg) {
      if (typeof msg === 'string' && SUPPRESS.some((s) => msg.includes(s))) return
      orig.apply(console, arguments)
    }
  },
})
suppressPlugin.postcss = true

const autoprefixerOptions = {
  grid: false,
  ignoreUnknownVersions: true,
}
const autoprefixerPlugin = autoprefixer(autoprefixerOptions)
const origPostcss = autoprefixerPlugin.postcss
if (origPostcss) {
  autoprefixerPlugin.postcss = function (root, result) {
    const origWarn = console.warn
    console.warn = function (msg) {
      if (typeof msg === 'string' && SUPPRESS.some((s) => msg.includes(s))) return
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
    suppressPlugin,
    tailwindcss: {},
    './postcss-normalize-radial-gradient.js': {},
    autoprefixer: autoprefixerPlugin,
  },
}
