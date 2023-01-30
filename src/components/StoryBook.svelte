<script lang="ts">
  import Button from "$components/Button.svelte";
  import FileUpload from "$components/inputs/FileUpload.svelte";
  import Input from "$components/inputs/Input.svelte";
  import Lead from "$components/inputs/Lead.svelte";
  import RadioGroup from "$components/inputs/RadioGroup.svelte";
  import TextArea from "$components/inputs/TextArea.svelte";
  import Trail from "$components/inputs/Trail.svelte";

  const error = "Item must be at least 4 characters.";
  const values = ["A", "B", "C"];
</script>

<div class="space-y-8 mb-4">
  <div class="space-y-4">
    <h1 class="font-medium text-2xl mb-4">Input</h1>
    <Input label="Default" value="" />
    <Input label="Required" required value="" />
    <Input label="Lead" value="">
      <Lead slot="lead">L</Lead>
    </Input>
    <Input label="Trail" value="">
      <Trail slot="trail">T</Trail>
    </Input>
    <Input label="Lead & Trail" value="">
      <Lead slot="lead">L</Lead>
      <Trail slot="trail">T</Trail>
    </Input>
  </div>

  <div class="space-y-4">
    <h1 class="font-medium text-2xl my-4">Input with error</h1>
    <Input {error} label="Default" value="" />
    <Input {error} label="Required" required value="" />
    <Input {error} label="Lead" value="">
      <Lead slot="lead">L</Lead>
    </Input>
    <Input {error} label="Trail" value="">
      <Trail slot="trail">T</Trail>
    </Input>
    <Input {error} label="Lead & Trail" value="">
      <Lead slot="lead">L</Lead>
      <Trail slot="trail">T</Trail>
    </Input>
  </div>

  <div class="space-y-4">
    <h1 class="font-medium text-2xl my-4">Radio group</h1>
    <RadioGroup group={values[1]} label="Default" {values} />
  </div>

  <div class="space-y-4">
    <h1 class="font-medium text-2xl my-4">Text area</h1>
    <TextArea label="Default" value="" />
    <TextArea {error} label="With error" value="" />
  </div>

  <div class="space-y-4">
    <h1 class="font-medium text-2xl my-4">File upload</h1>
    <FileUpload files={undefined} maxSizeMb={1} />
    <FileUpload {error} files={undefined} maxSizeMb={1} />
    <FileUpload files={undefined} maxSizeMb={123} />
  </div>

  <div class="space-y-4">
    <h1 class="font-medium text-2xl my-4">Button</h1>
    <Button>Primary</Button>
    <Button disabled>Primary disabled</Button>
    <Button variant="secondary">Secondary</Button>
    <Button disabled variant="secondary">Secondary disabled</Button>
  </div>
</div>
