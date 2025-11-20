<script setup lang="ts">
import { ref, computed } from 'vue'
import { useContent } from '@/composables/useContent'
import AboutFeatureCard from '@/components/AboutFeatureCard.vue'
import { asset } from '@/utils/asset'

const { about } = useContent() as any

type Section = {
  id: string
  title: string
  labels: string[]
  short?: string
  description?: string
  card?: { bgColor?: string; textColor?: string; image?: string }
}

const sections = (about?.sections || []) as Section[]
const selectedId = ref<string>(sections[0]?.id || '')
const hoveredId = ref<string | null>(null)

const selected = computed(() => sections.find((s) => s.id === selectedId.value))
const hovered = computed(() => sections.find((s) => s.id === hoveredId.value))
const active = computed(() => hovered.value || selected.value) // ← preview on hover, else selected

// card props
const cardTitle = computed(() => active.value?.title || '')
const cardDesc = computed(() => active.value?.description || active.value?.short || '')
const cardLabels = computed(() => active.value?.labels || [])
const cardBgColor = computed(() => active.value?.card?.bgColor)
const cardTextColor = computed(() => active.value?.card?.textColor)
const cardImage = computed(() => asset(active.value?.card?.image))
const previewing = computed(() => !!hoveredId.value) // ← true only while hovering list
</script>

<template>
  <!-- 100vh, simple solid/dark background; NO full-page images -->
  <main
    class="relative h-[100vh] min-h-[100vh] w-full text-neutral-100 overflow-hidden"
    style="
      align-items: center;
      display: flex;
      flex-direction: column;
      background: transparent !important;
    "
  >
    <!-- top bar + title -->
    <section class="mx-auto pb-6 pt-20" style="width: 70%">
      <h1
        class="font-display pb-2 text-[42px] sm:text-6xl md:text-7xl font-semibold tracking-[-0.02em]"
        style="font-weight: 800"
      >
        About Me<span class="text-brand">.</span>
      </h1>
      <hr class="w-full h-[4px] bg-white border-0 my-8 mb-6" />
    </section>

    <!-- layout area -->
    <section class="mx-auto w-full mt-10 h-[calc(100vh-200px)]" style="max-width: 70%">
      <div class="grid md:grid-cols-[1fr_1.2fr] gap-8 h-full items-start">
        <!-- left: pinned card -->
        <div class="h-full">
          <div
            class="absolute left-[0%] bottom-[0%] w-[45%] h-[58%] max-w-[680px] min-w-[320px]"
            style="background-color: transparent"
          >
            <!-- <AboutFeatureCard
              :title="cardTitle"
              :description="cardDesc"
              :labels="cardLabels"
              :bgColor="cardBgColor"
              :textColor="cardTextColor"
              :image="cardImage"
              :previewing="previewing"
              class="h-full"
            /> -->
          </div>
        </div>

        <!-- right: list -->
        <div>
          <button
            v-for="s in sections"
            :key="s.id"
            class="group w-full py-3 text-left transition-all duration-200 hover:bg-white/10 hover:tracking-[0.03em]"
            @mouseenter="hoveredId = s.id"
            @mouseleave="hoveredId = null"
            @click="selectedId = s.id"
            style="cursor: pointer; padding-bottom: 0 !important; padding-top: 12px !important"
          >
            <div class="flex items-center gap-4 justify-between">
              <span
                class="min-w-[140px] font-bold text-white/90 flex items-center gap-2"
                style="font-weight: 900"
              >
                <span
                  v-if="selectedId === s.id"
                  class="inline-block size-1.5 rounded-full bg-white"
                />
                {{ s.title }}
              </span>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(tag, i) in s.labels.slice(0, 3)"
                  :key="i"
                  class="text-[11px] px-2 py-0.5 rounded-full border border-white/30 text-white/80"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- divider -->
            <div
              class="h-[3px] w-full bg-white group-hover:bg-white/80 transition-colors"
              style="bottom: 0 !important; margin-top: 12px"
            ></div>
          </button>
        </div>
      </div>
    </section>
  </main>
</template>
