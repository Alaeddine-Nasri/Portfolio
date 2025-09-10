<script setup lang="ts">
import type { Project } from '@/composables/useContent'
import { onMounted } from 'vue'

const props = defineProps<{ project: Project; height: 'tall' | 'short' }>()

onMounted(() => {
  console.log('height:', props.height) // ✅ works
})
</script>

<template>
  <RouterLink :to="`/projects/${project.id}`" class="group card">
    <!-- Media -->
    <div
      :class="[
        'w-full',
        height === 'tall' ? 'h-96 md:h-[460px]' : height === 'short' ? 'h-64 md:h-[320px]' : '',
      ]"
    >
      <img
        v-if="project.media?.[0]?.type === 'image'"
        :src="project.media[0].src"
        :alt="project.media[0].alt || project.name"
        class="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <video
        v-else-if="project.media?.[0]?.type === 'video'"
        class="h-full w-full object-cover"
        muted
        playsinline
        preload="metadata"
      ></video>
      <div v-else class="h-full w-full grid place-items-center text-neutral-500">No preview</div>
    </div>

    <!-- Bottom reveal -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
    >
      <div class="bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
        <h3 class="font-medium text-white">{{ project.name }}</h3>
        <div class="mt-2 flex flex-wrap gap-2">
          <span
            v-for="t in project.tech || []"
            :key="t"
            class="text-[11px] px-2 py-0.5 rounded-full bg-white/10 ring-1 ring-white/20 text-white/90"
          >
            {{ t }}
          </span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
<style scoped>
@reference "../assets/base.css";

.card {
  @apply relative block overflow-hidden rounded-3xl border border-neutral-800
         bg-neutral-900/30 hover:shadow-2xl hover:shadow-black/40 transition;
}
</style>
