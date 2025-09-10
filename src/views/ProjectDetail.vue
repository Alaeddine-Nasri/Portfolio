<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getProjectById } from "@/composables/useContent";

const route = useRoute();
const router = useRouter();

const project = computed(() => getProjectById(route.params.id as string));

onMounted(() => {
  if (!project.value) router.replace("/");
  else document.title = `${project.value.name} • Portfolio`;
});
watch(project, (p) => { if (p) document.title = `${p.name} • Portfolio`; });

const lightboxSrc = ref<string | null>(null);
const lightboxAlt = ref<string>("");

function openLightbox(src: string, alt?: string) {
  lightboxSrc.value = src;
  lightboxAlt.value = alt || "";
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lightboxSrc.value = null;
  lightboxAlt.value = "";
  document.body.style.overflow = "";
}
</script>

<template>
  <main class="min-h-screen bg-white dark:bg-neutral-950 text-neutral-100">
    <section v-if="project" class="max-w-3xl mx-auto px-6 py-10">
      <button @click="$router.back()" class="mb-6 text-sm underline">← Back</button>

      <h1 class="text-3xl font-bold">{{ project.name }}</h1>
      <p class="mt-2 text-neutral-400">{{ project.summary }}</p>

      <div class="mt-6 grid gap-3">
        <p v-if="project.problem"><span class="font-semibold">Problem:</span> {{ project.problem }}</p>
        <p v-if="project.role"><span class="font-semibold">Role:</span> {{ project.role }}</p>
        <p v-if="project.outcome"><span class="font-semibold">Outcome:</span> {{ project.outcome }}</p>
      </div>

      <div v-if="project.tech?.length" class="mt-6 flex flex-wrap gap-2">
        <span v-for="t in project.tech" :key="t"
              class="text-xs px-2 py-0.5 rounded bg-neutral-800/50">{{ t }}</span>
      </div>

      <div v-if="project.media?.length" class="mt-8 grid gap-4">
        <template v-for="m in project.media" :key="m.src">
          <img v-if="m.type === 'image'"
               :src="m.src" :alt="m.alt || project.name"
               class="rounded-xl w-full cursor-zoom-in"
               @click="openLightbox(m.src, m.alt)" />
          <video v-else controls class="rounded-xl w-full">
            <source :src="m.src" />
          </video>
        </template>
      </div>

      <div v-if="project.links?.length" class="mt-6 flex flex-wrap gap-3">
        <a v-for="l in project.links" :key="l.href" :href="l.href" target="_blank" rel="noopener"
           class="inline-flex items-center rounded-2xl px-3 py-1.5 border hover:bg-neutral-100 dark:hover:bg-neutral-800">
          {{ l.label }}
        </a>
      </div>
    </section>

    <!-- Lightbox -->
    <div v-if="lightboxSrc"
         class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
         @click.self="closeLightbox" @keyup.esc="closeLightbox" tabindex="0">
      <img :src="lightboxSrc!" :alt="lightboxAlt" class="max-h-[90vh] max-w-[90vw] rounded-xl" />
      <button class="absolute top-4 right-4 px-3 py-1.5 bg-white/10 rounded-lg" @click="closeLightbox">
        Close ✕
      </button>
    </div>
  </main>
</template>
