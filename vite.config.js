import svg from "@poppanator/sveltekit-svg";
import { sveltekit } from "@sveltejs/kit/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    basicSsl(),
    sveltekit(),
    svg({ includePaths: ["src/assets/icons/", "src/images/icons/"] }),
  ],
  test: { include: ["src/**/*.{test,spec}.{js,ts}"] },
};

export default config;
