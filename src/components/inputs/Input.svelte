<script lang="ts">
  import { toId } from "$lib/mappers.js";

  export let error = "";
  export let label: string;
  export let type = "text";
  export let value: string | null;

  function onInput(
    e: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    value = e.currentTarget?.value;
  }

  const id = toId({ component: "input", label, other: type });
  const errorId = `${id}-error`;
  const optionalId = `${id}-optional`;
  $: isError = Boolean(error);
</script>

<div>
  <div class="flex justify-between">
    <label for={id}>{label}</label>
    {#if $$restProps.required !== true}
      <span class="text-sm text-gray-500" id={optionalId}>Optional</span>
    {/if}
  </div>
  <div class="mt-1 flex rounded-md">
    <slot name="lead" />
    <input
      aria-invalid={isError}
      aria-describedby={isError ? errorId : undefined}
      class={`input-${isError ? "error" : "border"} ${
        $$slots.lead && $$slots.trail
          ? ""
          : $$slots.lead
          ? "rounded-r-md"
          : $$slots.trail
          ? "rounded-l-md"
          : "rounded-md"
      } flex-1 text-sm z-10`}
      {id}
      name={id}
      on:input={(e) => onInput(e)}
      {type}
      {value}
      {...$$restProps}
    />
    <slot name="trail" />
  </div>

  {#if isError}
    <p class="mt-2 text-sm text-red-600" id={errorId}>
      {error}
    </p>
  {/if}
</div>
