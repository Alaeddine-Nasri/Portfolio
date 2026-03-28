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
const longer = ref(false)

const linksOld = [
  { label: 'HOME', to: { name: 'home' } },
  { label: 'Projects', to: { name: 'projects' } },
  { label: 'About', to: { name: 'about' } },
  { label: 'Contact', to: { name: 'contact' } },
]
const links = [
  { label: 'HOM<span class="wide">E</span>', to: { name: 'home' } },
  { label: 'PROJ<span class="wide">E</span>CTS', to: { name: 'projects' } },
  { label: 'ABO<span class="wide">U</span>T', to: { name: 'about' } },
  { label: 'CON<span class="wide">T</span>ACT', to: { name: 'contact' } },
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
    <div
      class="flex items-center justify-between px-6 pt-4"
      style="pointer-events: auto; display: flex; align-items: start"
    >
      <!-- brand -->
      <a :href="baseHref" class="brand-name" style="font-size: 1.6rem"> Aladdin </a>
      <!-- <div
        style="display: flex; flex-direction: row; align-items: start"
        @mouseenter="longer = true"
        @mouseleave="longer = false"
      >
        <div style="height: 20px; width: 4px; background-color: aliceblue"></div>
        <div
          style="
            height: 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: width 0.5s ease;
          "
          :style="{ width: longer ? '25px' : '8px' }"
        >
          <div style="width: 100%; height: 3px; background-color: aliceblue"></div>
          <div style="width: 100%; height: 3px; background-color: aliceblue"></div>
          <div style="width: 100%; height: 3px; background-color: aliceblue"></div>
        </div>
      </div> -->
      <!-- DESKTOP MENU (STACKED) -->
      <div
        class="hidden md:flex flex-col items-end gap-2 pointer-events-auto"
        style="margin-top: -10px"
      >
        <!-- <RouterLink
          v-for="l in links"
          :key="l.label"
          :to="l.to"
          class="menu-item text-right"
          :class="isActive(l.to.name as string) ? 'active-link' : 'inactive-link'"
          style="font-size: 1.3rem"
        >
          {{ l.label }}
        </RouterLink> -->
        <RouterLink
          v-for="l in links"
          :key="l.label"
          :to="l.to"
          class="menu-item"
          v-html="l.label"
          :class="isActive(l.to.name) ? 'active-link' : 'inactive-link'"
        />
      </div>

      <!-- MOBILE BURGER (only small screens) -->
      <button class="px-3 py-1 text-lg md:hidden" @click="open = !open" aria-label="Toggle menu">
        <span v-if="!open">☰</span>
        <span v-else>✕</span>
      </button>
    </div>

    <!-- MOBILE DROPDOWN -->
    <transition name="fade">
      <div
        v-if="open"
        class="absolute right-6 mt-1 flex flex-col items-end gap-2 px-4 md:hidden"
        style="pointer-events: auto; margin-top: -45px; margin-right: 20px"
      >
        <RouterLink
          v-for="l in links"
          :key="l.label"
          :to="l.to"
          @click="open = false"
          class="menu-item px-3 py-1.5 text-right"
          :class="isActive(l.to.name as string) ? 'active-link' : 'inactive-link'"
          style="font-size: 1.3rem"
        >
          {{ l.label }}
        </RouterLink>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
/* fade transition stays the same */
/* fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* brand name */
.brand-name {
  font-family: 'Changa', system-ui, sans-serif;
  font-variation-settings: 'wght' 400;
  letter-spacing: 0.02em;
  transition:
    font-variation-settings 0.25s ease,
    letter-spacing 0.25s ease,
    transform 0.25s ease;
}
.brand-name:hover {
  font-variation-settings: 'wght' 500;
  letter-spacing: 0.06em;
  transform: scaleX(1.12);
}

/* nav items */
.menu-item {
  font-family: 'CindieD', system-ui, sans-serif;
  font-variation-settings: 'wght' 400;
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  transition:
    font-variation-settings 0.25s ease,
    letter-spacing 0.25s ease,
    transform 0.25s ease,
    opacity 0.2s ease,
    color 0.2s ease;
}
:deep(.wide) {
  display: inline-block;
  transform: scaleX(2); /* make this bigger for more width */
  transform-origin: center;
  font-weight: 500 !important;
  letter-spacing: 0.2em;
  margin-left: 8px;
}

/* inactive */
.inactive-link {
  opacity: 0.8;
  color: #e5e7eb; /* light gray */
}
.inactive-link:hover {
  opacity: 1;
  color: #7c3aed; /* purple hover */
}

/* active */
.active-link {
  opacity: 1;
  color: #7c3aed; /* purple */
  font-variation-settings: 'wght' 500;
}
</style>
