<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const filters = [
  { key: 'all', label: 'All' },
  { key: 'web', label: 'Web' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'open-source', label: 'Open Source' },
  { key: 'design', label: 'Designs' },
]

function setFilter(k: string) {
  emit('update:modelValue', k)
}
</script>

<template>
  <div class="flex flex-wrap gap-2 justify-center pt-4">
    <button
      v-for="f in filters"
      :key="f.key"
      @click="setFilter(f.key)"
      class="rounded-xl border px-3 py-1.5 text-sm transition"
      :class="
        props.modelValue === f.key
          ? 'bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700'
          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-700'
      "
    >
      {{ f.label }}
    </button>
  </div>
</template>
