<!-- components/admin/DocumentoLegislativoForm.vue -->
<template>
  <form @submit.prevent="enviar" class="space-y-5">
    <!-- Info del tipo -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <p class="text-sm text-blue-800">
        <strong>{{ config.label }}</strong>
      </p>
      <p class="text-xs text-blue-700 mt-1">
        Los campos marcados con <span class="text-red-500">*</span> son obligatorios.
      </p>
    </div>

    <!-- Grid de campos básicos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Nº (bloqueado en edición) -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Nº <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="form.numero"
          type="number"
          min="1"
          required
          :disabled="esEdicion"
          class="mt-1 block w-full px-3 py-2 border rounded-md text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          :class="errores.numero ? 'border-red-400' : 'border-gray-300'"
        />
        <p v-if="errores.numero" class="mt-1 text-xs text-red-600">{{ errores.numero }}</p>
        <p v-else-if="esEdicion" class="mt-1 text-xs text-amber-600">
          ⚠️ El número no se puede modificar. Si necesitas corregirlo, elimina este registro y crea uno nuevo.
        </p>
      </div>

      <!-- Código -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Código o Nombre <span class="text-red-500">*</span>
        </label>
        <input
          v-model.trim="form.codigo"
          type="text"
          required
          maxlength="100"
          :placeholder="`Ej: ${config.prefijoCodigo} N° 01/2025-2026`"
          class="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
          :class="errores.codigo ? 'border-red-400' : 'border-gray-300'"
        />
        <p v-if="errores.codigo" class="mt-1 text-xs text-red-600">{{ errores.codigo }}</p>
      </div>

      <!-- Fecha de Ingreso -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Fecha de Ingreso <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.fechaIngreso"
          type="date"
          required
          class="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
          :class="errores.fechaIngreso ? 'border-red-400' : 'border-gray-300'"
        />
        <p v-if="errores.fechaIngreso" class="mt-1 text-xs text-red-600">{{ errores.fechaIngreso }}</p>
      </div>

      <!-- Peticionario / Proyectista -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          {{ labelPeticionario }} <span class="text-red-500">*</span>
        </label>
        <input
          v-model.trim="form.peticionario"
          type="text"
          required
          maxlength="300"
          placeholder="Ej: Betty Canaviri Villanueva (LISTA DE SENADORES)"
          class="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
          :class="errores.peticionario ? 'border-red-400' : 'border-gray-300'"
        />
        <p v-if="errores.peticionario" class="mt-1 text-xs text-red-600">{{ errores.peticionario }}</p>
      </div>
    </div>

    <!-- Asunto (full width, textarea) -->
    <div>
      <label class="block text-sm font-medium text-gray-700">
        Asunto <span class="text-red-500">*</span>
      </label>
      <textarea
        v-model.trim="form.asunto"
        rows="5"
        required
        maxlength="5000"
        placeholder="Escribe aquí el asunto o referencia tal como aparece en el documento oficial..."
        class="mt-1 block w-full px-3 py-2 border rounded-md text-sm resize-y"
        :class="errores.asunto ? 'border-red-400' : 'border-gray-300'"
      ></textarea>
      <div class="flex justify-between items-center mt-1">
        <p v-if="errores.asunto" class="text-xs text-red-600">{{ errores.asunto }}</p>
        <p v-else class="text-xs text-gray-500">Máximo 5000 caracteres.</p>
        <p class="text-xs text-gray-400">{{ form.asunto?.length || 0 }} / 5000</p>
      </div>
    </div>

    <!-- Destinatario y tipo -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Destinatario <span class="text-red-500">*</span>
        </label>
        <input
          v-model.trim="form.destinatario"
          type="text"
          required
          maxlength="300"
          placeholder="Ej: Ministro de Planificación del Desarrollo"
          class="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
          :class="errores.destinatario ? 'border-red-400' : 'border-gray-300'"
        />
        <p v-if="errores.destinatario" class="mt-1 text-xs text-red-600">{{ errores.destinatario }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">
          Tipo de Destinatario <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.tipoDestinatario"
          required
          class="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
          :class="errores.tipoDestinatario ? 'border-red-400' : 'border-gray-300'"
        >
          <option value="">-- Selecciona --</option>
          <option v-for="t in TIPOS_DESTINATARIO" :key="t" :value="t">{{ t }}</option>
        </select>
        <p v-if="errores.tipoDestinatario" class="mt-1 text-xs text-red-600">{{ errores.tipoDestinatario }}</p>
      </div>
    </div>

    <!-- Fechas específicas por tipo -->
    <div class="border-t pt-5">
      <p class="text-sm font-medium text-gray-700 mb-3">Fechas del proceso</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Fecha de Remisión al Destinatario (todos) -->
        <div>
          <label class="block text-sm text-gray-600">Fecha de Remisión al Destinatario</label>
          <input
            v-model="form.fechaRemisionDestinatario"
            type="date"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <!-- PIE: fechaRespuesta, fechaRemisionPeticionario -->
        <template v-if="tipo === 'peticion-informe-escrito'">
          <div>
            <label class="block text-sm text-gray-600">Fecha de Respuesta</label>
            <input
              v-model="form.fechaRespuesta"
              type="date"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600">Fecha de Remisión al Peticionario</label>
            <input
              v-model="form.fechaRemisionPeticionario"
              type="date"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </template>

        <!-- PIO: fechaRealizacion, fechaReprogramacion, fechaRealizacionFinal -->
        <template v-if="tipo === 'peticion-informe-oral'">
          <div>
            <label class="block text-sm text-gray-600">Fecha de Realización</label>
            <input
              v-model="form.fechaRealizacion"
              type="date"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600">Fecha de Reprogramación</label>
            <input
              v-model="form.fechaReprogramacion"
              type="date"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600">Fecha de Realización (final)</label>
            <input
              v-model="form.fechaRealizacionFinal"
              type="date"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </template>

        <!-- Gestión: fechaAprobacion + sesion -->
        <template v-if="esGestion">
          <div>
            <label class="block text-sm text-gray-600">Fecha de Aprobación</label>
            <input
              v-model="form.fechaAprobacion"
              type="date"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div v-if="tipo === 'resolucion-camaral'">
            <label class="block text-sm text-gray-600">Sesión</label>
            <select
              v-model="form.sesion"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">-- Selecciona --</option>
              <option value="PUBLICA">PÚBLICA</option>
              <option value="RESERVADA">RESERVADA</option>
            </select>
          </div>
        </template>
      </div>
    </div>

    <!-- Conminatoria (solo PIE) -->
    <div v-if="tipo === 'peticion-informe-escrito'">
      <label class="block text-sm font-medium text-gray-700">Conminatoria</label>
      <input
        v-model.trim="form.conminatoria"
        type="text"
        maxlength="500"
        placeholder="Ej: NÚMERO DE CONMINATORIA"
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      />
    </div>

    <!-- Observación (todos) -->
    <div>
      <label class="block text-sm font-medium text-gray-700">Observaciones</label>
      <textarea
        v-model.trim="form.observacion"
        rows="3"
        maxlength="1000"
        placeholder="Observaciones adicionales (opcional)"
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
      ></textarea>
      <p class="mt-1 text-xs text-gray-400">{{ form.observacion?.length || 0 }} / 1000</p>
    </div>

    <!-- Archivo PDF -->
    <div class="border-t pt-5">
      <p class="text-sm font-medium text-gray-700 mb-3">Archivo PDF</p>

      <div v-if="!form.archivo.url" class="flex items-center gap-3">
        <label class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2">
          <span>📄 Subir PDF</span>
          <input
            ref="fileInput"
            type="file"
            accept="application/pdf"
            class="hidden"
            @change="handlePdfSelect"
          />
        </label>
        <span v-if="uploadingPDF" class="text-sm text-gray-500 flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          Subiendo...
        </span>
      </div>

      <div v-else class="bg-gray-100 rounded-lg p-3 flex items-center gap-3">
        <span class="text-2xl">📄</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800 truncate">
            {{ form.archivo.originalName || form.archivo.filename }}
          </p>
          <a
            :href="form.archivo.url"
            target="_blank"
            class="text-xs text-primary-600 hover:underline"
          >
            Ver PDF actual →
          </a>
        </div>
        <button
          type="button"
          @click="quitarPdf"
          class="text-red-500 hover:text-red-700 text-xl"
          title="Quitar PDF"
        >
          ✕
        </button>
      </div>

      <p v-if="uploadError" class="mt-2 text-xs text-red-600">{{ uploadError }}</p>
    </div>

    <!-- Error general -->
    <div v-if="errorGeneral" class="bg-red-50 border border-red-200 rounded-lg p-3">
      <p class="text-sm text-red-800">{{ errorGeneral }}</p>
    </div>

    <!-- Botones -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <NuxtLink
        to="/admin/legislativos"
        class="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
      >
        Cancelar
      </NuxtLink>
      <button
        type="submit"
        :disabled="saving"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm flex items-center gap-2"
      >
        <span v-if="saving" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        {{ saving ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Crear documento') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
  getConfigTipo,
  TIPOS_DESTINATARIO,
  type TipoDocumento
} from '~/utils/documentoTypes'
import { useDocumentosLegislativos, type DocumentoLegislativo, type UploadResult } from '~/composables/useDocumentosLegislativos'

const props = defineProps<{
  tipo: TipoDocumento
  documento?: DocumentoLegislativo | null
  saving?: boolean
  serverError?: string
}>()

const emit = defineEmits<{
  (e: 'submit', payload: Partial<DocumentoLegislativo>): void
}>()

const { uploadPDF } = useDocumentosLegislativos()

const config = computed(() => getConfigTipo(props.tipo)!)
const esEdicion = computed(() => !!props.documento?._id)

const labelPeticionario = computed(() => {
  if (props.tipo.startsWith('peticion-')) return 'Peticionario'
  if (props.tipo.startsWith('proyecto-') || props.tipo === 'ley-promulgada') return 'Proyectista'
  return 'Proyectista'
})

const esGestion = computed(() => config.value?.bloque === 'gestion')

// ============================================
// FORM
// ============================================
const form = reactive({
  numero: null as number | null,
  codigo: '',
  fechaIngreso: '',
  peticionario: '',
  asunto: '',
  destinatario: '',
  tipoDestinatario: '',
  fechaRemisionDestinatario: '',
  fechaRespuesta: '',
  fechaRemisionPeticionario: '',
  conminatoria: '',
  fechaRealizacion: '',
  fechaReprogramacion: '',
  fechaRealizacionFinal: '',
  fechaAprobacion: '',
  sesion: '',
  observacion: '',
  archivo: {
    url: null as string | null,
    filename: '',
    originalName: '',
    size: 0
  }
})

const errores = reactive<Record<string, string>>({})
const errorGeneral = ref('')
const uploadError = ref('')

const fileInput = ref<HTMLInputElement | null>(null)
const uploadingPDF = ref(false)

// ============================================
// CARGA INICIAL (si es edición)
// ============================================
const cargarDesdeDocumento = (doc: DocumentoLegislativo) => {
  form.numero = doc.numero
  form.codigo = doc.codigo
  form.fechaIngreso = doc.fechaIngreso ? doc.fechaIngreso.split('T')[0] : ''
  form.peticionario = doc.peticionario || doc.proyectista || ''
  form.asunto = doc.asunto
  form.destinatario = doc.destinatario || ''
  form.tipoDestinatario = doc.tipoDestinatario || ''
  form.fechaRemisionDestinatario = doc.fechaRemisionDestinatario?.split('T')[0] || ''
  form.fechaRespuesta = doc.fechaRespuesta?.split('T')[0] || ''
  form.fechaRemisionPeticionario = doc.fechaRemisionPeticionario?.split('T')[0] || ''
  form.conminatoria = doc.conminatoria || ''
  form.fechaRealizacion = doc.fechaRealizacion?.split('T')[0] || ''
  form.fechaReprogramacion = doc.fechaReprogramacion?.split('T')[0] || ''
  form.fechaRealizacionFinal = doc.fechaRealizacionFinal?.split('T')[0] || ''
  form.fechaAprobacion = doc.fechaAprobacion?.split('T')[0] || ''
  form.sesion = doc.sesion || ''
  form.observacion = doc.observacion || ''
  form.archivo = doc.archivo || { url: null, filename: '', originalName: '', size: 0 }
}

watch(
  () => props.documento,
  (doc) => {
    if (doc) {
      cargarDesdeDocumento(doc)
    }
  },
  { immediate: true }
)

// ============================================
// VALIDACIÓN
// ============================================
const validar = (): boolean => {
  Object.keys(errores).forEach(k => delete errores[k])
  errorGeneral.value = ''

  config.value.camposObligatorios.forEach((campo) => {
    const valor = (form as any)[campo]
    const vacio =
      valor === null ||
      valor === undefined ||
      (typeof valor === 'string' && valor.trim() === '') ||
      (typeof valor === 'number' && valor <= 0)
    if (vacio) {
      errores[campo] = 'Este campo es obligatorio'
    }
  })

  if (form.codigo && form.codigo.length > 100) {
    errores.codigo = 'Máximo 100 caracteres'
  }
  if (form.asunto && form.asunto.length > 5000) {
    errores.asunto = 'Máximo 5000 caracteres'
  }
  if (form.peticionario && form.peticionario.length > 300) {
    errores.peticionario = 'Máximo 300 caracteres'
  }

  return Object.keys(errores).length === 0
}

// ============================================
// ENVÍO
// ============================================
const enviar = () => {
  if (!validar()) {
    errorGeneral.value = 'Corrige los errores antes de guardar.'
    return
  }

  const payload: Partial<DocumentoLegislativo> = {
    numero: form.numero!,
    codigo: form.codigo,
    fechaIngreso: form.fechaIngreso,
    asunto: form.asunto,
    destinatario: form.destinatario || undefined,
    tipoDestinatario: form.tipoDestinatario || undefined,
    fechaRemisionDestinatario: form.fechaRemisionDestinatario || null,
    observacion: form.observacion || '',
    archivo: form.archivo
  }

  payload.peticionario = form.peticionario

  if (props.tipo === 'peticion-informe-escrito') {
    payload.fechaRespuesta = form.fechaRespuesta || null
    payload.fechaRemisionPeticionario = form.fechaRemisionPeticionario || null
    payload.conminatoria = form.conminatoria || ''
  }

  if (props.tipo === 'peticion-informe-oral') {
    payload.fechaRealizacion = form.fechaRealizacion || null
    payload.fechaReprogramacion = form.fechaReprogramacion || null
    payload.fechaRealizacionFinal = form.fechaRealizacionFinal || null
  }

  if (esGestion.value) {
    payload.fechaAprobacion = form.fechaAprobacion || null
    if (props.tipo === 'resolucion-camaral') {
      payload.sesion = form.sesion || null
    }
  }

  emit('submit', payload)
}

// ============================================
// UPLOAD PDF
// ============================================
const handlePdfSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.type !== 'application/pdf') {
    uploadError.value = 'Solo se permiten archivos PDF.'
    return
  }

  uploadingPDF.value = true
  uploadError.value = ''

  try {
    const result: UploadResult = await uploadPDF(props.tipo, file)
    form.archivo = {
      url: result.url,
      filename: result.filename,
      originalName: result.originalName,
      size: result.size
    }
  } catch (err: any) {
    uploadError.value = err.message || 'Error al subir el PDF'
  } finally {
    uploadingPDF.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const quitarPdf = () => {
  form.archivo = { url: null, filename: '', originalName: '', size: 0 }
}

// ============================================
// MONTAJE
// ============================================
onMounted(() => {
  if (!esEdicion.value && form.numero === null) {
    form.numero = null
  }
})
</script>