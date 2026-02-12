module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      overrideBrowserslist: ['> 1%', 'last 2 versions'],
      grid: false,
      // Suppress gradient syntax warnings (Tailwind uses older syntax internally)
      ignoreUnknownVersions: true,
    },
  },
}
