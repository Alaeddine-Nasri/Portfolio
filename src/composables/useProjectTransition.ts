// src/composables/useProjectTransition.ts
import { ref } from 'vue'

interface ProjectTransitionState {
  id: string
  rect: DOMRect
  mediaSrc: string
}

const state = ref<ProjectTransitionState | null>(null)

export function startProjectTransition(payload: ProjectTransitionState) {
  state.value = payload
}

export function useProjectTransition() {
  return state
}
