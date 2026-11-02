<template>
  <h3 :id="props.id">
    <a
      v-if="props.id && generate"
      class="heading-anchor"
      :href="`#${props.id}`"
    >
      <slot />
    </a>
    <slot v-else />
  </h3>
</template>

<script setup>
import { computed, useRuntimeConfig } from "#imports";

const props = defineProps({
  id: { type: String, required: false },
});
const { headings } = useRuntimeConfig().public.mdc;
const generate = computed(
  () =>
    props.id &&
    ((typeof headings?.anchorLinks === "boolean" &&
      headings?.anchorLinks === true) ||
      (typeof headings?.anchorLinks === "object" && headings?.anchorLinks?.h3)),
);
</script>
