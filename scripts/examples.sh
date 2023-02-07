#!/usr/bin/env bash

generate () {
  read -r -d '' hint <<- EOM
    Three letters, all lowercase: an animal, commonly a pet, that barks.

(Please use stronger passwords for your secrets!)
EOM
  read -r -d '' message <<- EOM
    I asked ChatGPT, an AI chat bot, for a profound sentence. Here's the result:
"The only true wisdom is in knowing you know nothing." - Socrates
EOM
  password="dog"
  message_path="./static/example-message.html"
  image_path="./static/example-image.html"
  out_path="./privacyprotect.gif"

  ./cli.ts encrypt -m "$message" --hint "$hint" $message_path -p $password
  sed -i '' 's|<!-- CANONICAL -->|<meta property="og:url" content="https://www.privacyprotect.dev/example-message.html" />\n    <link rel="canonical" href="https://www.privacyprotect.dev/example-message.html" />|' $message_path
  ./cli.ts encrypt -f ./scripts/example.gif --hint "$hint" $image_path -p $password
  sed -i '' 's|<!-- CANONICAL -->|<meta property="og:url" content="https://www.privacyprotect.dev/example-image.html" />\n    <link rel="canonical" href="https://www.privacyprotect.dev/example-image.html" />|' $image_path

  ./cli.ts decrypt $message_path -p $password
  ./cli.ts decrypt $image_path -p $password

  open $out_path
  sleep 1
  rm $out_path
}

generate
