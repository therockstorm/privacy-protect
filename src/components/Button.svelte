<script lang="ts">
  export let variant: "primary" | "secondary" = "primary";
  export let loading = false;
</script>

<button
  class={`${
    variant === "primary"
      ? "bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-600 text-white"
      : "bg-emerald-100 hover:bg-emerald-200 disabled:bg-gray-100 text-emerald-800 disabled:text-gray-700"
  } ${
    loading ? "animate-pulse" : ""
  } inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed`}
  on:click
  type="button"
  {...$$restProps}
>
  <slot />
</button>
