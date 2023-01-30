<script lang="ts">
  import "../app.css";

  import Footer from "$components/Footer.svelte";
  import Header from "$components/Header.svelte";
</script>

<div class="mx-auto my-6 max-w-3xl overflow-x-hidden px-6">
  <Header />
  <slot />
  <Footer />
</div>
