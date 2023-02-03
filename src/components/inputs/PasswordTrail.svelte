<script lang="ts">
  import Trail from "$components/inputs/Trail.svelte";
  import EyeSlash from "$icons/eye-slash-thin.svg?component";
  import Eye from "$icons/eye-thin.svg?component";

  export let showPassword = false;
</script>

<Trail ariaLabel="Password show/hide toggle" on:click>
  <Eye class={`h-4 w-4 ${showPassword ? "hidden" : ""}`} />
  <EyeSlash class={`h-4 w-4 ${showPassword ? "" : "hidden"}`} />
</Trail>
