<script setup lang="ts">
import { getProjects } from '@/composables/useContent'
import ProjectCard from './ProjectCard.vue'
const projects = getProjects()
</script>

<template>
  <section class="max-w-5xl mx-auto px-6 pb-12">
    <h2 class="text-2xl font-bold mb-4">Featured Projects</h2>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ProjectCard v-for="p in projects" :key="p.id" :project="p" />
    </div>
  </section>
</template>
