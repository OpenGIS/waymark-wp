<script setup lang="ts">
interface CaptionTrack {
  src: string;
  srclang: string;
  label: string;
  default?: boolean;
}

const props = withDefaults(
  defineProps<{
    src: string;
    poster?: string;
    caption?: string;
    label?: string;
    captions?: string | CaptionTrack[];
    width?: number | string;
    height?: number | string;
  }>(),
  {
    poster: undefined,
    caption: undefined,
    label: undefined,
    captions: undefined,
    width: undefined,
    height: undefined,
  },
);

const resolvedSrc = computed(() => withAssetBase(props.src));
const resolvedPoster = computed(() =>
  props.poster ? withAssetBase(props.poster) : undefined,
);

const resolvedCaptions = computed<CaptionTrack[]>(() => {
  if (!props.captions) {
    return [];
  }

  if (typeof props.captions === "string") {
    return [
      {
        src: withAssetBase(props.captions),
        srclang: "en",
        label: "English",
        default: true,
      },
    ];
  }

  return props.captions.map((track) => ({
    ...track,
    src: withAssetBase(track.src),
  }));
});
</script>

<template>
  <figure class="video-figure">
    <video
      controls
      playsinline
      preload="metadata"
      :poster="resolvedPoster"
      :width="width"
      :height="height"
      :aria-label="label || caption || undefined"
    >
      <source :src="resolvedSrc" type="video/mp4" />
      <track
        v-for="track in resolvedCaptions"
        :key="track.src"
        kind="captions"
        :src="track.src"
        :srclang="track.srclang"
        :label="track.label"
        :default="track.default"
      />
      Your browser doesn't support HTML video.
      <a :href="resolvedSrc">Download the video</a>.
    </video>
    <figcaption v-if="caption || $slots.default">
      <slot>{{ caption }}</slot>
    </figcaption>
  </figure>
</template>
