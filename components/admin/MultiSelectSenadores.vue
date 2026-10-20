<!-- components/admin/MultiSelectSenadores.vue -->
<template>
  <div class="multi-select" ref="rootRef">
    <!-- Chips de seleccionados -->
    <div
      class="w-full min-h-[42px] px-2 py-1.5 border rounded-md bg-white flex flex-wrap gap-1.5 items-center cursor-text"
      :class="error ? 'border-red-400' : 'border-gray-300 focus-within:ring-2 focus-within:ring-primary-500'"
      @click="focusInput"
    >
      <span
        v-for="sel in seleccionados"
        :key="sel.value"
        class="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-full pl-2 pr-1 py-0.5 text-xs font-medium"
      >
        <span class="truncate max-w-[220px]" :title="sel.value">{{ sel.value }}</span>
        <button
          type="button"
          class="text-blue-600 hover:text-blue-800 font-bold leading-none px-1"
          :disabled="disabled"
          @click.stop="quitar(sel.value)"
          title="Quitar"
        >
          ×
        </button>
      </span>

      <input
        ref="inputRef"
        v-model="query"
        type="text"
        :disabled="disabled"
        :placeholder="seleccionados.length === 0 ? placeholder : 'Agregar otro…'"
        class="flex-1 min-w-[120px] outline-none text-sm bg-transparent py-1"
        @input="onInput"
        @focus="onFocus"
        @keydown.enter.prevent="seleccionarPrimero"
        @keydown.backspace="onBackspace"
        @keydown.esc="cerrar"
      />

      <span v-if="loading" class="text-xs text-gray-400 pr-1">
        <span class="inline-block w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></span>
      </span>
    </div>

    <!-- Dropdown -->
    <div
      v-if="abierto && (resultados.length > 0 || (!loading && query.trim().length >= 2))"
      class="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
    >
      <button
        v-for="s in resultados"
        :key="s.value"
        type="button"
        class="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
        @mousedown.prevent="seleccionar(s)"
      >
        <span class="text-lg">👤</span>
        <span class="text-sm text-gray-800 truncate">{{ s.value }}</span>
      </button>

      <div
        v-if="!loading && query.trim().length >= 2 && resultados.length === 0"
        class="px-3 py-3 text-sm text-gray-500 text-center"
      >
        Sin resultados para "{{ query }}"
      </div>
    </div>

    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
    <p v-else-if="!seleccionados.length" class="mt-1 text-xs text-gray-500">
      Debes seleccionar al menos un senador.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import {
  useLegislativosCatalogos,
  type CatalogoItem
} from '~/composables/useLegislativosCatalogos'

const props = defineProps<{
  modelValue: string[]
  placeholder?: string
  disabled?: boolean
  error?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const { getSenadores } = useLegislativosCatalogos()

const todos = ref<CatalogoItem[]>([])
const loading = ref(false)
const cargado = ref(false)

const query = ref('')
const abierto = ref(false)
const resultados = ref<CatalogoItem[]>([])

const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const seleccionados = computed<{ value: string }[]>(() => {
  const valores = Array.isArray(props.modelValue) ? props.modelValue : []
  return valores.map((v) => ({ value: v }))
})

const cargarCatalogo = async () => {
  if (cargado.value) return
  loading.value = true
  try {
    todos.value = await getSenadores()
    cargado.value = true
  } catch (err: any) {
    console.error('❌ Error cargando senadores:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarCatalogo()
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})

const filtrar = () => {
  const q = query.value.trim().toLowerCase()
  const yaSeleccionados = new Set(Array.isArray(props.modelValue) ? props.modelValue : [])

  if (!q) {
    resultados.value = todos.value
      .filter((s) => !yaSeleccionados.has(s.value))
      .slice(0, 50)
    return
  }

  resultados.value = todos.value
    .filter((s) => {
      if (yaSeleccionados.has(s.value)) return false
      return s.value.toLowerCase().includes(q)
    })
    .slice(0, 50)
}

let debounce: ReturnType<typeof setTimeout> | undefined

const onInput = () => {
  abierto.value = true
  if (debounce) clearTimeout(debounce)
  debounce = setTimeout(filtrar, 150)
}

const onFocus = () => {
  abierto.value = true
  filtrar()
}

const onBackspace = () => {
  if (query.value === '' && Array.isArray(props.modelValue) && props.modelValue.length > 0) {
    const nuevo = [...props.modelValue]
    nuevo.pop()
    emit('update:modelValue', nuevo)
  }
}

const seleccionarPrimero = () => {
  if (resultados.value.length > 0) {
    seleccionar(resultados.value[0])
  }
}

const seleccionar = (s: CatalogoItem) => {
  if (props.disabled) return
  const actuales = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  if (!actuales.includes(s.value)) {
    actuales.push(s.value)
    emit('update:modelValue', actuales)
  }
  query.value = ''
  resultados.value = []
  abierto.value = false
  nextTick(() => inputRef.value?.focus())
}

const quitar = (value: string) => {
  if (props.disabled) return
  const actuales = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  emit(
    'update:modelValue',
    actuales.filter((v) => v !== value)
  )
}

const focusInput = () => {
  if (!props.disabled) inputRef.value?.focus()
}

const cerrar = () => {
  abierto.value = false
  query.value = ''
}

const onClickOutside = (e: MouseEvent) => {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    cerrar()
  }
}

watch(todos, () => {
  if (abierto.value) filtrar()
})
</script>

<style scoped>
.multi-select {
  position: relative;
}
</style>