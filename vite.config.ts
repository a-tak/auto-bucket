import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteStaticCopy } from "vite-plugin-static-copy"
import { resolve } from "path"

export default defineConfig({
  root: resolve(__dirname, "src"),
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "_locales", dest: "." },
        { src: "icons", dest: "." },
        { src: "manifest.json", dest: "." },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    modulePreload: false,
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background.ts"),
        popup: resolve(__dirname, "src/popup/popup.html"),
        options: resolve(__dirname, "src/options/options.html"),
        statistics: resolve(__dirname, "src/statistics/statistics.html"),
        logviewer: resolve(__dirname, "src/logviewer/logviewer.html"),
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
