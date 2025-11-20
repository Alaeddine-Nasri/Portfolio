<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useContent } from '@/composables/useContent'
import DarkToggle from '@/components/DarkToggle.vue'

interface UseContentReturn {
  site?: {
    name?: string
  }
}

const { site } = useContent() as UseContentReturn
const route = useRoute()
const open = ref(false)

const links = [
  { label: 'Home', to: { name: 'home' } },
  { label: 'Projects', to: { name: 'projects' } },
  { label: 'About', to: { name: 'about' } },
  { label: 'Contact', to: { name: 'contact' } },
]

const isActive = (toName: string) => route.name === toName
const baseHref = import.meta.env.BASE_URL || '/'
</script>

<template>
  <!-- fixed so it doesn't push the 3D scene down; transparent so no bar color -->
  <nav
    class="fixed top-0 left-0 w-full z-50 pointer-events-none"
    style="background: transparent; margin: 0 !important; width: 100%"
  >
    <!-- top row: name + menu icon -->
    <div class="flex items-center justify-between px-6 pt-4" style="pointer-events: auto">
      <!-- big name on the left -->
      <a :href="baseHref" class="brand-name" style="font-size: 1.6rem">
        <!-- {{ site?.name || 'Portfolio' }} -->
        Aladdin
      </a>

      <!-- menu toggle icon (always visible) -->
      <button class="px-3 py-1 text-lg" @click="open = !open" aria-label="Toggle menu">
        <span v-if="!open">☰</span>
        <span v-else>✕</span>
      </button>
    </div>

    <!-- dropdown menu on the right, links stacked vertically -->
    <transition name="fade">
      <div
        v-if="open"
        class="absolute right-6 mt-1 flex flex-col items-end gap-2 px-4"
        style="pointer-events: auto; margin-top: -45px; margin-right: 20px"
      >
        <RouterLink
          v-for="l in links"
          :key="l.label"
          :to="l.to"
          @click="open = false"
          class="menu-item px-3 py-1.5 rounded-lg text-right"
          style="font-size: 1.3rem"
          :class="
            isActive(l.to.name as string)
              ? 'font-semibold underline'
              : 'opacity-80 hover:opacity-100'
          "
        >
          {{ l.label }}
        </RouterLink>

        <!-- <div class="pt-1">
          <DarkToggle />
        </div> -->
      </div>
    </transition>
  </nav>
</template>

<style scoped>
/* simple fade for the dropdown */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
/* brand name using the variable font axis */
.brand-name {
  font-family: 'Changa', system-ui, sans-serif;

  /* base look */
  font-variation-settings: 'wght' 400; /* regular-ish */
  letter-spacing: 0.02em;

  display: inline-block; /* so transform works */
  transform-origin: left center;

  /* smooth animation */
  transition:
    font-variation-settings 0.25s ease,
    letter-spacing 0.25s ease,
    transform 0.25s ease;
}

.brand-name:hover {
  /* get bolder */
  font-variation-settings: 'wght' 500;
  /* fake width expansion */
  letter-spacing: 0.06em;
  transform: scaleX(1.12);
}
.menu-item {
  font-family: 'Changa', system-ui, sans-serif;

  /* base */
  font-variation-settings: 'wght' 400;
  letter-spacing: 0.01em;
  display: inline-block;
  transform-origin: left center;

  transition:
    font-variation-settings 0.25s ease,
    letter-spacing 0.25s ease,
    transform 0.25s ease,
    opacity 0.2s ease;
}

.menu-item:hover {
  font-variation-settings: 'wght' 500; /* thicker */
  letter-spacing: 0.06em; /* more spaced */
  transform: scaleX(1); /* widen text */
}
</style>
