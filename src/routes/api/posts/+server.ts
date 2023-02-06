import { json } from "@sveltejs/kit";

import { getPosts } from "$lib/posts.js";

export const GET = async () => {
  return json(await getPosts());
};
