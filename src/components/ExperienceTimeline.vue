<script setup lang="ts">
import { useContent } from "@/composables/useContent";
const { experience } = useContent();

function fmt(range?: string) {
  if (!range) return "";
  // Accept "YYYY-MM" or "present"
  if (range.toLowerCase?.() === "present") return "Present";
  const [y, m] = range.split("-");
  const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(m)-1] || "";
  return `${month} ${y}`;
}
</script>

<template>
  <section class="max-w-5xl mx-auto px-6 py-10">
    <h2 class="text-2xl font-bold mb-6">Experience</h2>

    <ol class="relative border-l border-neutral-700/40 pl-6 space-y-8">
      <li v-for="(e, idx) in experience" :key="idx" class="ml-2">
        <div class="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-brand"></div>
        <div class="flex flex-wrap items-baseline gap-x-2">
          <h3 class="text-lg font-semibold">{{ e.title }}</h3>
          <span class="text-neutral-400">· {{ e.company }}</span>
        </div>
        <p class="text-sm text-neutral-400">
          {{ fmt(e.start) }} — {{ fmt(e.end) || 'Present' }} · {{ e.location }}
        </p>

        <ul class="mt-3 list-disc pl-5 space-y-1">
          <li v-for="(b,i) in e.bullets" :key="i">{{ b }}</li>
        </ul>

        <div v-if="e.tech?.length" class="mt-3 flex flex-wrap gap-2">
          <span v-for="t in e.tech" :key="t" class="text-xs px-2 py-0.5 rounded bg-neutral-800/50">
            {{ t }}
          </span>
        </div>
      </li>
    </ol>
  </section>
</template>
