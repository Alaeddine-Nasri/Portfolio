<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProjectById } from '@/composables/useContent'
import CanvasModel from '@/components/CanvasModel.vue'
import { useProjectTransition } from '@/composables/useProjectTransition'

const route = useRoute()
const router = useRouter()
const transitionState = useProjectTransition()

const project = computed(() => getProjectById(route.params.id as string))
const base = import.meta.env.BASE_URL

const heroReady = ref(false) // we'll show hero after animation
const heroEl = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!project.value) {
    router.replace('/')
    return
  }
  document.title = `${project.value.name} • Portfolio`

  // run shared-element-like animation if we have state and matching project
  if (transitionState.value && transitionState.value.id === project.value.id) {
    await nextTick()
    runHeroTransition()
  } else {
    heroReady.value = true
  }
})

watch(project, (p) => {
  if (p) document.title = `${p.name} • Portfolio`
})

// lightbox stays the same ...
const lightboxSrc = ref<string | null>(null)
const lightboxAlt = ref<string>('')
function openLightbox(src: string, alt?: string) {
  lightboxSrc.value = src
  lightboxAlt.value = alt || ''
  document.body.style.overflow = 'hidden'
}
function closeLightbox() {
  lightboxSrc.value = null
  lightboxAlt.value = ''
  document.body.style.overflow = ''
}

function runHeroTransition() {
  const state = transitionState.value
  const hero = heroEl.value
  const p = project.value
  if (!state || !hero || !p || !p.media?.[0] || p.media[0].type !== 'image') {
    heroReady.value = true
    transitionState.value = null
    return
  }

  const from = state.rect
  const to = hero.getBoundingClientRect()

  // create ghost element
  const ghost = document.createElement('div')
  ghost.style.position = 'fixed'
  ghost.style.left = from.left + 'px'
  ghost.style.top = from.top + 'px'
  ghost.style.width = from.width + 'px'
  ghost.style.height = from.height + 'px'
  ghost.style.borderRadius = '16px'
  ghost.style.overflow = 'hidden'
  ghost.style.zIndex = '999'
  ghost.style.backgroundImage = `url(${base + state.mediaSrc})`
  ghost.style.backgroundSize = 'cover'
  ghost.style.backgroundPosition = 'center'
  ghost.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5)'
  ghost.style.transition = 'all 0.45s cubic-bezier(0.22, 0.61, 0.36, 1)'

  document.body.appendChild(ghost)

  // animate to hero rect
  requestAnimationFrame(() => {
    ghost.style.left = to.left + 'px'
    ghost.style.top = to.top + 'px'
    ghost.style.width = to.width + 'px'
    ghost.style.height = to.height + 'px'
    ghost.style.borderRadius = '20px'
  })

  // cleanup after animation
  setTimeout(() => {
    ghost.remove()
    heroReady.value = true
    transitionState.value = null
  }, 500)
}
</script>

<template>
  <main class="min-h-screen text-neutral-100">
    <!-- HERO MEDIA CARD -->
    <section class="flex justify-center">
      <div
        ref="heroEl"
        class="detail-hero w-full md:w-4/5 h-[70vh] mt-0 overflow-hidden relative rounded-b-[20px]"
      >
        <!-- Only show media once the transition is done (or skipped) -->
        <div v-if="heroReady" class="absolute inset-0">
          <template v-if="project?.media?.[0]">
            <template v-if="project.media[0].type === 'video'">
              <video
                :src="base + project.media[0].src"
                :alt="project.media[0].alt || project.name"
                class="absolute inset-0 w-full h-full object-cover"
                autoplay
                muted
                loop
                playsinline
                preload="metadata"
              />
            </template>

            <template v-else-if="project.media[0].type === 'model'">
              <CanvasModel
                :src="base + project.media[0].src"
                class="absolute inset-0 w-full h-full"
              />
            </template>

            <template v-else>
              <img
                :src="base + project.media[0].src"
                :alt="project.media[0].alt || project?.name"
                class="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
                @click="openLightbox(project!.media![0].src, project!.media![0].alt)"
              />
            </template>
          </template>

          <div v-else class="grid place-items-center absolute inset-0 text-neutral-500">
            No preview available
          </div>
        </div>
      </div>
    </section>

    <!-- Title -->
    <section class="mx-auto w-full md:w-4/5 px-6 md:px-0 py-8" style="width: 90%; margin: auto">
      <h1
        class="font-display pb-2 text-[42px] sm:text-6xl md:text-7xl font-semibold tracking-[-0.02em]"
        style="font-weight: 800"
      >
        {{ project?.name }}<span class="text-brand">.</span>
      </h1>
      <hr class="w-full h-[4px] bg-white border-0 my-8 mb-6" />
      <div class="flex justify-between">
        <div class="w-4/5 text-justify mt-2 text-neutral-400">
          {{ project?.summary }}
        </div>
        <div class="w-1/5 bg-red-500"></div>
      </div>
      <div v-if="project?.tech?.length" class="mt-6 flex flex-wrap gap-2">
        <span
          v-for="t in project.tech"
          :key="t"
          class="text-xs px-2 py-0.5 rounded bg-neutral-800/50"
          >{{ t }}</span
        >
      </div>
    </section>
    <!-- DETAILS UNDER HERO -->
    <section class="mx-auto w-full md:w-4/5 px-6 md:px-0 py-8" style="width: 80%; margin: auto">
      <button @click="$router.back()" class="mb-6 text-sm underline">← Back</button>

      <div class="mt-6 grid gap-3">
        <p v-if="project?.problem">
          <span class="font-semibold">Problem:</span> {{ project.problem }}
        </p>
        <p v-if="project?.role"><span class="font-semibold">Role:</span> {{ project.role }}</p>
        <p v-if="project?.outcome">
          <span class="font-semibold">Outcome:</span> {{ project.outcome }}
        </p>
      </div>

      <!-- If you want to keep showing the rest of media below, keep this block.
           Otherwise, remove it since the first media is already in the hero. -->
      <div v-if="project?.media?.length > 1" class="mt-8 grid gap-4">
        <template v-for="m in project.media.slice(1)" :key="m.src">
          <img
            v-if="m.type === 'image'"
            :src="base + m.src"
            :alt="m.alt || project!.name"
            class="rounded-xl w-full cursor-zoom-in"
            @click="openLightbox(m.src, m.alt)"
          />
          <video v-else-if="m.type === 'video'" :src="m.src" controls class="rounded-xl w-full" />
          <CanvasModel v-else-if="m.type === 'model'" :src="m.src" class="h-96 w-full rounded-xl" />
        </template>
      </div>

      <div v-if="project?.links?.length" class="mt-6 flex flex-wrap gap-3">
        <a
          v-for="l in project.links"
          :key="l.href"
          :href="l.href"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center rounded-2xl px-3 py-1.5 border hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          {{ l.label }}
        </a>
      </div>
    </section>

    <!-- Lightbox -->
    <div
      v-if="lightboxSrc"
      class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      @click.self="closeLightbox"
      @keyup.esc="closeLightbox"
      tabindex="0"
    >
      <img :src="lightboxSrc!" :alt="lightboxAlt" class="max-h-[90vh] max-w-[90vw] rounded-xl" />
      <button
        class="absolute top-4 right-4 px-3 py-1.5 bg-white/10 rounded-lg"
        @click="closeLightbox"
      >
        Close ✕
      </button>
    </div>
  </main>
</template>

<style scoped>
/* You used a .card class on masonry cards. This mirrors its look but
   without hover effects and with only bottom corners rounded. */
.detail-hero {
  /* match ProjectMasonryCard.vue .card base (minus hover) */
  /* Tailwind already applies border/bg/rounded in the element classes.
     Keep a hook here in case you want to tweak in one place later. */
}
</style>
