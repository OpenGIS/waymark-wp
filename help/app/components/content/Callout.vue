<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: "info" | "warning";
    title?: string;
  }>(),
  {
    type: "info",
    title: undefined,
  },
);
</script>

<template>
  <aside class="callout" :class="`callout--${type}`" role="note">
    <p v-if="title" class="callout__title">{{ title }}</p>
    <div class="callout__body">
      <slot />
    </div>
  </aside>
</template>
