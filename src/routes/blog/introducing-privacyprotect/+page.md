---
title: "PrivacyProtect: Securely Share Passwords and Store Sensitive  Files in Convenient Locations"
date: "2023-02-09"
description: "Securely share secret passwords over text messages, send end-to-end encrypted emails, or store password-protected files on USB and cloud drives."
images:
  - alt: "PrivacyProtect: Securely share and store passwords and sensitive files."
    url: "https://www.privacyprotect.dev/og.png"
slug: "introducing-privacyprotect"
---

<script lang="ts">
import Figure from '$components/Figure.svelte'
import example from "./example.png";
</script>

My dad sent me a tax document as an email attachment.

Email is insecure. So are most messaging services.

Now Google (I use Gmail) and Microsoft (he uses Hotmail/Outlook) have my dad's juicy personal information stored; who knows where and for how long.

Why is sharing sensitive information hard?

The top three Google results for "send files securely" are:

1. Dropbox
1. A service called "Send Files Securely"
1. [A Wired article](https://www.wired.com/story/securely-share-files-online/) listing seven "best bets"

Dropbox and Send Files Securely aren't **end-to-end** (**E2E**) encrypted. Neither are five of the seven on Wired's list. Of the remaining two, Firefox Send doesn't exist anymore, and iCloud offers it, but only on the newest devices on an opt-in basis. It also disables access to iCloud.com by default and comes with [other caveats](https://support.apple.com/en-us/HT202303) that may discourage casual users.

E2E encryption is what we want for sensitive data. Encryption "in transit," "at rest," and/or "in storage" is great, but E2E encryption is better. Without it, there are periods when your data is readable, and many companies take this opportunity to do just that. This is how handy features like in-document search work.

But sometimes, we don't want Apple, Google, and the others snooping around. We have files or images for one person's eyes only. We want our private data left alone.

Most password managers let you do this. But I can't convince my dad (and other family members) to use one. Requiring an account to send files or one-off secrets is a small but genuine hurdle keeping people from doing the right thing.

So, when I heard about [Portable Secret](https://mprimi.github.io/portable-secret/), I smiled. A dead simple way to share and store passwords, files, and images. However, the creator, [Marco](https://www.mpri.me/), [has little time for upkeep](https://github.com/mprimi/portable-secret/discussions/29), and the security landscape changes fast.

[Enter PrivacyProtect](/). Share passwords and sensitive files over email or store them in insecure locations like cloud drives using nothing more than desktop or mobile web browsers like Chrome and Safari.

<Figure
  caption="PrivacyProtect: share and store passwords and sensitive files with end-to-end encryption."
  small
  src="/favicon.svg"
/>

No special software. No need to create an account. It's free, [open-source](https://github.com/therockstorm/privacy-protect), keeps your private data a secret, and leaves you alone.

It's so easy, my dad can use it.

## [Give it a try](/)

1. Enter your secret **message** or upload a **file** you want to protect.
1. Create a **password**.
1. Create an optional **password hint** to either help you remember the password or help the recipient guess it.
1. Click **Conceal and download secret** to generate your protected HTML file and download it. Depending on your device's speed, it can take a few seconds.

<Figure alt="PrivacyProtect example." src={example} />

And just like that, your secret is protected!

**Assuming you chose a strong password**, the downloaded file is safe to share over insecure channels like email or messaging services. To view the secret, the recipient (which may be you) will:

1. **Save** the HTML file to their device.
1. **Open** it in a web browser.
1. Enter the **password**. If the recipient cannot guess the password based on the hint, give them a call and let them know.
1. Click **Reveal secret**.

Here are examples of a PrivacyProtected [message](/example-message.html) and [image file](/example-image.html). Try "dog" for the password.

You can also safely store the HTML file in insecure locations like cloud drives (Dropbox, iCloud, Google Drive), host it like the examples above, or keep it on your computer, phone, or USB. Even if you lose your USB drive, the secret is unreadable by anyone that finds it.

## Use cases

PrivacyProtect is a complement, not a replacement, for password managers. We've discussed a few use cases above. Here are other ways to use it.

- Have you sent sensitive tax documents to your CPA or bought or sold a house that required sending countless PDFs over insecure email? Use PrivacyProtect to conceal them beforehand!
- Do you have a crypto wallet? Store your secret recovery phrase in a PrivacyProtected file with a strong password instead of on paper under your mattress.
- PrivacyProtect government-issued IDs and health records before uploading them to cloud storage to keep Big Tech at bay.
- It's possible to lose access to the device that generates your two-factor authentication (2FA) backup codes. It happened to me, and I'm locked out of my Dropbox account forever. Don't be like me. Store backup codes for things like your password manager and primary email account in multiple locations.
- PrivacyProtect works on any device with a web browser, whether borrowed, brand new, or in a public library. Keep PrivacyProtected files on a USB drive and access them anywhere without installing software.
- A non-obvious example: if your only goal is to keep Apple, Microsoft, etc., from reading your email or file, you could use a weak password like "123" and include the password itself in the hint. It still prevents their software from reading your file.
- Related to the above, have you ever been pickpocketed or lost your passport in a foreign country? My friend lost his. He spent the day in the U.S. Embassy, stressed out, proving his identity. One of the items listed as "evidence of U.S. citizenship" on [travel.state.gov](https://travel.state.gov/content/travel/en/international-travel/emergencies/lost-stolen-passport-abroad.html) is a photocopy of your missing passport. Skip (some of the) stress. Keep a PrivacyProtected file on your phone or host your document to access it in a pinch.

If you're short on time, you can skip the rest of this article and [start using PrivacyProtect](/) immediately; it's that simple! For those interested in details, read on.

## How it works

Your secret is safe; **it never leaves your device**. No data transfers to or from PrivacyProtect servers after the initial page load. In fact, you can disable your internet connection, and concealing and revealing your secret still works. PrivacyProtect doesn't know who you are, what you're sharing, or who you're sharing it with.

For encryption, PrivacyProtect uses native browser [W3C Web Cryptography APIs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) with no external dependencies. [Argon2 doesn't have browser support](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey#parameters). So to derive a non-extractable 32-byte key from the entered password, PrivacyProtect uses PBKDF2 with 2,100,000 iterations, a 32-byte random salt, and the SHA-512 hash, [as recommended here](https://soatok.blog/2022/12/29/what-we-do-in-the-etc-shadow-cryptography-with-passwords/). This iteration count is ten times the [OWASP-recommended](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2) 210,000. This is justified in light of the December 2022 [LastPass breach](https://blog.lastpass.com/2022/12/notice-of-recent-security-incident/).

PrivacyProtect encrypts the plaintext using [NIST-approved](https://www.nist.gov/publications/advanced-encryption-standard-aes) AES-256 in [NIST-recommended](https://csrc.nist.gov/publications/detail/sp/800-38d/final) GCM block cipher mode using the derived key and a 32-byte random initialization vector. The HTML file contains the resulting ciphertext, initialization vector, and salt needed for decryption.

PrivacyProtect improves on [Portable Secret](https://mprimi.github.io/portable-secret/), provides better protection than [password-protected archives](https://security.stackexchange.com/questions/35818/are-password-protected-zip-files-secure), and is free and [open-source](https://github.com/therockstorm/privacy-protect). [Give it a try](/); I'd love to hear your feedback!
