<script setup lang="ts">
import { ref, onMounted } from "vue";
import { toggleTheme } from "@/theme";

const isDark = ref(false);
onMounted(() => { isDark.value = document.documentElement.classList.contains("dark"); });

function onClick() {
  isDark.value = toggleTheme();
}
</script>

<template>
  <button @click="onClick" class="rounded-xl border px-3 py-1 text-sm">
    {{ isDark ? "Light" : "Dark" }}
  </button>
</template>
