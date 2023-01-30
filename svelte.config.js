import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/kit/vite";
import { resolve } from "path";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: adapter(),
    alias: {
      $components: resolve("src/components"),
      $icons: resolve("src/assets/icons"),
    },
    csp: {
      directives: {
        "base-uri": ["none"],
        "default-src": ["self"],
        "frame-ancestors": ["none"],
        "img-src": ["self", "data:"],
        "object-src": ["none"],
        // See https://github.com/sveltejs/svelte/issues/6662
        "style-src": ["self", "unsafe-inline"],
        "upgrade-insecure-requests": true,
        "worker-src": ["none"],
      },
      mode: "auto",
    },
  },
  preprocess: vitePreprocess(),
};
