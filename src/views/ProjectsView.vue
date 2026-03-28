<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getProjects, type Project } from '@/composables/useContent'
import ProjectsFilterBar from '@/components/ProjectsFilterBar.vue'
import ProjectMasonryCard from '@/components/ProjectMasonryCard.vue'
import { startProjectTransition } from '@/composables/useProjectTransition'

const all = getProjects()
const filter = ref<'all' | 'web' | 'mobile' | 'open-source' | 'design'>('all')
const router = useRouter()

const filtered = computed<Project[]>(() => {
  if (filter.value === 'all') return all
  return all.filter(
    (p) =>
      (p as any).category === filter.value ||
      (p as any).tags?.map((t: string) => t.toLowerCase()).includes(filter.value),
  )
})

function heightForIndex(idx: number): 'tall' | 'short' {
  const row = Math.floor(idx / 2)
  const leftIsTall = row % 2 === 0
  const isLeft = idx % 2 === 0
  return (isLeft ? leftIsTall : !leftIsTall) ? 'tall' : 'short'
}

function openProject(payload: { project: Project; el: HTMLElement }) {
  const { project, el } = payload

  // only do fancy animation for image cards
  const media = project.media?.[0]
  if (!media || media.type !== 'image') {
    router.push({ name: 'project', params: { id: project.id } })
    return
  }

  const rect = el.getBoundingClientRect()

  startProjectTransition({
    id: project.id,
    rect,
    mediaSrc: media.src,
  })

  router.push({ name: 'project', params: { id: project.id } })
}
</script>

<template>
  <main
    class="min-h-screen text-neutral-900 dark:text-neutral-100"
    style="
      align-items: center;
      display: flex;
      flex-direction: column;
      background: transparent !important;
    "
  >
    <section class="max-w-6xl mx-auto pb-6 pt-20" style="width: 100%">
      <h1
        class="font-display pb-2 text-[42px] sm:text-6xl md:text-7xl font-semibold tracking-[-0.02em]"
        style="font-weight: 800"
      >
        Projects<span class="text-brand">.</span>
      </h1>
      <hr class="w-full h-[4px] bg-white border-0 my-8 mb-6" />

      <div class="mt-6 w-full">
        <ProjectsFilterBar v-model="filter" />
      </div>
    </section>

    <!-- Projects.vue -->
    <section class="max-w-6xl mx-auto pb-16">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 items-stretch <!-- was items-start --> gap-6 sm:gap-8 md:auto-rows-[160px] md:grid-flow-row-dense"
      >
        <ProjectMasonryCard
          v-for="(p, i) in filtered"
          :key="p.id"
          :project="p"
          :height="heightForIndex(i)"
          @open="openProject"
        />
      </div>
    </section>
  </main>
</template>
