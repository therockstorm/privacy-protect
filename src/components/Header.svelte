<script lang="ts">
  import Logo from "$icons/privacy-protect.svg?component";
  import { SITE_TITLE } from "$lib/seo.js";
</script>

<header class="my-4">
  <a href="/">
    <div class="flex gap-2 items-center">
      <Logo class="h-10 w-10" />
      <h1 class="font-medium text-3xl">{SITE_TITLE}</h1>
    </div>
  </a>
</header>
