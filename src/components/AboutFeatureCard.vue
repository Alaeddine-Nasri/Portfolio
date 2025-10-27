<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  labels?: string[]
  bgColor?: string
  textColor?: string
  image?: string
  previewing?: boolean // <— NEW: true while hovering a list item
}>()
</script>

<template>
  <div
    class="relative overflow-hidden border border-white/20 shadow-2xl h-full"
    :style="{
      backgroundColor: bgColor || '#ffffff',
      color: textColor || '#0f172a',
      borderTopRightRadius: '10px',
      borderTopLeftRadius: '0px',
      borderBottomRightRadius: '0px',
      borderBottomLeftRadius: '0px',
    }"
  >
    <Transition name="fade" mode="out-in">
      <div
        v-if="image"
        :key="image"
        class="card-bg absolute inset-0 -z-0 opacity-25 transition-[background-size] duration-500 ease-out will-change-transform"
        :class="previewing ? 'bg-zoom' : ''"
        :style="{
          backgroundImage: `url(${image})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }"
      />
    </Transition>

    <div class="relative z-10 h-full w-full p-6 md:p-8">
      <h3 class="text-xl md:text-2xl font-semibold leading-tight">{{ title }}</h3>
      <p v-if="description" class="mt-3 text-sm/6 opacity-90">{{ description }}</p>

      <div v-if="labels?.length" class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="(tag, i) in labels"
          :key="i"
          class="text-xs px-2 py-0.5 rounded-full ring-1 ring-black/10 bg-white/70 text-black/80"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* cross-fade when the image prop changes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* define keyframes for staged zoom */
@keyframes zoomStage {
  0% {
    background-size: 100% 100%;
  }
  100% {
    background-size: 110% 110%;
  }
}

/* apply animation only while previewing */
.bg-zoom {
  animation: zoomStage 1.2s forwards; /* adjust duration as needed */
}
</style>
