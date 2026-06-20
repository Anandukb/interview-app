import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Pre-bundle prismjs (and language plugins) with esbuild. This preserves
  // the IIFE side effect that registers `window.Prism`, which `@lexical/code`
  // (a transitive dep of @mdxeditor/editor) relies on at module evaluation.
  optimizeDeps: {
    include: [
      'prismjs',
      'prismjs/components/prism-clike',
      'prismjs/components/prism-javascript',
      'prismjs/components/prism-typescript',
      'prismjs/components/prism-jsx',
      'prismjs/components/prism-tsx',
      'prismjs/components/prism-markup',
      'prismjs/components/prism-markdown',
      'prismjs/components/prism-css',
      'prismjs/components/prism-c',
      'prismjs/components/prism-cpp',
      'prismjs/components/prism-java',
      'prismjs/components/prism-python',
      'prismjs/components/prism-rust',
      'prismjs/components/prism-sql',
      'prismjs/components/prism-bash',
      'prismjs/components/prism-go',
      'prismjs/components/prism-json',
      'prismjs/components/prism-objectivec',
      'prismjs/components/prism-powershell',
      'prismjs/components/prism-swift',
    ],
  },
})
