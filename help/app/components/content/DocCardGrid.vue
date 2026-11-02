<script setup lang="ts">
import { docCards, type DocCardSection } from "~/data/docCards";

const props = defineProps<{
  section: DocCardSection;
}>();

const baseURL = useRuntimeConfig().app.baseURL;

const cards = computed(() => docCards[props.section]);

function imageSrc(image = "") {
  if (!image.startsWith("/")) {
    return image;
  }

  return `${baseURL.replace(/\/$/, "")}${image}`;
}
</script>

<template>
  <div class="tutorial-grid" :class="`tutorial-grid--${section}`">
    <NuxtLink
      v-for="card in cards"
      :key="card.href"
      class="tutorial-card"
      :to="card.href"
    >
      <img
        v-if="card.image"
        class="tutorial-card__image"
        :src="imageSrc(card.image)"
        alt=""
        width="640"
        height="360"
        loading="lazy"
        decoding="async"
        :style="{ objectPosition: card.imagePosition || 'center' }"
      />
      <span class="tutorial-card__body">
        <span class="tutorial-card__title">{{ card.title }}</span>
        <span class="tutorial-card__description">{{ card.description }}</span>
      </span>
    </NuxtLink>
  </div>
</template>
