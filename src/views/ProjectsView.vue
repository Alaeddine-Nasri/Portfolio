<script setup lang="ts">
import { computed, ref } from 'vue'
import { getProjects, type Project } from '@/composables/useContent'
import ProjectsFilterBar from '@/components/ProjectsFilterBar.vue'
import ProjectMasonryCard from '@/components/ProjectMasonryCard.vue'

const all = getProjects()
const filter = ref<'all'|'web'|'mobile'|'open-source'|'design'>('all')

const filtered = computed<Project[]>(() => {
  if (filter.value === 'all') return all
  return all.filter(p =>
    (p as any).category === filter.value ||
    (p as any).tags?.map((t:string)=>t.toLowerCase()).includes(filter.value)
  )
})

/** Alternate heights per row:
 * Row 0: [tall, short]
 * Row 1: [short, tall]
 * Row 2: [tall, short] ... etc
 */
function heightForIndex(idx: number): 'tall'|'short' {
  const row = Math.floor(idx / 2)
  const leftIsTall = row % 2 === 0
  const isLeft = idx % 2 === 0
  console.log('isLeft:', isLeft, 'leftIsTall:', leftIsTall)
  return (isLeft ? leftIsTall : !leftIsTall) ? 'tall' : 'short'
}
</script>

<template>
  <main class="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
    <section class="max-w-6xl mx-auto px-6 pt-12 pb-6">
      <h1 class="font-display text-[42px] sm:text-6xl md:text-7xl font-semibold tracking-[-0.02em]">
        Projects<span class="text-brand">.</span>
      </h1>

      <div class="mt-6">
        <ProjectsFilterBar v-model="filter" />
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-6 pb-16">
      <div class="grid grid-cols-1 sm:grid-cols-2 items-start gap-6 sm:gap-8">

        <ProjectMasonryCard
          v-for="(p, i) in filtered"
          :key="p.id"
          :project="p"
          :height="heightForIndex(i)"
        />
      </div>
    </section>
  </main>
</template>
