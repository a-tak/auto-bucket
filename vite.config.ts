import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { resolve } from "node:path"

// Emit only the extension's fixed resource paths; no glob parser or extra watcher.
function extensionAssets(): Plugin {
  return {
    name: "autobucket-extension-assets",
    apply: "build",
    buildStart() {
      const emit = (relativePath: string) => {
        const filePath = resolve(import.meta.dirname, "src", relativePath)
        this.addWatchFile(filePath)
        if (statSync(filePath).isDirectory()) {
          for (const name of readdirSync(filePath).sort()) {
            emit(`${relativePath}/${name}`)
          }
        } else {
          this.emitFile({
            type: "asset",
            fileName: relativePath,
            source: readFileSync(filePath),
          })
        }
      }
      for (const path of ["_locales", "icons", "manifest.json"]) emit(path)
    },
  }
}

export default defineConfig({
  root: resolve(import.meta.dirname, "src"),
  plugins: [react(), extensionAssets()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
  build: {
    // Thunderbird 122 uses Gecko 122; keep bundled syntax within that baseline.
    target: "firefox122",
    outDir: resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    modulePreload: false,
    rollupOptions: {
      input: {
        background: resolve(import.meta.dirname, "src/background.html"),
        popup: resolve(import.meta.dirname, "src/popup/popup.html"),
        options: resolve(import.meta.dirname, "src/options/options.html"),
        statistics: resolve(
          import.meta.dirname,
          "src/statistics/statistics.html",
        ),
        logviewer: resolve(import.meta.dirname, "src/logviewer/logviewer.html"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "background") return "background.js"
          return "assets/[name].js"
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
})
