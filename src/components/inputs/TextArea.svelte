<script lang="ts">
  import { toId } from "$lib/mappers.js";

  export let error = "";
  export let hideLabel = false;
  export let label: string;
  export let value: string | undefined;

  const id = toId({ component: "textarea", label });
  const errorId = `${id}-error`;
  const labelClass = hideLabel ? "sr-only" : "";
  $: isError = Boolean(error);
</script>

<div>
  <label class={labelClass} for={id}>{label}</label>
  <div class="mt-1">
    <textarea
      aria-invalid={isError}
      aria-describedby={isError ? errorId : undefined}
      class={`input-${
        isError ? "error" : "border"
      } block w-full rounded-md text-sm resize-none`}
      {id}
      name={id}
      rows="4"
      bind:value
      {...$$restProps}
    />
  </div>

  {#if isError}
    <p class="mt-2 text-sm text-red-600" id={errorId}>
      {error}
    </p>
  {/if}
</div>
