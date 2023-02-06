<script>
  import Prose from "$components/Prose.svelte";
  import { formatDate } from "$lib/date";
  import { SITE_TITLE, SITE_URL } from "$lib/seo";

  export let date;
  export let description;
  export let images;
  export let slug;
  export let title;

  const fullTitle = `${title} - ${SITE_TITLE}`;
  const desc = description;
  const url = `${SITE_URL}/blog/${slug}`;
  const ogImage = images[0];
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={desc} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={desc} />
  <meta property="og:image" content={ogImage.url} />
  <meta property="og:image:alt" content={ogImage.alt} />
  <meta property="og:url" content={url} />
</svelte:head>

<article class="my-12">
  <header class="flex flex-col">
    <h1 class="mt-6 text-4xl text-zinc-800 sm:text-5xl">
      {title}
    </h1>
    <time class="order-first text-zinc-500" dateTime={date}>
      {formatDate(date)}
    </time>
  </header>
  <Prose className="mt-8">
    <slot />
  </Prose>
</article>
