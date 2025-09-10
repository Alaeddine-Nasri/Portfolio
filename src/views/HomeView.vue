<script setup lang="ts">
import Hero from '@/components/Hero.vue'
import Highlights from '@/components/Highlights.vue'
import Projects from '@/components/Projects.vue'
import ExperienceTimeline from '@/components/ExperienceTimeline.vue'
import SkillsMap from '@/components/SkillsMap.vue'
import EducationAwards from '@/components/EducationAwards.vue'
</script>

<template>
  <main class="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
    <Hero />
    <Highlights />
    <Projects />
    <ExperienceTimeline />
    <SkillsMap />
    <EducationAwards />
  </main>
</template>
