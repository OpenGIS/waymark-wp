<script setup lang="ts">
defineProps<{
  prev?: { title: string; path: string } | null;
  next?: { title: string; path: string } | null;
}>();
</script>

<template>
  <nav v-if="prev || next" class="prev-next" aria-label="Pagination">
    <NuxtLink
      v-if="prev"
      :to="withPageTrailingSlash(prev.path)"
      class="prev-next__item prev-next__item--prev"
    >
      <span class="prev-next__label">Previous</span>
      <span class="prev-next__title">{{ prev.title }}</span>
    </NuxtLink>
    <span v-else class="prev-next__spacer" aria-hidden="true" />

    <NuxtLink
      v-if="next"
      :to="withPageTrailingSlash(next.path)"
      class="prev-next__item prev-next__item--next"
    >
      <span class="prev-next__label">Next</span>
      <span class="prev-next__title">{{ next.title }}</span>
    </NuxtLink>
    <span v-else class="prev-next__spacer" aria-hidden="true" />
  </nav>
</template>
