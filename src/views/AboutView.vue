<script setup lang="ts">
import { useContent } from "@/composables/useContent";
const { site, about } = useContent() as any;
</script>

<template>
  <main class="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
    <section class="max-w-5xl mx-auto px-6 py-10 grid gap-6 md:grid-cols-[1fr_2fr]">
      <img v-if="about?.photo" :src="about.photo" alt="Profile" class="rounded-2xl w-full object-cover">
      <div>
        <h1 class="text-3xl font-bold">About</h1>
        <p class="mt-3 text-neutral-600 dark:text-neutral-400">
          {{ about?.bio || site?.tagline || "Software engineer focused on data-driven UIs & 3D experiences." }}
        </p>
        <div v-if="about?.highlights?.length" class="mt-4 grid gap-2">
          <div v-for="(h,i) in about.highlights" :key="i" class="rounded-xl border p-3">
            {{ h }}
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
