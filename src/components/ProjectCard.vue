<script setup lang="ts">
import type { Project } from '@/composables/useContent'
defineProps<{ project: Project }>()
</script>

<template>
  <RouterLink :to="`/projects/${project.id}`"
    class="block rounded-2xl border border-neutral-700/40 p-4 hover:-translate-y-0.5 transition">
    <h3 class="font-semibold">{{ project.name }}</h3>
    <p class="mt-1 text-sm text-neutral-400">{{ project.summary }}</p>
    <div class="mt-3 flex flex-wrap gap-2">
      <span v-for="t in project.tech || []" :key="t"
        class="text-xs px-2 py-0.5 bg-neutral-800/50 rounded">{{ t }}</span>
    </div>
  </RouterLink>
</template>
