/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{svelte,ts}"],
  theme: {
    extend: {
      typography: () => ({
        // For default styles, see https://github.com/tailwindlabs/tailwindcss-typography/blob/master/src/styles.js
        DEFAULT: {
          css: {
            a: {
              textDecoration: "none",
            },
            blockquote: {
              fontWeight: "normal",
            },
            "blockquote p:first-of-type::before": {
              content: "none",
            },
            "blockquote p:last-of-type::after": {
              content: "none",
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
