// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/papergenReact/', // <-- make sure this exactly matches your repo name, trailing slash included
  plugins: [react()]
})
