<script setup lang="ts">
import { useContent } from "@/composables/useContent";
const { site, contact } = useContent() as any;
</script>

<template>
  <section id="contact" class="max-w-5xl mx-auto px-6 py-12">
    <div class="rounded-2xl border border-neutral-700/40 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold">Let’s work together</h2>
        <p class="mt-1 text-neutral-400">{{ contact?.availability || 'Open to opportunities' }}</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <a :href="contact?.email ? `mailto:${contact.email}` : site?.primaryCTA?.href"
           class="rounded-2xl px-4 py-2 bg-brand text-white hover:bg-brand-700">
          Email me
        </a>
        <template v-for="s in site?.social || []" :key="s.href">
          <a :href="s.href" target="_blank" rel="noopener"
             class="rounded-2xl px-4 py-2 border hover:bg-neutral-100 dark:hover:bg-neutral-800">
            {{ s.label }}
          </a>
        </template>
      </div>
    </div>
  </section>
</template>
