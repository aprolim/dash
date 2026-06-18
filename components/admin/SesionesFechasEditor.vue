<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">📅 Fechas de Sesiones</h2>
        <p class="text-sm text-gray-500 mt-1">Gestiona las fechas que aparecen en el calendario de sesiones</p>
      </div>
      <button 
        @click="abrirModalCrear"
        class="px-4 py-2 bg-[#E03636] text-white rounded-lg hover:bg-[#C12F2F] transition flex items-center gap-2"
      >
        <span class="text-lg">+</span>
        Agregar fecha
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-[#E03636] border-t-transparent rounded-full animate-spin"></div>
      <p class="ml-3 text-gray-500">Cargando fechas...</p>
    </div>

    <div v-else-if="fechas.length === 0" class="text-center py-12 text-gray-500">
      <div class="text-4xl mb-3">📅</div>
      <p>No hay fechas de sesiones registradas</p>
      <p class="text-sm text-gray-400 mt-1">Haz clic en "Agregar fecha" para comenzar</p>
    </div>

    <div v-else>
      <!-- Selector de mes/año -->
      <div class="flex items-center gap-4 mb-4">
        <button @click="cambiarMes(-1)" class="p-2 rounded-lg hover:bg-gray-100">
          ←
        </button>
        <span class="font-medium text-lg">{{ nombreMes }} {{ añoActual }}</span>
        <button @click="cambiarMes(1)" class="p-2 rounded-lg hover:bg-gray-100">
          →
        </button>
        <button @click="irAlMesActual" class="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
          Hoy
        </button>
      </div>

      <!-- Tabla de fechas -->
      <div class="overflow-x-auto">
        <table class="w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="fecha in fechasFiltradas" :key="fecha._id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm font-medium text-gray-900">
                {{ formatearFecha(fecha.fecha) }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ fecha.titulo || 'Sesión del Senado' }}
              </td>
              <td class="px-4 py-3 text-sm">
                <span :class="getTipoClass(fecha.tipo)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ getTipoLabel(fecha.tipo) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">
                <span :class="fecha.esActivo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ fecha.esActivo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right text-sm">
                <button @click="toggleFecha(fecha)" class="text-gray-500 hover:text-gray-700 mr-3">
                  {{ fecha.esActivo ? '⏸️' : '▶️' }}
                </button>
                <button @click="abrirModalEditar(fecha)" class="text-blue-600 hover:text-blue-800 mr-3">
                  ✏️
                </button>
                <button @click="confirmarEliminar(fecha)" class="text-red-600 hover:text-red-800">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Crear/Editar -->
    <Modal v-model="showModal" :title="modalTitulo">
      <form @submit.prevent="guardarFecha" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Fecha <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.fecha"
            type="date"
            required
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E03636] focus:border-[#E03636]"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            v-model="form.titulo"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E03636] focus:border-[#E03636]"
            placeholder="Ej: Sesión Plenaria Ordinaria"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            v-model="form.descripcion"
            rows="2"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E03636] focus:border-[#E03636] resize-none"
            placeholder="Descripción de la sesión"
          ></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            v-model="form.tipo"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E03636] focus:border-[#E03636]"
          >
            <option value="ordinaria">Ordinaria</option>
            <option value="extraordinaria">Extraordinaria</option>
            <option value="especial">Especial</option>
          </select>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            @click="showModal = false"
            class="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="guardando"
            class="px-4 py-2 bg-[#E03636] text-white rounded-lg hover:bg-[#C12F2F] disabled:opacity-50 flex items-center gap-2"
          >
            <span v-if="guardando" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ guardando ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Toast -->
    <div v-if="toast.show" class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50" :class="toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Modal from '~/components/ui/Modal.vue'

const API_BASE_URL = 'http://demoback.senado.gob.bo/api'

// Estado
const fechas = ref<any[]>([])
const loading = ref(false)
const guardando = ref(false)
const showModal = ref(false)
const editando = ref(false)
const fechaSeleccionada = ref<any>(null)
const mesActual = ref(new Date().getMonth())
const añoActual = ref(new Date().getFullYear())

const form = ref({
  fecha: '',
  titulo: '',
  descripcion: '',
  tipo: 'ordinaria'
})

const toast = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

// Computed
const nombreMes = computed(() => {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return meses[mesActual.value]
})

const fechasFiltradas = computed(() => {
  return fechas.value.filter(f => {
    const fecha = new Date(f.fecha)
    return fecha.getMonth() === mesActual.value && fecha.getFullYear() === añoActual.value
  })
})

const modalTitulo = computed(() => 
  editando.value ? 'Editar Fecha de Sesión' : 'Agregar Fecha de Sesión'
)

// Funciones
const formatearFecha = (fecha: string) => {
  const d = new Date(fecha)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}

const getTipoClass = (tipo: string) => {
  const clases: Record<string, string> = {
    ordinaria: 'bg-blue-100 text-blue-800',
    extraordinaria: 'bg-yellow-100 text-yellow-800',
    especial: 'bg-purple-100 text-purple-800'
  }
  return clases[tipo] || 'bg-gray-100 text-gray-800'
}

const getTipoLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    ordinaria: 'Ordinaria',
    extraordinaria: 'Extraordinaria',
    especial: 'Especial'
  }
  return labels[tipo] || tipo
}

const cambiarMes = (delta: number) => {
  const nuevaFecha = new Date(añoActual.value, mesActual.value + delta, 1)
  mesActual.value = nuevaFecha.getMonth()
  añoActual.value = nuevaFecha.getFullYear()
}

const irAlMesActual = () => {
  const ahora = new Date()
  mesActual.value = ahora.getMonth()
  añoActual.value = ahora.getFullYear()
}

// Cargar fechas
const cargarFechas = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_BASE_URL}/sesiones/fechas/admin`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const result = await response.json()
    if (result.success) {
      fechas.value = result.data || []
    }
  } catch (error) {
    console.error('Error cargando fechas:', error)
    mostrarToast('Error al cargar las fechas', 'error')
  } finally {
    loading.value = false
  }
}

// Guardar fecha
const guardarFecha = async () => {
  if (!form.value.fecha) {
    mostrarToast('La fecha es requerida', 'error')
    return
  }

  guardando.value = true
  try {
    const token = localStorage.getItem('auth_token')
    const url = editando.value 
      ? `${API_BASE_URL}/sesiones/fechas/${fechaSeleccionada.value._id}`
      : `${API_BASE_URL}/sesiones/fechas`
    
    const method = editando.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form.value)
    })
    
    const result = await response.json()
    
    if (result.success) {
      mostrarToast(editando.value ? 'Fecha actualizada' : 'Fecha creada', 'success')
      showModal.value = false
      await cargarFechas()
    } else {
      mostrarToast(result.message || 'Error al guardar', 'error')
    }
  } catch (error) {
    console.error('Error guardando:', error)
    mostrarToast('Error al guardar', 'error')
  } finally {
    guardando.value = false
  }
}

// Toggle activo/inactivo
const toggleFecha = async (fecha: any) => {
  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_BASE_URL}/sesiones/fechas/${fecha._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ esActivo: !fecha.esActivo })
    })
    const result = await response.json()
    if (result.success) {
      await cargarFechas()
      mostrarToast(fecha.esActivo ? 'Fecha desactivada' : 'Fecha activada', 'success')
    }
  } catch (error) {
    console.error('Error toggling:', error)
    mostrarToast('Error al cambiar estado', 'error')
  }
}

// Eliminar fecha
const confirmarEliminar = (fecha: any) => {
  if (confirm(`¿Eliminar la sesión del ${formatearFecha(fecha.fecha)}?`)) {
    eliminarFecha(fecha)
  }
}

const eliminarFecha = async (fecha: any) => {
  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_BASE_URL}/sesiones/fechas/${fecha._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const result = await response.json()
    if (result.success) {
      await cargarFechas()
      mostrarToast('Fecha eliminada', 'success')
    }
  } catch (error) {
    console.error('Error eliminando:', error)
    mostrarToast('Error al eliminar', 'error')
  }
}

// Abrir modales
const abrirModalCrear = () => {
  editando.value = false
  fechaSeleccionada.value = null
  form.value = { fecha: '', titulo: '', descripcion: '', tipo: 'ordinaria' }
  showModal.value = true
}

const abrirModalEditar = (fecha: any) => {
  editando.value = true
  fechaSeleccionada.value = fecha
  form.value = {
    fecha: new Date(fecha.fecha).toISOString().split('T')[0],
    titulo: fecha.titulo || '',
    descripcion: fecha.descripcion || '',
    tipo: fecha.tipo || 'ordinaria'
  }
  showModal.value = true
}

// Toast
const mostrarToast = (message: string, type: 'success' | 'error') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

onMounted(() => {
  cargarFechas()
})
</script>