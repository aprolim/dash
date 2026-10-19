<!-- components/admin/CambiarEstadoModal.vue -->
<template>
  <Modal
    :model-value="modelValue"
    title="Cambiar estado del proyecto de ley"
    size="xl"
    @update:model-value="cerrar"
  >
    <div class="flex flex-col h-full space-y-5">
      
      <!-- Info del documento -->
      <div v-if="documento" class="bg-gray-50 rounded-lg p-3 shrink-0">
        <p class="text-sm text-gray-700">
          <strong>Nº:</strong> {{ documento.numero }} &nbsp;·&nbsp;
          <strong>Código:</strong> {{ documento.codigo }}
        </p>
        <p class="text-xs text-gray-500 line-clamp-2 mt-1">
          {{ documento.asunto }}
        </p>
        <p class="text-xs text-gray-600 mt-2">
          <strong>Estado actual:</strong> {{ documento.estadoLey || '—' }}
        </p>
      </div>

      <!-- Selector de estado -->
      <div class="shrink-0">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Nuevo estado <span class="text-red-500">*</span>
        </label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            v-for="estado in estadosDisponibles"
            :key="estado.value"
            type="button"
            @click="seleccionarEstado(estado.value)"
            :disabled="loading"
            class="px-3 py-3 rounded-lg border-2 text-sm font-medium text-left transition-all disabled:opacity-50"
            :class="nuevoEstado === estado.value
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-700'"
          >
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ estado.icon }}</span>
              <span>{{ estado.label }}</span>
            </div>
          </button>
        </div>
        <p v-if="!nuevoEstado" class="mt-1 text-xs text-gray-500">
          Selecciona el nuevo estado al que quieres migrar este proyecto.
        </p>
      </div>

      <!-- Campos condicionales -->
      <div v-if="nuevoEstado" class="border-t pt-4 space-y-4">
        <p class="text-sm font-medium text-gray-700">
          Campos para pasar a <strong>{{ nuevoEstado }}</strong>
          <span class="text-xs font-normal text-gray-500 ml-1">(puedes completarlos ahora o después)</span>
        </p>

        <!-- APROBADO / APROBADO CON MODIFICACIONES -->
        <template v-if="['APROBADO', 'APROBADO CON MODIFICACIONES'].includes(nuevoEstado)">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Aprobación</label>
              <input v-model="datos.fechaAprobacion" type="date" class="w-full px-3 py-2 border rounded-md text-sm border-gray-300" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Remisión a Diputados</label>
              <input v-model="datos.fechaRemisionDiputados" type="date" class="w-full px-3 py-2 border rounded-md text-sm border-gray-300" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">N° Ley</label>
            <input v-model.number="datos.numeroLey" type="number" min="1" class="w-48 px-3 py-2 border rounded-md text-sm border-gray-300" placeholder="Ej: 1763" />
            <p class="mt-1 text-xs text-gray-500">Debe ser único a nivel global.</p>
          </div>
        </template>

        <!-- SANCIONADO -->
        <template v-if="nuevoEstado === 'SANCIONADO'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Sanción</label>
              <input v-model="datos.fechaSancion" type="date" class="w-full px-3 py-2 border rounded-md text-sm border-gray-300" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Remisión al Ejecutivo</label>
              <input v-model="datos.fechaRemisionEjecutivo" type="date" class="w-full px-3 py-2 border rounded-md text-sm border-gray-300" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">N° Ley</label>
            <input v-model.number="datos.numeroLey" type="number" min="1" class="w-48 px-3 py-2 border rounded-md text-sm border-gray-300" placeholder="Ej: 1763" />
          </div>
        </template>

        <!-- RECHAZADO -->
        <template v-if="nuevoEstado === 'RECHAZADO'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Rechazo</label>
              <input v-model="datos.fechaRechazo" type="date" class="w-full px-3 py-2 border rounded-md text-sm border-gray-300" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Remisión a Diputados</label>
              <input v-model="datos.fechaRemisionDiputados" type="date" class="w-full px-3 py-2 border rounded-md text-sm border-gray-300" />
            </div>
          </div>
        </template>

        <!-- ARCHIVO ANEXO (OBLIGATORIO) -->
        <div class="border-t pt-4 bg-amber-50/50 -mx-6 px-6 pb-2">
          <div class="flex items-start justify-between mb-2">
            <div>
              <p class="text-sm font-medium text-gray-900">
                Archivo Anexo (Informe de Comisión) <span class="text-red-500">*</span>
              </p>
              <p class="text-xs text-gray-600 mt-0.5">
                Obligatorio para confirmar el cambio a <strong>{{ nuevoEstado }}</strong>.
              </p>
            </div>
          </div>

          <div v-if="datos.archivoAnexo.length > 0" class="space-y-2 mb-3">
            <div v-for="(anexo, idx) in datos.archivoAnexo" :key="idx" class="bg-white rounded-lg p-3 flex items-center gap-3 border border-gray-200">
              <span class="text-2xl">📎</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">{{ anexo.originalName || anexo.filename }}</p>
                <a :href="anexo.url" target="_blank" class="text-xs text-blue-600 hover:underline">Ver PDF →</a>
              </div>
              <button type="button" @click="quitarAnexo(idx)" class="text-red-500 hover:text-red-700 text-xl" title="Quitar anexo">✕</button>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <label class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2" :class="{ 'opacity-50 cursor-not-allowed': uploadingAnexo || loading }">
              <span>📎 Agregar anexo</span>
              <input ref="anexoInput" type="file" accept="application/pdf" class="hidden" :disabled="uploadingAnexo || loading" @change="handleAnexoSelect" />
            </label>
            <span v-if="uploadingAnexo" class="text-sm text-gray-500 flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> Subiendo...
            </span>
          </div>
          <p v-if="anexoError" class="mt-2 text-xs text-red-600">{{ anexoError }}</p>
          <p v-if="errores.archivoAnexo" class="mt-2 text-xs text-red-600 font-medium">{{ errores.archivoAnexo }}</p>
        </div>
      </div>

      <!-- Error general -->
      <div v-if="errorGeneral" class="bg-red-50 border border-red-200 rounded-lg p-3 shrink-0">
        <p class="text-sm text-red-800">{{ errorGeneral }}</p>
      </div>

      <!-- 🔥 BOTONES CORREGIDOS (Usando Flex estricto) -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t shrink-0">
        <button 
          type="button" 
          @click="cerrar" 
          :disabled="loading" 
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button 
          type="button" 
          @click="confirmar" 
          :disabled="loading || !nuevoEstado || datos.archivoAnexo.length === 0" 
          class="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ loading ? 'Cambiando...' : 'Confirmar cambio' }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import { useDocumentosLegislativos, type UploadResult } from '~/composables/useDocumentosLegislativos'
import type { DocumentoLegislativo } from '~/composables/useDocumentosLegislativos'
import type { TipoDocumento } from '~/utils/documentoTypes'

const props = defineProps<{
  modelValue: boolean
  documento: DocumentoLegislativo | null
  tipoActual: TipoDocumento
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', payload: { estadoLey: string; datos: any }): void
}>()

const { uploadPDF } = useDocumentosLegislativos()

const estadosDisponibles = [
  { value: 'APROBADO', label: 'Aprobado', icon: '🔵' },
  { value: 'SANCIONADO', label: 'Sancionado', icon: '🟣' },
  { value: 'APROBADO CON MODIFICACIONES', label: 'Con Modificaciones', icon: '🟡' },
  { value: 'RECHAZADO', label: 'Rechazado', icon: '🔴' }
]

const nuevoEstado = ref('')
const datos = reactive({
  fechaAprobacion: '',
  fechaRemisionDiputados: '',
  fechaSancion: '',
  fechaRemisionEjecutivo: '',
  fechaRechazo: '',
  numeroLey: null as number | null,
  archivoAnexo: [] as Array<{ url: string; filename: string; originalName: string; size: number }>
})

const errores = reactive<Record<string, string>>({})
const errorGeneral = ref('')
const anexoError = ref('')
const uploadingAnexo = ref(false)
const anexoInput = ref<HTMLInputElement | null>(null)

watch(() => props.modelValue, (abierto) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = abierto ? 'hidden' : ''
  }
  if (!abierto) return

  nuevoEstado.value = ''
  datos.fechaAprobacion = ''
  datos.fechaRemisionDiputados = ''
  datos.fechaSancion = ''
  datos.fechaRemisionEjecutivo = ''
  datos.fechaRechazo = ''
  datos.numeroLey = null
  datos.archivoAnexo = []
  Object.keys(errores).forEach(k => delete errores[k])
  errorGeneral.value = ''
  anexoError.value = ''
})

const seleccionarEstado = (estado: string) => {
  if (props.loading) return
  nuevoEstado.value = estado
  Object.keys(errores).forEach(k => delete errores[k])
}

const validar = (): boolean => {
  Object.keys(errores).forEach(k => delete errores[k])
  errorGeneral.value = ''

  if (!nuevoEstado.value) {
    errorGeneral.value = 'Selecciona el nuevo estado.'
    return false
  }

  if (!datos.archivoAnexo || datos.archivoAnexo.length === 0) {
    errores.archivoAnexo = 'Adjunta al menos un informe de comisión'
    return false
  }

  return true
}

const handleAnexoSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.type !== 'application/pdf') {
    anexoError.value = 'Solo se permiten archivos PDF.'
    return
  }

  uploadingAnexo.value = true
  anexoError.value = ''

  try {
    const result: UploadResult = await uploadPDF(props.tipoActual, file)
    datos.archivoAnexo.push({
      url: result.url,
      filename: result.filename,
      originalName: result.originalName,
      size: result.size
    })
    delete errores.archivoAnexo
  } catch (err: any) {
    anexoError.value = err.message || 'Error al subir el anexo'
  } finally {
    uploadingAnexo.value = false
    if (anexoInput.value) anexoInput.value.value = ''
  }
}

const quitarAnexo = (idx: number) => {
  datos.archivoAnexo.splice(idx, 1)
}

const confirmar = () => {
  if (!validar()) return

  const payload: any = {
    estadoLey: nuevoEstado.value,
    archivoAnexo: datos.archivoAnexo
  }

  if (datos.fechaAprobacion) payload.fechaAprobacion = datos.fechaAprobacion
  if (datos.fechaRemisionDiputados) payload.fechaRemisionDiputados = datos.fechaRemisionDiputados
  if (datos.fechaSancion) payload.fechaSancion = datos.fechaSancion
  if (datos.fechaRemisionEjecutivo) payload.fechaRemisionEjecutivo = datos.fechaRemisionEjecutivo
  if (datos.fechaRechazo) payload.fechaRechazo = datos.fechaRechazo
  if (datos.numeroLey) payload.numeroLey = datos.numeroLey

  emit('confirm', { estadoLey: nuevoEstado.value, datos: payload })
}

const cerrar = () => {
  if (props.loading) return
  emit('update:modelValue', false)
}
</script>