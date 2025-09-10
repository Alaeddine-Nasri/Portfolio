<script setup lang="ts">
import { useContent } from "@/composables/useContent";
import HighlightCard from "./HighlightCard.vue";

const { highlights } = useContent();
</script>

<template>
  <section class="max-w-5xl mx-auto px-6 pb-10">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <HighlightCard v-for="h in highlights" :key="h.id" :item="h" />
    </div>
  </section>
</template>
