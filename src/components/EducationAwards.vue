<script setup lang="ts">
import { useContent } from "@/composables/useContent";
const { education, awards } = useContent();
</script>

<template>
  <section class="max-w-5xl mx-auto px-6 pb-12">
    <h2 class="text-2xl font-bold mb-4">Education</h2>
    <div class="space-y-6">
      <article v-for="(ed, idx) in education" :key="idx" class="rounded-2xl border border-neutral-700/40 p-4">
        <h3 class="font-semibold">{{ ed.school }}</h3>
        <p class="text-sm text-neutral-400">{{ ed.program }} · {{ ed.year }}</p>
        <ul v-if="ed.bullets?.length" class="mt-2 list-disc pl-5 space-y-1">
          <li v-for="(b,i) in ed.bullets" :key="i">{{ b }}</li>
        </ul>
      </article>
    </div>

    <h2 class="text-2xl font-bold mt-10 mb-4">Awards</h2>
    <ul class="space-y-3">
      <li v-for="(a, i) in awards" :key="i" class="rounded-2xl border border-neutral-700/40 p-4">
        <p class="font-medium">{{ a.name }}</p>
        <p class="text-sm text-neutral-400">{{ a.org }}<span v-if="a.note"> — {{ a.note }}</span></p>
      </li>
    </ul>
  </section>
</template>
