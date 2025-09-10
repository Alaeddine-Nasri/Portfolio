<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProjectById } from '@/composables/useContent'

const route = useRoute()
const router = useRouter()
const project = computed(() => getProjectById(route.params.id as string))

if (!project.value) router.replace('/')
</script>

<template>
  <main class="min-h-screen bg-white dark:bg-neutral-950 text-neutral-100">
    <section class="max-w-3xl mx-auto px-6 py-10" v-if="project">
      <button @click="$router.back()" class="mb-6 text-sm underline">← Back</button>

      <h1 class="text-3xl font-bold">{{ project.name }}</h1>
      <p class="mt-2 text-neutral-400">{{ project.summary }}</p>

      <div class="mt-6 grid gap-3">
        <p v-if="project.problem"><span class="font-semibold">Problem:</span> {{ project.problem }}</p>
        <p v-if="project.role"><span class="font-semibold">Role:</span> {{ project.role }}</p>
        <p v-if="project.outcome"><span class="font-semibold">Outcome:</span> {{ project.outcome }}</p>
      </div>

      <div class="mt-6 flex flex-wrap gap-2">
        <span v-for="t in project.tech || []" :key="t"
          class="text-xs px-2 py-0.5 bg-neutral-800/50 rounded">{{ t }}</span>
      </div>

      <div class="mt-8 space-y-3">
        <template v-for="m in project.media || []" :key="m.src">
          <img v-if="m.type==='image'" :src="m.src" :alt="m.alt || project.name" class="rounded-xl w-full" />
          <video v-else controls class="rounded-xl w-full"><source :src="m.src" /></video>
        </template>
      </div>
    </section>
  </main>
</template>
