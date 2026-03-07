/**
 * PostCSS plugin: rewrite old radial-gradient direction syntax to the new form
 * so Autoprefixer doesn't warn. Old: "0 0, closest-side" → New: "closest-side at 0 0"
 * Runs after Tailwind so compiled CSS is normalized before Autoprefixer.
 */
module.exports = () => {
  return {
    postcssPlugin: 'normalize-radial-gradient',
    OnceExit(root, { result }) {
      const fix = (str) => {
        if (!str || !str.includes('radial-gradient')) return str
        return str.replace(
          /radial-gradient\(\s*([^,)]+),\s*closest-side\b/g,
          'radial-gradient(closest-side at $1'
        )
      }
      root.walk((node) => {
        if (node.type === 'decl' && node.value) node.value = fix(node.value)
        if (node.type === 'atrule' && node.params) node.params = fix(node.params)
      })
    },
  }
}
module.exports.postcss = true
