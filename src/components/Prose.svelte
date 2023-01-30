<script lang="ts">
  export let className = "";
</script>

<div
  class={`prose prose-emerald max-w-none prose-a:no-underline prose-a:text-emerald-700 hover:prose-a:text-emerald-800 ${className}`}
>
  <slot />
</div>
