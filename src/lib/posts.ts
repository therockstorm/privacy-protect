type Meta = Readonly<{
  date: string;
  description: string;
  title: string;
}>;

export type Post = Readonly<{
  meta: Meta;
  path: string;
}>;

export async function getPosts(): Promise<Post[]> {
  const files = Object.entries(import.meta.glob("/src/routes/blog/**/*.md"));

  return (
    await Promise.all(
      files.map(async ([path, resolver]) => {
        const { metadata } = (await resolver()) as { metadata: Meta };
        return { meta: metadata, path: path.slice(11, -9) };
      })
    )
  ).sort(
    (a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime()
  );
}
