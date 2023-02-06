<script lang="ts">
  import Button from "$components/Button.svelte";
  import FileUpload from "$components/inputs/FileUpload.svelte";
  import Input from "$components/inputs/Input.svelte";
  import PasswordTrail from "$components/inputs/PasswordTrail.svelte";
  import RadioGroup from "$components/inputs/RadioGroup.svelte";
  import TextArea from "$components/inputs/TextArea.svelte";
  import Prose from "$components/Prose.svelte";
  import Well from "$components/Well.svelte";
  import {
    ENCRYPTION_CONFIG,
    SECRET_TYPES,
    secretTypes,
    type WithPassword,
    type WithPlainText,
  } from "$lib/constants.js";
  import { encryptBySecretType } from "$lib/encrypt.js";
  import { SITE_TITLE, SITE_URL } from "$lib/seo.js";
  import { getFileName, templateSecret } from "$lib/template-secret.js";
  import {
    MAX_FILE_SIZE_MB,
    validateFile,
    validateMessage,
    validatePassword,
  } from "$lib/validators.js";

  import css from "../assets/template.css?raw";
  import html from "../assets/template.html?raw";
  import js from "../assets/template.js?raw";

  const title = "Securely share and store passwords and sensitive files.";
  const fullTitle = `${SITE_TITLE} - ${title}`;
  const desc =
    "Securely share secrets and WiFi passwords over text messages, send end-to-end encrypted emails, or store password-protected files on USB and cloud drives.";

  type Validated = WithPassword &
    WithPlainText &
    Readonly<{ fileExtension?: string }>;

  type ValidateFormRes = boolean | Validated;

  let password: string | null = null;
  let passwordHint = "";
  let secretType = secretTypes[0];
  let message: string | undefined;
  let files: FileList | undefined;
  let showPassword = false;
  let loading = false;

  $: passwordError = validatePassword({
    lenient: true,
    secretType,
    val: password,
  });
  $: passwordType = showPassword ? "text" : "password";
  $: messageError = validateMessage({
    lenient: true,
    secretType,
    val: message,
  });
  $: fileError = validateFile({
    lenient: true,
    secretType,
    val:
      files != null
        ? { path: files[0].name, size: files[0].size }
        : { size: 0 },
  });

  async function concealSecret(e: MouseEvent) {
    const validated = await validateForm();
    if (typeof validated === "boolean") return;

    e.preventDefault();
    loading = true;

    const { keyLen } = ENCRYPTION_CONFIG;
    const args = { iv: random(keyLen), salt: random(keyLen), secretType };
    const payloads = await encryptBySecretType({
      payloads: [{ ...validated, ...args }],
      subtle: window.crypto.subtle,
    });
    downloadHtml(
      templateSecret({
        ...args,
        css,
        html,
        js,
        passwordHint,
        payloads,
      })
    );

    loading = false;
    resetInputs();
  }

  async function validateForm(): Promise<ValidateFormRes> {
    const lenient = false;
    fileError = validateFile({
      lenient,
      secretType,
      val:
        files != null
          ? { path: files[0].name, size: files[0].size }
          : { size: 0 },
    });
    messageError = validateMessage({ lenient, secretType, val: message });
    passwordError = validatePassword({ lenient, secretType, val: password });
    if (fileError || messageError || passwordError) return false;

    const pw = password ?? "";
    return secretType === SECRET_TYPES.file && files != null
      ? {
          fileExtension: files[0].name.split(".").pop(),
          password: pw,
          plainText: await files[0].arrayBuffer(),
        }
      : { password: pw, plainText: message ?? "" };
  }

  function downloadHtml(secretHtml: string) {
    const blob = new Blob([secretHtml], { type: "text/html" });
    const aEl = document.createElement("a");
    aEl.setAttribute("download", getFileName());
    aEl.setAttribute("href", window.URL.createObjectURL(blob));
    document.body.appendChild(aEl);
    aEl.click();
    document.body.removeChild(aEl);
  }

  function resetInputs() {
    files = undefined;
    message = undefined;
    password = null;
    passwordHint = "";
  }

  function random(length: number): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(length));
  }
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={desc} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={desc} />
  <meta property="og:image" content={`${SITE_URL}/og.png`} />
  <meta property="og:image:alt" content={SITE_TITLE} />
  <meta property="og:url" content={`${SITE_URL}/`} />
</svelte:head>

<main>
  <Prose className="mb-2">
    <p>
      Securely share passwords and sensitive files over email or store them in
      insecure locations like cloud drives. No special software or account—just
      a desktop or mobile web browser like Chrome or Safari. See the
      <a href="/blog/introducing-privacyprotect">launch blog</a> for details.
    </p>
    <p>
      Your secret is safe; <strong>it never leaves your device</strong>.
    </p>
    <details>
      <summary>Instructions</summary>
      <ol>
        <li>
          Enter your secret <strong>message</strong> or upload a
          <strong>file</strong> you want to protect.
        </li>
        <li>Create a <strong>password</strong>.</li>
        <li>
          Create an optional <strong>password hint</strong> to either help you remember
          the password or help the recipient guess it.
        </li>
        <li>
          Click <strong>Conceal and download secret</strong> to generate your protected
          HTML file and download it. Depending on your device's speed, it can take
          a few seconds.
        </li>
      </ol>

      To view the secret, the recipient (which may be you) will:
      <ol>
        <li><strong>Save</strong> the HTML file to their device.</li>
        <li><strong>Open</strong> it in a web browser.</li>
        <li>
          Enter the <strong>password</strong>. If the recipient cannot guess the
          password based on the hint, give them a call and let them know.
        </li>
        <li>Click <strong>Reveal secret</strong>.</li>
      </ol>
    </details>
  </Prose>

  <Well>
    <form>
      <div class="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
        <div class="sm:col-span-6">
          <RadioGroup
            bind:group={secretType}
            label="Secret type"
            values={secretTypes}
          />
          <div class="mt-6">
            {#if secretType === "File"}
              <FileUpload
                error={fileError}
                bind:files
                maxSizeMb={MAX_FILE_SIZE_MB}
              />
            {:else}
              <TextArea
                error={messageError}
                hideLabel
                label="Message text"
                required
                spellcheck="false"
                bind:value={message}
              />
            {/if}
          </div>
        </div>

        <div class="sm:col-span-6">
          <Input
            autocomplete="on"
            error={passwordError}
            label="Password"
            required
            spellcheck="false"
            bind:type={passwordType}
            bind:value={password}
          >
            <PasswordTrail
              on:click={() => (showPassword = !showPassword)}
              bind:showPassword
              slot="trail"
            />
          </Input>
        </div>

        <div class="sm:col-span-6">
          <TextArea
            bind:value={passwordHint}
            label="Password hint"
            spellcheck="false"
          />
        </div>
      </div>

      <div class="pt-5 flex justify-end">
        <Button disabled={loading} {loading} on:click={concealSecret}
          >Conceal and download secret</Button
        >
      </div>
    </form>
  </Well>
</main>
