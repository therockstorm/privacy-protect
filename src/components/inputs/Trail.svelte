<script lang="ts">
  export let ariaLabel = "";
</script>

<button
  aria-label={ariaLabel}
  class="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus-within:z-10"
  on:click
  type="button"
>
  <slot />
</button>
