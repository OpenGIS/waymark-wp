<script setup lang="ts">
interface TocLink {
  id: string;
  text: string;
  depth: number;
  children?: TocLink[];
}

const props = defineProps<{
  links: TocLink[];
}>();

interface FlatLink extends TocLink {
  level: number;
}

const flatLinks = computed<FlatLink[]>(() => {
  const flatten = (links: TocLink[], level = 0): FlatLink[] =>
    links.flatMap((link) => [
      { ...link, level },
      ...flatten(link.children ?? [], level + 1),
    ]);

  return flatten(props.links);
});

const activeId = ref("");
let observer: IntersectionObserver | null = null;

function disconnectObserver() {
  observer?.disconnect();
  observer = null;
}

function setupObserver() {
  disconnectObserver();

  if (!flatLinks.value.length) {
    activeId.value = "";
    return;
  }

  const firstLink = flatLinks.value[0];

  if (firstLink) {
    activeId.value = firstLink.id;
  }

  if (typeof IntersectionObserver === "undefined") {
    return;
  }

  const headings = Array.from(
    document.querySelectorAll<HTMLElement>(
      ".docs-prose h2[id], .docs-prose h3[id]",
    ),
  );

  if (!headings.length) {
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length && visible[0]) {
        activeId.value = visible[0].target.id;
      }
    },
    {
      rootMargin: "-90px 0px -65% 0px",
      threshold: 0,
    },
  );

  headings.forEach((heading) => observer?.observe(heading));
}

onMounted(() => {
  setupObserver();
});

watch(
  () => props.links,
  async () => {
    await nextTick();
    setupObserver();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  disconnectObserver();
});
</script>

<template>
  <aside v-if="flatLinks.length" class="docs-outline">
    <nav aria-label="On this page">
      <p class="docs-outline__title">On this page</p>
      <ul class="docs-outline__list">
        <li
          v-for="link in flatLinks"
          :key="link.id"
          class="docs-outline__item"
          :class="`docs-outline__item--level-${link.level}`"
        >
          <a
            :href="`#${link.id}`"
            class="docs-outline__link"
            :class="{ 'docs-outline__link--active': activeId === link.id }"
            :aria-current="activeId === link.id ? 'location' : undefined"
          >
            {{ link.text }}
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>
