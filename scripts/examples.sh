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

  ./cli.ts encrypt -m "$message" --hint "$hint" ./static/example-message.html -p $password
  ./cli.ts encrypt -f ./scripts/example.gif --hint "$hint" ./static/example-image.html -p $password
}

generate
