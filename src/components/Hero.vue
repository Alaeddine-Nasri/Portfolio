<script setup lang="ts">
import { useContent } from "@/composables/useContent";
import DarkToggle from "./DarkToggle.vue";

const { site } = useContent();
</script>

<template>
  <header class="py-12">
    <div class="max-w-5xl mx-auto px-6">
      <h1 class="text-4xl sm:text-5xl font-extrabold leading-tight">
        {{ site.name }}
      </h1>
      <p class="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
        {{ site.role }} — {{ site.location }}
      </p>

      <div class="mt-6 flex flex-wrap gap-3">
        <a
          v-if="site.primaryCTA"
          :href="site.primaryCTA.href"
          class="inline-flex items-center rounded-2xl px-4 py-2 bg-brand text-white hover:bg-brand-700 transition"
        >
          {{ site.primaryCTA.label }}
        </a>
       <a :href="site.secondaryCTA.href" target="_blank" rel="noopener" download
   class="inline-flex items-center rounded-2xl px-4 py-2 border">
  {{ site.secondaryCTA.label }}
</a>

        <DarkToggle class="ml-1" />
      </div>
    </div>
  </header>
</template>
