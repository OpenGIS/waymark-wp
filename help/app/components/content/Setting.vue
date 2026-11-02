<script setup lang="ts">
defineProps<{
  title: string;
  type?: string;
  default?: string;
}>();
</script>

<template>
  <div class="setting">
    <dt class="setting__title">{{ title }}</dt>
    <dd class="setting__detail">
      <p class="setting__facts">
        <span v-if="type" class="setting__fact">
          <span class="setting__label">Type</span>
          <code>{{ type }}</code>
        </span>
        <span v-if="default" class="setting__fact">
          <span class="setting__label">Default</span>
          <span>{{ default }}</span>
        </span>
      </p>
      <div class="setting__tip">
        <slot />
      </div>
    </dd>
  </div>
</template>
