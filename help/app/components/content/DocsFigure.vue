<script setup lang="ts">
import Figure from "./Figure.vue";

defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <Figure v-bind="$attrs">
    <slot />
  </Figure>
</template>
