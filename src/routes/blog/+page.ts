import type { PageLoad } from "./$types.js";

export const load = (async ({ fetch }) => {
  const posts = await (await fetch(`/api/posts`)).json();

  return { posts };
}) satisfies PageLoad;
