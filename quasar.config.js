const { configure } = require('quasar/wrappers')

module.exports = configure((ctx) => ({
  eslint: {
    warnings: true,
    errors: true,
    exclude: ['.quasar', 'dist']
  },
  boot: ['pinia', 'auth', 'supabase'],
  css: ['app.sass'],
  extras: ['material-icons'],
  build: {
    vueRouterMode: 'hash',
    publicPath: process.env.VITE_PUBLIC_PATH || '/',
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      VITE_PUBLIC_PATH: process.env.VITE_PUBLIC_PATH
    }
  },
  devServer: {
    open: true,
    port: 5174
  },
  framework: {
    config: {},
    plugins: ['Notify', 'Dialog', 'Loading']
  }
}))
