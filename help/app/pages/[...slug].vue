<script setup lang="ts">
import { findPageBreadcrumb } from "@nuxt/content/utils";

definePageMeta({
  layout: "docs",
});

const route = useRoute();
const baseURL = useRuntimeConfig().app.baseURL;

const contentPath = computed(() => {
  let path = route.path;

  if (baseURL !== "/" && path.startsWith(baseURL)) {
    path = path.slice(baseURL.length - 1);
  }

  path = path.replace(/\/+$/, "");

  return path === "" ? "/" : path;
});

function normalisePath(path: string) {
  const normalised = path.replace(/\/+$/, "");

  return normalised === "" ? "/" : normalised;
}

const showPrevNext = computed(() => {
  const segments = normalisePath(contentPath.value).split("/").filter(Boolean);

  return segments.length >= 2;
});

const { data: page } = await useAsyncData(
  `docs-page-${contentPath.value}`,
  () => queryCollection("docs").path(contentPath.value).first(),
);

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
}

const { data: navigation } = await useAsyncData("docs-navigation", () =>
  queryCollectionNavigation("docs"),
);

const { data: surroundings } = await useAsyncData(
  `docs-surroundings-${contentPath.value}`,
  () =>
    queryCollectionItemSurroundings("docs", contentPath.value, {
      before: 1,
      after: 1,
    }),
);

const breadcrumb = computed(() => {
  if (normalisePath(contentPath.value) === "/") {
    return [];
  }

  const items =
    findPageBreadcrumb(navigation.value ?? [], contentPath.value, {
      current: true,
    }) ?? [];

  if (
    items.length &&
    normalisePath(items[items.length - 1].path) ===
      normalisePath(contentPath.value)
  ) {
    return items[0]?.path === "/"
      ? items
      : [{ title: "Home", path: "/" }, ...items];
  }

  const withCurrent = [
    ...items,
    {
      title: page.value?.title ?? "",
      path: contentPath.value,
    },
  ];

  return withCurrent[0]?.path === "/"
    ? withCurrent
    : [{ title: "Home", path: "/" }, ...withCurrent];
});

const flatNavigation = computed(() => {
  const flat: Array<{ title: string; path: string }> = [];

  const walk = (items: any[]) => {
    items.forEach((item) => {
      if (item.path) {
        flat.push({ title: item.title, path: item.path });
      }

      if (item.children?.length) {
        walk(item.children);
      }
    });
  };

  walk(navigation.value ?? []);

  return flat;
});

function directionOf(item: { path: string }) {
  const currentIndex = flatNavigation.value.findIndex(
    (entry) => normalisePath(entry.path) === normalisePath(contentPath.value),
  );
  const itemIndex = flatNavigation.value.findIndex(
    (entry) => normalisePath(entry.path) === normalisePath(item.path),
  );

  if (currentIndex === -1 || itemIndex === -1) {
    return null;
  }

  return itemIndex < currentIndex ? "prev" : "next";
}

const surroundingsItems = computed(() => surroundings.value ?? []);

const prevPage = computed(() => {
  if (surroundingsItems.value.length === 2) {
    return surroundingsItems.value[0];
  }

  const item = surroundingsItems.value[0];

  if (surroundingsItems.value.length === 1 && item) {
    return directionOf(item) === "prev" ? item : null;
  }

  return null;
});

const nextPage = computed(() => {
  if (surroundingsItems.value.length === 2) {
    return surroundingsItems.value[1];
  }

  const item = surroundingsItems.value[0];

  if (surroundingsItems.value.length === 1 && item) {
    return directionOf(item) === "next" ? item : null;
  }

  return null;
});

const metaDescription = computed(() =>
  (page.value?.description ?? "").replace(/<[^>]+>/g, "").trim(),
);

function withBase(html: string) {
  return (html ?? "").replace(
    /(href|src)="\/(?!\/)/g,
    (match, attribute) => `${attribute}="${baseURL}`,
  );
}

useSeoMeta({
  title: () => page.value?.title,
  description: () => metaDescription.value,
  ogTitle: () => page.value?.title,
  ogDescription: () => metaDescription.value,
});
</script>

<template>
  <div v-if="page" class="docs-grid">
    <article class="docs-article">
      <DocsBreadcrumb :items="breadcrumb" />

      <h1 class="docs-title">{{ page.title }}</h1>

      <p
        v-if="page.description"
        class="docs-lead"
        v-html="withBase(page.description)"
      />

      <div class="docs-prose">
        <ContentRenderer :value="page" />
      </div>

      <DocsPrevNext v-if="showPrevNext" :prev="prevPage" :next="nextPage" />
    </article>

    <DocsOutline :links="page.body?.toc?.links ?? []" />
  </div>
</template>
