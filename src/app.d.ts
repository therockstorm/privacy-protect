// See https://kit.svelte.dev/docs/types#app
declare namespace App {}

declare module "*.svg?component" {
  const content: ConstructorOfATypedSvelteComponent;
  export default content;
}
