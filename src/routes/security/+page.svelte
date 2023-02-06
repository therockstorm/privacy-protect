<script lang="ts">
  import Prose from "$components/Prose.svelte";
  import { SITE_TITLE, SITE_URL } from "$lib/seo.js";

  const title = "Security";
  const fullTitle = `${title} - ${SITE_TITLE}`;
  const desc =
    "Learn how PrivacyProtect approaches enterprise-grade security to protect user data.";
  const url = `${SITE_URL}/security`;
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={desc} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={desc} />
  <meta property="og:image" content={`${SITE_URL}/og.png`} />
  <meta property="og:image:alt" content={SITE_TITLE} />
  <meta property="og:url" content={url} />
</svelte:head>

<main>
  <Prose className="my-12">
    <h1>Enterprise-grade Security</h1>
    <p>
      Your secret is safe; <strong>it never leaves your device</strong>. No data
      transfers to or from PrivacyProtect servers after the initial page load.
      In fact, you can disable your internet connection, and concealing and
      revealing your secret still works.
    </p>
    <p>
      For encryption, PrivacyProtect uses native browser <a
        href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API"
        >W3C Web Cryptography APIs</a
      >
      with no external dependencies.
      <a
        href="https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey#parameters"
        >Argon2 doesn't have browser support</a
      >. So to derive a non-extractable 32-byte key from the entered password,
      PrivacyProtect uses PBKDF2 with 2,100,000 iterations, a 32-byte random
      salt, and the SHA-512 hash,
      <a
        href="https://soatok.blog/2022/12/29/what-we-do-in-the-etc-shadow-cryptography-with-passwords/"
        >as recommended here</a
      >. This iteration count is ten times the
      <a
        href="https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2"
        >OWASP-recommended</a
      >
      210,000. This is justified in light of the December 2022
      <a
        href="https://blog.lastpass.com/2022/12/notice-of-recent-security-incident/"
        >LastPass breach</a
      >.
    </p>
    <p>
      PrivacyProtect encrypts the plaintext using
      <a
        href="https://www.nist.gov/publications/advanced-encryption-standard-aes"
        >NIST-approved</a
      >
      AES-256 in
      <a href="https://csrc.nist.gov/publications/detail/sp/800-38d/final"
        >NIST-recommended</a
      >
      GCM block cipher mode using the derived key and a 32-byte random initialization
      vector. The HTML file contains the resulting ciphertext, initialization vector,
      and salt needed for decryption.
    </p>
    <p>
      The code is <a href="https://github.com/therockstorm/privacy-protect"
        >open-source</a
      >
      and available for inspection.
    </p>

    <p>
      If you have any questions, comments, or if you wish to report a potential
      security issue, please contact <a
        href="mailto:security@privacyprotect.dev">security@privacyprotect.dev</a
      >.
    </p>
  </Prose>
</main>
