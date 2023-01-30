/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/assets/template.html"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
