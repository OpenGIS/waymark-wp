<script setup lang="ts">
defineProps<{
  items: Array<{ title: string; path: string }>;
}>();
</script>

<template>
  <nav v-if="items.length" class="breadcrumb" aria-label="Breadcrumb">
    <ol class="breadcrumb__list">
      <li
        v-for="(item, index) in items"
        :key="item.path"
        class="breadcrumb__item"
      >
        <NuxtLink
          v-if="index < items.length - 1"
          :to="withPageTrailingSlash(item.path)"
        >
          {{ item.title }}
        </NuxtLink>
        <span v-else aria-current="page">{{ item.title }}</span>
        <span
          v-if="index < items.length - 1"
          class="breadcrumb__sep"
          aria-hidden="true"
          >/</span
        >
      </li>
    </ol>
  </nav>
</template>
