<script setup lang="ts">
defineProps<{
  meta: Record<string, any>;
}>();

const baseURL = useRuntimeConfig().app.baseURL;

function withBase(html: string) {
  if (baseURL === "/") {
    return html;
  }

  return html.replace(
    /(href|src)="(\/(?!\/)[^"]*)"/g,
    (match, attribute, path) => {
      if (path.startsWith(baseURL)) {
        return match;
      }

      return `${attribute}="${baseURL}${path.slice(1)}"`;
    },
  );
}

function resolveSrcset(srcset?: string) {
  if (!srcset) {
    return undefined;
  }

  return srcset
    .split(",")
    .map((candidate) => candidate.trim())
    .filter(Boolean)
    .map((candidate) => {
      const [url, ...descriptor] = candidate.split(/\s+/);

      return [withAssetBase(url), ...descriptor].join(" ");
    })
    .join(", ");
}
</script>

<template>
  <header class="map-meta">
    <p class="map-meta__title">{{ meta.title }}</p>

    <div class="map-meta__body">
      <div v-if="meta.thumbnail" class="map-meta__thumbnail">
        <img
          :src="withAssetBase(meta.thumbnail.src)"
          :srcset="resolveSrcset(meta.thumbnail.srcset)"
          :sizes="meta.thumbnail.sizes"
          :width="meta.thumbnail.width"
          :height="meta.thumbnail.height"
          alt=""
          loading="lazy"
        />
      </div>

      <div class="map-meta__items">
        <div
          v-if="meta.description?.length"
          class="map-meta__item map-meta__description"
        >
          <p
            v-for="(paragraph, index) in meta.description"
            :key="index"
            :class="{ 'map-meta__lead': index === 0 }"
            v-html="withBase(paragraph)"
          />
        </div>

        <div v-if="meta.collection" class="map-meta__item">
          <p class="map-meta__label">Collection</p>
          <p class="map-meta__value">
            <a :href="meta.collection.href">{{ meta.collection.title }}</a>
          </p>
        </div>
      </div>
    </div>

    <details v-if="meta.journalEntry" class="map-meta__group">
      <summary>About</summary>
      <div class="map-meta__group-body">
        <p class="map-meta__label">Journal Entry</p>
        <div class="map-meta__rich" v-html="withBase(meta.journalEntry)" />
      </div>
    </details>

    <details
      v-if="meta.date || meta.distance || meta.moreDetails"
      class="map-meta__group"
    >
      <summary>Details</summary>
      <div class="map-meta__group-body">
        <dl v-if="meta.date || meta.distance" class="map-meta__facts">
          <div v-if="meta.date">
            <dt>Date</dt>
            <dd>{{ meta.date }}</dd>
          </div>
          <div v-if="meta.distance">
            <dt>Distance (km)</dt>
            <dd>{{ meta.distance }}</dd>
          </div>
        </dl>

        <div v-if="meta.moreDetails" class="map-meta__more">
          <p class="map-meta__label">More Details</p>
          <div class="map-meta__rich" v-html="withBase(meta.moreDetails)" />
        </div>
      </div>
    </details>
  </header>
</template>
