<div class="overflow-hidden rounded-lg bg-white shadow hover:bg-gray-50">
  {#if $$slots.header}
    <div class="px-4 py-5 sm:px-6">
      <slot name="header" />
    </div>
  {/if}
  <div class="px-4 sm:px-6">
    <slot />
  </div>
  {#if $$slots.footer}
    <div class="px-4 py-5 sm:px-6">
      <slot name="footer" />
    </div>
  {/if}
</div>
