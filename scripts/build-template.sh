#!/usr/bin/env bash
set -Eeuo pipefail

function main() {
  npx tailwindcss \
    -c ./tailwind.template.config.cjs \
    -i ./src/app.css \
    -o ./src/assets/style.css \
    --minify

  local template="./src/assets/template.html"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's|<link rel="stylesheet" href="./style.css" />||g' $template
    sed -i '' -e '/\/\*{\.STYLES}\*\//{r ./src/assets/style.css' -e 'd' -e '}' $template
  else
    sed -i 's|<link rel="stylesheet" href="./style.css" />||g' $template
    sed -i -e '/\/\*{\.STYLES}\*\//{r ./src/assets/style.css' -e 'd' -e '}' $template
  fi
}

main
