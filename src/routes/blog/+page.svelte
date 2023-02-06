<script lang="ts">
  import Card from "$components/Card.svelte";
  import Prose from "$components/Prose.svelte";
  import { formatDate } from "$lib/date.js";
  import { SITE_TITLE, SITE_URL } from "$lib/seo.js";

  import type { PageData } from "./$types.js";

  export let data: PageData;

  const title = "Blog";
  const fullTitle = `${title} - ${SITE_TITLE}`;
  const desc = "Blog updates, stories, and announcements from PrivacyProtect.";
  const url = `${SITE_URL}/blog`;
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={desc} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={desc} />
  <meta property="og:image" content={`${SITE_URL}/og.png`} />
  <meta property="og:image:alt" content={SITE_TITLE} />
  <meta property="og:url" content={url} />
</svelte:head>

<main>
  <Prose className="my-12">
    <h1>Blog</h1>

    <div class="not-prose flex max-w-3xl flex-col space-y-16">
      {#each data.posts as post}
        <a href={post.path}>
          <Card>
            <h2
              class="text-base font-semibold tracking-tight text-zinc-800"
              slot="header"
            >
              {post.meta.title}
            </h2>
            <div class="text-sm text-zinc-600">
              {post.meta.description}
            </div>
            <div class="text-sm text-zinc-500" slot="footer">
              {formatDate(post.meta.date)}
            </div>
          </Card>
        </a>
      {/each}
    </div>
  </Prose>
</main>
