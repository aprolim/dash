<!-- components/admin/SenadorSelector.vue -->
<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative" ref="rootRef">
      <button
        type="button"
        @click="abierto = !abierto"
        class="w-full flex items-center gap-3 px-3 py-2 border rounded-lg text-left bg-white hover:bg-gray-50 transition-colors"
        :class="error ? 'border-red-400' : 'border-gray-300'"
      >
        <template v-if="seleccionado">
          <img
            v-if="seleccionado.foto"
            :src="seleccionado.foto"
            :alt="seleccionado.name"
            class="w-8 h-8 rounded-full object-cover bg-gray-100"
            @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ seleccionado.name }}</p>
            <p class="text-xs text-gray-500 truncate">
              {{ seleccionado.department }} · {{ seleccionado.partyShort }}
            </p>
          </div>
          <span
            @click.stop="limpiar"
            class="text-gray-400 hover:text-red-500 text-lg leading-none px-1 cursor-pointer"
            title="Quitar"
          >
            ×
          </span>
        </template>
        <template v-else>
          <span class="text-sm text-gray-500 flex-1">— Selecciona un senador —</span>
          <span class="text-gray-400">▼</span>
        </template>
      </button>

      <div
        v-if="abierto"
        class="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-hidden flex flex-col"
      >
        <div class="p-2 border-b">
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            placeholder="Buscar por nombre, partido o departamento…"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500"
            @keydown.esc="abierto = false"
          />
        </div>
        <div class="overflow-y-auto flex-1">
          <button
            v-for="s in filtrados"
            :key="s.id"
            type="button"
            @click="seleccionar(s)"
            class="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
          >
            <img
              v-if="s.foto"
              :src="s.foto"
              :alt="s.name"
              class="w-8 h-8 rounded-full object-cover bg-gray-100"
              @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ s.name }}</p>
              <p class="text-xs text-gray-500 truncate">
                {{ s.department }} · {{ s.partyShort }}
              </p>
            </div>
            <span v-if="modelValue === s.id" class="text-primary-600 text-sm font-bold">✓</span>
          </button>
          <div v-if="filtrados.length === 0" class="px-3 py-6 text-center text-sm text-gray-500">
            Sin resultados
          </div>
        </div>
      </div>
    </div>

    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import type { SenadorTitular } from '~/composables/useDirectiva'

const props = defineProps<{
  modelValue: number
  label: string
  senadores: SenadorTitular[]
  required?: boolean
  error?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const abierto = ref(false)
const query = ref('')

const seleccionado = computed(() => {
  return props.senadores.find((s) => s.id === props.modelValue) || null
})

const filtrados = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.senadores
  return props.senadores.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.partyShort.toLowerCase().includes(q) ||
      s.party.toLowerCase().includes(q)
  )
})

watch(abierto, async (v) => {
  if (v) {
    query.value = ''
    await nextTick()
    inputRef.value?.focus()
  }
})

const seleccionar = (s: SenadorTitular) => {
  emit('update:modelValue', s.id)
  abierto.value = false
}

const limpiar = () => {
  emit('update:modelValue', 0)
}

const onClickOutside = (e: MouseEvent) => {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    abierto.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>