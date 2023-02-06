<script lang="ts">
  import "../app.css";
  import "prismjs/themes/prism-okaidia.css";

  import Footer from "$components/Footer.svelte";
  import Header from "$components/Header.svelte";
</script>

<svelte:head>
  {#if import.meta.env.PROD}
    <script
      defer
      data-domain="privacyprotect.dev"
      data-api="/data/api/event"
      src="/data/js/script.js"
    ></script>
  {/if}
</svelte:head>

<div class="antialiased mx-auto my-6 max-w-3xl overflow-x-hidden px-6">
  <Header />
  <slot />
  <Footer />
</div>
