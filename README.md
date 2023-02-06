[![PrivacyProtect](./static/og.png)](https://www.privacyprotect.dev/)

# End-to-end encryption without special software or accounts

[![Lighthouse Accessibility Badge](./results/lighthouse_accessibility.svg)](https://github.com/emazzotta/lighthouse-badges)
[![Lighthouse Best Practices Badge](./results/lighthouse_best-practices.svg)](https://github.com/emazzotta/lighthouse-badges)
[![Lighthouse Performance Badge](./results/lighthouse_performance.svg)](https://github.com/emazzotta/lighthouse-badges)
[![Lighthouse SEO Badge](./results/lighthouse_seo.svg)](https://github.com/emazzotta/lighthouse-badges) [![security headers](https://img.shields.io/security-headers?url=https%3A%2F%2Fwww.privacyprotect.dev%2F)](https://securityheaders.com/?q=https%3A%2F%2Fwww.privacyprotect.dev%2F&hide=on&followRedirects=on) [![SSL Rating](https://img.shields.io/badge/qualys%20ssl-A%2B-brightgreen)](https://www.ssllabs.com/ssltest/analyze.html?d=privacyprotect.dev) [![Ahrefs Health](https://img.shields.io/badge/ahrefs%20health-100-brightgreen)](https://ahrefs.com/site-audit) [![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme)

Securely share and store passwords and sensitive files using only web browser crypto APIs. Available at [privacyprotect.dev](https://www.privacyprotect.dev/?utm_source=github&utm_medium=social&utm_content=readme).

See the [launch blog](https://www.rocky.dev/blog/introducing-privacyprotect?utm_source=github&utm_medium=social&utm_campaign=blog&utm_content=readme) for details.

## Table of Contents

- [Security](#security)
- [Usage](#usage)
- [CLI](#cli)
- [Acknowledgements](#acknowledgements)
- [Contributing](#contributing)
- [License](#lincense)

## Security

See [SECURITY.md](./SECURITY.md) and [privacyprotect.dev/security](https://www.privacyprotect.dev/security).

## Usage

This project uses:

- [prettier](https://prettier.io/) code formatting
- [commitlint](https://github.com/conventional-changelog/commitlint) commit message formatting
- [ESLint](https://eslint.org/) rules

### Common commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev -- --open

# While editing template.html or template.ts, run watch mode to generate
# template.js and template.css
npm run watch:template
```

## CLI

### Encrypt

```bash
Usage: ./cli encrypt [OPTIONS] [--file OR --message] [OUT]

Encrypt a file or message, creating a PrivacyProtect HTML file.

Options:
  --help, -h        Print usage.

  --file, -f        Path to secret file to conceal.
  --hint            Password hint.
  --message, -m     Secret message to conceal.
  --password, -p    Password used to conceal your secret. Provided as a
                    convenience to allow for scripting. If not provided as an
                    option, the CLI will prompt for it and hide typed characters.
  --deniableMessage Secret message to conceal. If provided, the CLI will prompt
                    for a second password. Entering this password while under
                    duress will reveal the deniableMessage instead of the
                    --message or --file.

Examples:
  ./cli.ts encrypt -m "My secret" --hint "My hint" ./out/secret.html
```

### Decrypt

```bash
Usage: ./cli decrypt [OPTIONS] [FILE]

Decrypt a PrivacyProtect HTML file.

Options:
  --help, -h        Print usage.
  --file, -f        Path to PrivacyProtect HTML file containing secret to reveal.
  --password, -p    Password used to reveal your secret. Provided as a
                    convenience to allow for scripting. If not provided as an
                    option, the CLI will prompt for it and hide typed characters.

Examples:
  ./cli.ts decrypt ./out/secret.html
```

## Acknowledgements

[`portable-secrets`](https://mprimi.github.io/portable-secret/)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). If editing README, conform to [standard-readme](https://github.com/RichardLitt/standard-readme).

## License

[MIT](./LICENSE)
