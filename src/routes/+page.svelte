<script lang="ts">
  import Button from "$components/Button.svelte";
  import FileUpload from "$components/inputs/FileUpload.svelte";
  import Input from "$components/inputs/Input.svelte";
  import RadioGroup from "$components/inputs/RadioGroup.svelte";
  import TextArea from "$components/inputs/TextArea.svelte";
  import PasswordTrail from "$components/inputs/PasswordTrail.svelte";
  import Prose from "$components/Prose.svelte";
  import Well from "$components/Well.svelte";
  import { encrypt, ENCRYPTION_CONFIG } from "$lib/client/encrypt";
  import { SITE_TITLE, SITE_URL } from "$lib/client/seo";
  import { toUint8Array } from "$lib/client/to-array";

  import templateHtml from "../assets/template.html?raw";
  import templateStyle from "../assets/style.css?raw";

  const MAX_FILE_SIZE_MB = 100;
  const SECRET_TYPES = { message: "Message", file: "File" } as const;
  const secretTypes = Object.values(SECRET_TYPES);
  const title = "Securely share and store passwords and sensitive files.";
  const fullTitle = `${SITE_TITLE} - ${title}`;
  const desc =
    "Securely share secrets and WiFi passwords over text messages, send end-to-end encrypted emails, or store password-protected files on USB and cloud drives.";

  type ValidateInputReq<T> = Readonly<{
    lenient: boolean;
    match: boolean;
    name: string;
    val?: null | Readonly<{ length: number; [k: number]: T }>;
  }>;

  type Validator<T> = Pick<ValidateInputReq<T>, "lenient" | "val">;

  type Validated = Readonly<{
    fileExtension?: string;
    password: string;
    plainText: ArrayBufferView | ArrayBuffer;
  }>;

  type ValidateFormRes = boolean | Validated;

  let password: string | null = null;
  let passwordHint = "";
  let secretType = secretTypes[0];
  let message: string | undefined;
  let files: FileList | undefined;
  let dataUri: string | undefined;
  let showPassword = false;
  let loading = false;

  $: passwordError = validatePassword({ lenient: true, val: password });
  $: passwordType = showPassword ? "text" : "password";
  $: messageError = validateMessage({ lenient: true, val: message });
  $: fileError = validateFiles({ lenient: true, val: files });

  async function concealSecret(e: MouseEvent) {
    const validated = await validateForm();
    if (typeof validated === "boolean") return;

    e.preventDefault();
    loading = true;

    // Clear from previous download
    dataUri = undefined;
    dataUri =
      "data:application/octet-stream;base64," +
      btoa(
        templateHtml
          .replace(`    <link rel="stylesheet" href="./style.css" />`, "")
          .replace(
            "`{.CONFIG}`",
            JSON.stringify({
              ...ENCRYPTION_CONFIG,
              ...(await encryptBySecretType(validated)),
              passwordHint: passwordHint ?? "No hint provided.",
              secretType,
            })
          )
          .replace("/*{.STYLES}*/", templateStyle)
      );
    const downloadA = document.createElement("a");
    downloadA.setAttribute("download", "privacyprotect.secret.html");
    downloadA.setAttribute("href", dataUri);
    document.body.appendChild(downloadA);
    downloadA.click();
    document.body.removeChild(downloadA);

    loading = false;

    resetInputs();
  }

  async function validateForm(): Promise<ValidateFormRes> {
    const lenient = false;
    passwordError = validatePassword({ lenient, val: password });
    messageError = validateMessage({ lenient, val: message });
    fileError = validateFiles({ lenient, val: files });
    if (passwordError || fileError || messageError) return false;

    password = password ?? "";
    return secretType === SECRET_TYPES.file && files != null
      ? {
          fileExtension: files[0].name.split(".").pop(),
          password,
          plainText: await files[0].arrayBuffer(),
        }
      : { password, plainText: toUint8Array(message) };
  }

  async function encryptBySecretType({ password, plainText }: Validated) {
    if (secretType === SECRET_TYPES.file && files != null) {
      const file = files[0];
      return {
        ...(await encrypt({ password, plainText })),
        fileExtension: file.name.split(".").pop(),
      };
    } else return encrypt({ password, plainText });
  }

  function validatePassword({ lenient, val }: Validator<string>) {
    return validateInput({ lenient, match: true, name: "Password", val });
  }

  function validateMessage({ lenient, val }: Validator<string>) {
    return validateInput({
      lenient,
      match: secretType === SECRET_TYPES.message,
      name: "Message",
      val,
    });
  }

  function validateFiles({ lenient, val }: Validator<File>) {
    const name = "File";
    const res = validateInput({
      lenient,
      match: secretType === SECRET_TYPES.file,
      name,
      val,
    });
    if (res) return res;

    const sizeMb = val != null && val[0].size / 1024 / 1024;
    return sizeMb > MAX_FILE_SIZE_MB
      ? `${name} larger than ${MAX_FILE_SIZE_MB}MB limit.`
      : undefined;
  }

  function validateInput<T>({
    lenient,
    name,
    match,
    val,
  }: ValidateInputReq<T>) {
    if (!match || (lenient && val == null)) return undefined;
    return val == null || val.length < 1 ? `${name} required.` : undefined;
  }

  function resetInputs() {
    files = undefined;
    message = undefined;
    password = null;
    passwordHint = "";
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
      <a
        href="https://www.rocky.dev/blog/introducing-privacyprotect?utm_source=privacyprotect&utm_medium=web&utm_campaign=blog&utm_content=header"
        >launch blog</a
      > for details.
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
