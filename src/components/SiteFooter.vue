<script setup lang="ts">
import { useContent } from "@/composables/useContent";
const { site } = useContent() as any;
const year = new Date().getFullYear();
</script>

<template>
  <footer class="border-t border-neutral-800 mt-8">
    <div class="max-w-5xl mx-auto px-6 py-6 text-sm text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2">
      <span>© {{ year }} {{ site?.name }}. All rights reserved.</span>
      <a href="#top" class="underline">Back to top ↑</a>
    </div>
  </footer>
</template>
