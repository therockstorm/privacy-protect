<script lang="ts">
  import Prose from "$components/Prose.svelte";
  import { SITE_TITLE, SITE_URL } from "$lib/seo.js";

  const title = "Privacy and Terms";
  const fullTitle = `${title} - ${SITE_TITLE}`;
  const desc =
    "Privacy policy and terms of service. Securely share passwords and sensitive files over email or store them in insecure locations like cloud drives.";
  const url = `${SITE_URL}/privacy-and-terms`;
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
    <h1>Privacy policy and Terms of service</h1>
    <h2>Privacy policy</h2>
    <small>Updated 2023-01-25</small>
    <p>
      PrivacyProtect uses{" "}
      <a href="https://plausible.io/privacy-focused-web-analytics">
        Plausible
      </a>{" "}
      for privacy-focused website usage. We don
      {"'"}t collect or track anything else. Privacy is important.
    </p>
    <h2>Terms of service</h2>
    <small>Updated 2023-01-25</small>
    <p>
      Please read these terms of service ("terms") carefully before using
      privacyprotect.dev ("website", "service") operated by Rocky Warren ("us",
      "we", "our").
    </p>

    <h3>Conditions of use</h3>
    <p>
      By using this website, you certify that you have read and reviewed this
      Agreement and that you agree to comply with its terms. If you do not want
      to be bound by the terms of this Agreement, you are advised to leave the
      website accordingly. We only grant use and access of this website, its
      products, and its services to those who have accepted its terms.
    </p>
    <h3>Privacy policy</h3>
    <p>
      Before you continue using our website, we advise you to read our <a
        href={url}>privacy policy</a
      >.
    </p>

    <h3>Age restriction</h3>
    <p>
      You must be at least 18 (eighteen) years of age before to use this
      website. By using this website, you warrant that you are at least 18 years
      of age and you may legally adhere to this Agreement. We assume no
      responsibility for liabilities related to age misrepresentation.
    </p>

    <h3>Intellectual property</h3>
    <p>
      You agree that all materials, products, and services provided on this
      website are the property of us, our affiliates, directors, officers,
      employees, agents, suppliers, or licensors including all copyrights, trade
      secrets, trademarks, patents, and other intellectual property. You also
      agree that you will not reproduce or redistribute our intellectual
      property in any way, including electronic, digital, or new trademark
      registrations.
    </p>

    <h3>Private information</h3>
    <p>
      You are responsible for maintaining the safety and security of your
      information.
    </p>
    <p>
      We reserve all rights to terminate service, and edit or remove content in
      our sole discretion.
    </p>

    <h3>Applicable law</h3>
    <p>
      By visiting this website, you agree that the laws of the United States in
      the state of Colorado, without regard to principles of conflict laws, will
      govern these terms and conditions, or any dispute of any sort that might
      come between us and you, or our business partners and associates.
    </p>

    <h3>Disputes</h3>
    <p>
      Any dispute related in any way to your visit to this website shall be
      arbitrated by Colorado state or United States federal courts and you
      consent to exclusive jurisdiction and venue of such courts.
    </p>

    <h3>Indemnification</h3>
    <p>
      You agree to indemnify us and our affiliates and hold us harmless against
      legal claims and demands that may arise from your use or misuse of our
      services. We reserve the right to select our own legal counsel.
    </p>

    <h3>Limitation on liability</h3>
    <p>
      We are not liable for any damages that may occur to you as a result of
      your misuse of our website. We reserve the right to edit, modify, and
      change this Agreement any time. We shall let our users know of these
      changes through electronic mail. This Agreement is an understanding
      between us and the user, and this supersedes and replaces all prior
      agreements regarding the use of this website.
    </p>
  </Prose>
</main>
