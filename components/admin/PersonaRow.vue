<!-- components/admin/PersonaRow.vue -->
<template>
  <div class="flex items-center gap-3">
    <!-- Foto -->
    <img
      v-if="fotoUrl"
      :src="fotoUrl"
      :alt="persona?.name"
      class="rounded-full object-cover bg-gray-100 shrink-0"
      :class="compact ? 'w-8 h-8' : 'w-10 h-10'"
      @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
    />
    <div
      v-else
      class="rounded-full bg-gray-200 flex items-center justify-center shrink-0"
      :class="compact ? 'w-8 h-8' : 'w-10 h-10'"
    >
      <span class="text-gray-400 text-xs">👤</span>
    </div>

    <!-- Datos -->
    <div class="min-w-0 flex-1">
      <template v-if="persona">
        <p class="text-sm font-medium text-gray-900 truncate">{{ persona.name }}</p>
        <p class="text-xs text-gray-500 truncate">
          <span
            v-if="persona.partyShort"
            class="inline-block px-1.5 py-0.5 rounded mr-1 font-medium"
            :style="{
              backgroundColor: (persona.partyColor || '#999') + '20',
              color: persona.partyColor || '#666'
            }"
          >{{ persona.partyShort }}</span>
          <span v-if="etiqueta">{{ etiqueta }}</span>
          <span v-if="persona.department"> · {{ persona.department }}</span>
        </p>
      </template>
      <p v-else class="text-sm text-red-600 italic">
        Senador no encontrado (ID: {{ personaId ?? '—' }})
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SenadorTitular } from '~/composables/useDirectiva'

const props = defineProps<{
  persona: SenadorTitular | null
  personaId?: number
  etiqueta?: string
  compact?: boolean
}>()

// El backend guarda las fotos como rutas relativas (/senadores/...), así que
// hay que anteponer el host del API para que se vean desde el CMS.
const config = useRuntimeConfig()
const API_HOST = (config.public.apiUrl || 'https://demoback.senado.gob.bo/api')
  .replace(/\/api\/?$/, '')

const fotoUrl = computed(() => {
  const f = props.persona?.foto
  if (!f) return ''
  if (/^https?:\/\//i.test(f) || f.startsWith('data:')) return f
  return `${API_HOST}${f.startsWith('/') ? '' : '/'}${f}`
})
</script>
