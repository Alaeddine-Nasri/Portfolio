<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useContent } from '@/composables/useContent'
import DarkToggle from '@/components/DarkToggle.vue'

const { site } = useContent() as any
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
  <nav
    style="
      margin-top: 0 !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      background: transparent !important;
      border: none !important;
      padding: 6px 0 !important;
    "
    class="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:supports-[backdrop-filter]:bg-neutral-950/65 border-b border-neutral-200 dark:border-neutral-800"
  >
    <div class="mx-auto px-4 sm:px-6 h-14 flex items-center justify-between" style="width: 100%">
      <a :href="baseHref" class="font-semibold">
        {{ site?.name || 'Portfolio' }}
      </a>

      <div class="hidden md:flex items-center gap-2">
        <RouterLink
          v-for="l in links"
          :key="l.label"
          :to="l.to"
          class="px-3 py-1.5 rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          :class="
            isActive(l.to.name as string) ? 'bg-neutral-200 dark:bg-neutral-800 font-medium' : ''
          "
          >{{ l.label }}</RouterLink
        >
        <DarkToggle />
      </div>

      <button
        class="md:hidden rounded-lg border px-2 py-1"
        @click="open = !open"
        aria-label="Toggle menu"
      >
        ☰
      </button>
    </div>

    <div v-if="open" class="md:hidden border-t border-neutral-200 dark:border-neutral-800">
      <div class="max-w-5xl mx-auto px-4 py-2 flex flex-col gap-1">
        <RouterLink
          v-for="l in links"
          :key="l.label"
          :to="l.to"
          @click="open = false"
          class="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          :class="
            isActive(l.to.name as string) ? 'bg-neutral-200 dark:bg-neutral-800 font-medium' : ''
          "
          >{{ l.label }}</RouterLink
        >
        <div class="px-3 py-2"><DarkToggle /></div>
      </div>
    </div>
  </nav>
</template>
