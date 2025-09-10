<script setup lang="ts">
type Highlight = {
  id: string; title: string; impact: string;
  metrics?: string[]; tech?: string[];
};
const props = defineProps<{ item: Highlight }>();
</script>

<template>
  <article class="rounded-2xl border border-neutral-700/40 p-4 hover:-translate-y-0.5 transition transform">
    <h3 class="font-semibold">{{ props.item.title }}</h3>
    <p class="mt-1 text-sm text-neutral-400">{{ props.item.impact }}</p>

    <div v-if="props.item.metrics?.length" class="mt-2 flex flex-wrap gap-2">
      <span v-for="m in props.item.metrics" :key="m" class="text-xs px-2 py-0.5 rounded-full border">
        {{ m }}
      </span>
    </div>

    <div v-if="props.item.tech?.length" class="mt-3 flex flex-wrap gap-2">
      <span v-for="t in props.item.tech" :key="t" class="text-xs px-2 py-0.5 bg-neutral-800/50 rounded">
        {{ t }}
      </span>
    </div>
  </article>
</template>
