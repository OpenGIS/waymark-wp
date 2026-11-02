<script setup lang="ts">
const baseURL = useRuntimeConfig().app.baseURL;
const route = useRoute();

const navRef = ref<HTMLElement | null>(null);
const activeLinkRef = ref<HTMLElement | null>(null);

const navItems = [
  { label: "Home", to: "/" },
  { label: "Tutorials", to: "/tutorials/" },
  { label: "Customising", to: "/customising/" },
  { label: "Features", to: "/features/" },
  { label: "Examples", to: "/examples/" },
  { label: "Advanced", to: "/advanced/" },
];

const currentPath = computed(() => {
  let path = route.path;

  if (baseURL !== "/" && path.startsWith(baseURL)) {
    path = path.slice(baseURL.length - 1);
  }

  return path.replace(/\/+$/, "") || "/";
});

function isActive(target: string) {
  const normalised = target === "/" ? "/" : target.replace(/\/+$/, "");

  if (normalised === "/") {
    return currentPath.value === "/";
  }

  return (
    currentPath.value === normalised ||
    currentPath.value.startsWith(`${normalised}/`)
  );
}

function setActiveLinkRef(el: unknown, active: boolean) {
  if (!active) {
    return;
  }

  const element =
    el instanceof HTMLElement ? el : (el as { $el?: unknown } | null)?.$el;

  if (element instanceof HTMLElement) {
    activeLinkRef.value = element;
  }
}

async function scrollActiveIntoView() {
  await nextTick();

  const nav = navRef.value;

  if (!nav) {
    return;
  }

  const active =
    activeLinkRef.value ??
    nav.querySelector<HTMLElement>(".site-nav__link--active");

  if (!active || nav.scrollWidth <= nav.clientWidth) {
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  const target =
    nav.scrollLeft +
    (activeRect.left - navRect.left) -
    (nav.clientWidth - activeRect.width) / 2;
  const maxScroll = nav.scrollWidth - nav.clientWidth;

  nav.scrollTo({
    left: Math.min(Math.max(target, 0), maxScroll),
    behavior: "smooth",
  });
}

onMounted(() => {
  scrollActiveIntoView();
});

watch(
  () => route.path,
  () => {
    scrollActiveIntoView();
  },
  { flush: "post" },
);
</script>

<template>
  <nav class="site-nav" aria-label="Primary">
    <div ref="navRef" class="site-nav__inner">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :ref="(el) => setActiveLinkRef(el, isActive(item.to))"
        class="site-nav__link"
        :class="{ 'site-nav__link--active': isActive(item.to) }"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        {{ item.label }}
      </NuxtLink>
    </div>
  </nav>
</template>
