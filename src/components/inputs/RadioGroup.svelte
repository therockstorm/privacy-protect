<script lang="ts">
  import { toId } from "$lib/mappers.js";

  export let label: string;
  export let group: string;
  export let values: readonly string[] = [];

  const id = toId({ component: "radio", label, other: "group" });

  function toRadioId(v: string) {
    return toId({ component: "radio", label: v });
  }
</script>

<div>
  <label for={id}>{label}</label>
  <fieldset {id} class="mt-4">
    <legend class="sr-only">{label}</legend>
    <div class="space-y-4 flex items-center space-y-0 space-x-10">
      {#each values as v (v)}
        <div class="flex items-center">
          <input
            checked={v === group}
            class="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
            bind:group
            id={toRadioId(v)}
            name={id}
            type="radio"
            value={v}
            {...$$restProps}
          />
          <label
            for={toRadioId(v)}
            class="ml-3 block text-sm font-medium text-gray-700">{v}</label
          >
        </div>
      {/each}
    </div>
  </fieldset>
</div>
