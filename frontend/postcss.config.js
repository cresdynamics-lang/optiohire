const autoprefixer = require('autoprefixer')

// Suppress autoprefixer gradient direction warning (Tailwind/internals use older syntax)
const autoprefixerOptions = {
  overrideBrowserslist: ['> 1%', 'last 2 versions'],
  grid: false,
  ignoreUnknownVersions: true,
}
const autoprefixerPlugin = autoprefixer(autoprefixerOptions)
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
