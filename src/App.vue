<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useContent } from '@/composables/useContent'
import NavBar from './components/NavBar.vue'
import ThreeScene from './components/ThreeScene.vue'

const { site, highlights } = useContent()
</script>

<template>
  <a
    href="#main"
    class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 bg-neutral-900 text-white px-3 py-2 rounded"
  >
    Skip to content
  </a>
  <div style="min-height: 100vh; width: 100%; display: flex; flex-direction: column">
    <ThreeScene />

    <NavBar />
    <div id="main">
      <RouterView />
    </div>
    <footer class="footer">
      © {{ new Date().getFullYear() }} — All rights reserved to <strong>Ala Eddine Nasri</strong>
    </footer>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
  .footer {
    position: absolute;
    bottom: 10px;
    text-align: center;
    font-size: 0.75rem; /* very small text */
    opacity: 0.6;
    padding: 1rem 0;
    width: 100%;
  }
  .footer strong {
    font-weight: 600;
  }
}
</style>
