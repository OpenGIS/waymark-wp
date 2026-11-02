<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src: string;
    srcset?: string;
    alt?: string;
    caption?: string;
    width?: number | string;
    height?: number | string;
    sizes?: string;
    loading?: "lazy" | "eager";
  }>(),
  {
    srcset: undefined,
    alt: "",
    caption: undefined,
    width: undefined,
    height: undefined,
    sizes: undefined,
    loading: "lazy",
  },
);

const resolvedSrc = computed(() => withAssetBase(props.src));

const resolvedSrcset = computed(() => {
  if (!props.srcset) {
    return undefined;
  }

  return props.srcset
    .split(",")
    .map((candidate) => candidate.trim())
    .filter(Boolean)
    .map((candidate) => {
      const [url, ...descriptor] = candidate.split(/\s+/);

      return [withAssetBase(url), ...descriptor].join(" ");
    })
    .join(", ");
});
</script>

<template>
  <figure>
    <img
      :src="resolvedSrc"
      :srcset="resolvedSrcset"
      :alt="alt"
      :width="width"
      :height="height"
      :sizes="sizes"
      :loading="loading"
    />
    <figcaption v-if="caption || $slots.default">
      <slot>{{ caption }}</slot>
    </figcaption>
  </figure>
</template>
