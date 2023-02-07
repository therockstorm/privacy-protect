<script lang="ts">
  export let alt = "";
  export let caption = "";
  export let small = false;
  export let src: string;
</script>

<div class={small ? "flex justify-center text-center" : ""}>
  <figure class={small ? "max-w-xs" : ""}>
    <img alt={alt || caption} {src} />
    {#if caption}
      <figcaption>{caption}</figcaption>
    {/if}
  </figure>
</div>
