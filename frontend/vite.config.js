import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const dictDir = fileURLToPath(new URL('./static/dict/', import.meta.url))

// Vite marks every `.gz` response as Content-Encoding: gzip, so the browser
// decompresses the dictionary before kuromoji's own gunzip step. Serve the
// raw gzip payload instead so BrowserDictionaryLoader can decompress it.
function kuromojiDictionary() {
  const serveDict = (req, res, next) => {
    const pathname = decodeURIComponent((req.url ?? '').split('?')[0])
    if (!pathname.startsWith('/dict/') || !pathname.endsWith('.dat.gz')) {
      next()
      return
    }

    const file = join(dictDir, pathname.slice('/dict/'.length))
    if (!file.startsWith(dictDir)) {
      next()
      return
    }

    readFile(file)
      .then((data) => {
        res.setHeader('Content-Type', 'application/octet-stream')
        res.setHeader('Content-Encoding', 'identity')
        res.setHeader('Cache-Control', 'no-cache')
        res.end(data)
      })
      .catch(() => next())
  }

  return {
    name: 'kuromoji-dictionary',
    configureServer(server) {
      server.middlewares.use(serveDict)
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveDict)
    },
  }
}

const apiProxy = {
  '/api': {
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [svelte(), kuromojiDictionary()],
  publicDir: 'static',
  // The ngrok hostname changes on every restart, so allow any tunnel host.
  server: {
    allowedHosts: true,
    proxy: apiProxy,
  },
  preview: {
    allowedHosts: true,
    proxy: apiProxy,
  },
  resolve: {
    alias: {
      // Use kuromoji's browser bundle so Vite does not externalize `path`.
      kuromoji: fileURLToPath(
        new URL('./node_modules/kuromoji/build/kuromoji.js', import.meta.url),
      ),
    },
  },
})
