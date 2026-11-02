<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  href?: string;
}>();

const isInternal = computed(() => {
  const href = props.href ?? "";

  return href.startsWith("/") && !href.startsWith("//");
});
</script>

<template>
  <NuxtLink v-if="isInternal" :to="props.href ?? ''" v-bind="$attrs">
    <slot />
  </NuxtLink>
  <a v-else :href="props.href" v-bind="$attrs">
    <slot />
  </a>
</template>
