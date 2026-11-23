import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// Espelha o transform de Markdown bruto do vite.config.js nos imports SSR ?import.
// Restrito ao conteudo editorial do blog, sem alterar o build de producao.
const blogMarkdownRawPlugin = {
  name: "blog-markdown-raw-for-vitest",
  enforce: "pre",
  transform(code, id) {
    const pathname = id.replaceAll("\\", "/");
    if (pathname.includes("/src/content/blog/") && /\.md(?:\?import)?$/.test(pathname)) {
      return { code: `export default ${JSON.stringify(code)};`, map: null };
    }
    return null;
  },
};

export default defineConfig({
  plugins: [blogMarkdownRawPlugin, react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
    // JSDOM-heavy suites contend heavily on this repository with unrestricted parallelism.
    // Keep a small worker pool so release checks remain stable without relaxing assertions/timeouts.
    maxWorkers: 2,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "vitest.setup.js"],
    },
    include: ["src/**/*.{test,spec}.{js,jsx}"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
