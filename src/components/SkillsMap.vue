<script setup lang="ts">
import { useContent } from "@/composables/useContent";
const { skills } = useContent();

function label(key: string) {
  return key.replace(/(^\w|-\w)/g, m => m.toUpperCase()).replace(/-/g, " ");
}
</script>

<template>
  <section class="max-w-5xl mx-auto px-6 pb-10">
    <h2 class="text-2xl font-bold mb-4">Skills</h2>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article v-for="(vals, key) in skills" :key="key" class="rounded-2xl border border-neutral-700/40 p-4">
        <h3 class="font-semibold mb-2">{{ label(key) }}</h3>
        <div class="flex flex-wrap gap-2">
          <span v-for="v in vals as string[]" :key="v" class="text-xs px-2 py-0.5 rounded bg-neutral-800/50">
            {{ v }}
          </span>
        </div>
      </article>
    </div>
  </section>
</template>
