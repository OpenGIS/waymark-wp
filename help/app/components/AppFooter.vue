<script setup lang="ts">
const baseURL = useRuntimeConfig().app.baseURL;
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__brand">
        <img
          class="site-footer__mark"
          :src="`${baseURL}assets/img/ogis-logo-white.svg`"
          alt="Open GIS"
          width="40"
          height="40"
        />
        <p class="site-footer__copy">
          <a
            href="https://github.com/opengis/waymark-wp"
            rel="noopener noreferrer"
            target="_blank"
            >Open-Source</a
          >
          by
          <a
            href="https://www.ogis.org"
            rel="noopener noreferrer"
            target="_blank"
            >Open GIS</a
          >.
        </p>
      </div>
    </div>
  </footer>
</template>
