<script lang="ts">
  import CloudArrowUp from "$icons/cloud-arrow-up-thin.svg?component";

  export let error = "";
  export let files: FileList | undefined;
  export let maxSizeMb: number;

  const id = "file-upload";
  const errorId = `${id}-error`;
  $: isError = Boolean(error);
  $: msg = files ? files[0].name : `Up to ${maxSizeMb}MB`;
</script>

<div>
  <div
    class={`${
      isError ? "border-red-300" : "border-gray-300"
    } flex justify-center rounded-md border-2 border-dashed py-3`}
  >
    <div class="space-y-1 text-center self-center">
      <CloudArrowUp class="-m-[1px] mx-auto h-7 w-7 text-gray-400" />
      <div class="flex text-sm text-gray-600">
        <label
          for={id}
          class="relative cursor-pointer rounded-md font-medium text-emerald-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 hover:text-emerald-500"
        >
          Click to upload a file
          <input
            aria-invalid={isError}
            aria-describedby={isError ? errorId : undefined}
            class="sr-only"
            bind:files
            {id}
            name={id}
            type="file"
            {...$$restProps}
          />
        </label>
      </div>
      <p class="text-xs text-gray-500">{msg}</p>
    </div>
  </div>

  {#if isError}
    <p class="mt-2 text-sm text-red-600" id={errorId}>
      {error}
    </p>
  {/if}
</div>
