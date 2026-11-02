<template>
  <h4 :id="props.id">
    <a
      v-if="props.id && generate"
      class="heading-anchor"
      :href="`#${props.id}`"
    >
      <slot />
    </a>
    <slot v-else />
  </h4>
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
      (typeof headings?.anchorLinks === "object" && headings?.anchorLinks?.h4)),
);
</script>
