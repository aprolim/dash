<!-- pages/admin/marco-normativo/index.vue -->
<template>
  <div>
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <p class="text-sm text-gray-600">
        Documentos que se muestran en
        <a
          href="https://senado.gob.bo/marco-normativo"
          target="_blank"
          class="text-primary-600 hover:underline"
        >senado.gob.bo/marco-normativo</a>
      </p>
      <NuxtLink
        :to="`/admin/marco-normativo/create?tipo=${tabActiva}`"
        class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
      >
        <span class="mr-2">+</span>
        {{ tabActiva === 'destacado' ? 'Nueva tarjeta' : 'Nuevo documento' }}
      </NuxtLink>
    </div>

    <!-- ============================================ -->
    <!-- PESTAÑAS                                     -->
    <!-- ============================================ -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex gap-6">
        <button
          v-for="tab in TABS"
          :key="tab.id"
          @click="cambiarTab(tab.id)"
          class="pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2"
          :class="tabActiva === tab.id
            ? tab.activaClass
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          <span>{{ tab.icon }}</span>
          {{ tab.label }}
          <span
            class="px-2 py-0.5 rounded-full text-xs font-bold"
            :class="tabActiva === tab.id ? 'bg-white/60' : 'bg-gray-100'"
          >
            {{ contarPorTipo(tab.id) }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Aviso de la pestaña activa -->
    <div
      v-if="tabActiva === 'destacado'"
      class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-900"
    >
      <strong>★ Tarjetas destacadas:</strong> se muestran arriba en el sitio público.
      El sitio muestra <strong>solo las 6 primeras</strong> por orden; si tenés más, las demás no se verán.
    </div>
    <div
      v-else
      class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-900"
    >
      <strong>📋 Acordeón:</strong> agrupadas por categoría en la lista desplegable.
      El orden define la posición dentro de su categoría.
    </div>

    <!-- Filtros -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-3 items-center">
      <div class="flex-1 min-w-[250px]">
        <input
          v-model="filtroQ"
          type="text"
          placeholder="Buscar por nombre o código..."
          class="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>

      <input
        v-if="tabActiva === 'acordeon'"
        v-model="filtroCategoria"
        type="text"
        list="cat-filtro"
        placeholder="Todas las categorías"
        class="px-3 py-2 border rounded-lg text-sm w-56"
      />
      <datalist id="cat-filtro">
        <option v-for="c in categoriasDisponibles" :key="c" :value="c" />
      </datalist>

      <label class="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" v-model="incluirInactivos" @change="cargar" />
        Incluir inactivos
      </label>

      <button
        @click="resetFiltros"
        class="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
      >
        Limpiar
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Cargando -->
    <div v-if="loading" class="text-center py-12 text-gray-500">Cargando...</div>

    <!-- ============================================ -->
    <!-- TABLA: DESTACADOS (con vista de tarjetas)     -->
    <!-- ============================================ -->
    <div v-else-if="tabActiva === 'destacado'" class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Orden</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Portada</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Gestión</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">PDF</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Estado</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(doc, idx) in listaActual"
            :key="doc._id"
            class="hover:bg-gray-50"
            :class="{ 'opacity-50': doc.eliminado }"
          >
            <!-- Orden -->
            <td class="px-4 py-3 text-sm">
              <div class="flex items-center gap-1">
                <span class="font-mono font-bold text-gray-900">{{ doc.orden }}</span>
                <div class="flex flex-col ml-1">
                  <button
                    @click="mover(doc, -1)"
                    :disabled="idx === 0"
                    class="text-gray-400 hover:text-gray-800 disabled:opacity-20 leading-none"
                    title="Subir"
                  >▲</button>
                  <button
                    @click="mover(doc, 1)"
                    :disabled="idx === listaActual.length - 1"
                    class="text-gray-400 hover:text-gray-800 disabled:opacity-20 leading-none"
                    title="Bajar"
                  >▼</button>
                </div>
              </div>
            </td>

            <!-- Portada -->
            <td class="px-4 py-3">
              <img
                v-if="doc.imagen"
                :src="doc.imagen"
                :alt="doc.nombre"
                class="w-12 h-16 object-cover rounded border border-gray-200"
              />
              <span v-else class="text-xs text-red-600 font-medium">Falta</span>
            </td>

            <!-- Nombre -->
            <td class="px-4 py-3 text-sm">
              <div class="font-medium text-gray-900">{{ doc.nombre }}</div>
              <div v-if="doc.codigo" class="text-xs text-gray-500 mt-0.5">{{ doc.codigo }}</div>
            </td>

            <td class="px-4 py-3 text-sm text-gray-600">{{ doc.gestion || '—' }}</td>

            <!-- PDF -->
            <td class="px-4 py-3 text-sm">
              <a
                v-if="doc.archivo?.url"
                :href="doc.archivo.url"
                target="_blank"
                class="text-primary-600 hover:underline"
              >Ver PDF</a>
              <span v-else class="text-red-600 font-medium">Falta</span>
            </td>

            <!-- Estado -->
            <td class="px-4 py-3 text-sm">
              <span
                v-if="doc.eliminado"
                class="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800"
              >Eliminado</span>
              <span
                v-else-if="doc.activo === false"
                class="px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700"
              >Inactivo</span>
              <span
                v-else
                class="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800"
              >Activo</span>
            </td>

            <!-- Acciones -->
            <td class="px-4 py-3 text-sm text-right whitespace-nowrap">
              <NuxtLink
                :to="`/admin/marco-normativo/edit/${doc._id}`"
                class="text-primary-600 hover:text-primary-800 font-medium mr-3"
              >Editar</NuxtLink>
              <button
                v-if="!doc.eliminado"
                @click="eliminar(doc)"
                class="text-red-600 hover:text-red-800 font-medium"
              >Eliminar</button>
              <button
                v-else
                @click="restaurar(doc)"
                class="text-green-600 hover:text-green-800 font-medium"
              >Restaurar</button>
            </td>
          </tr>

          <tr v-if="listaActual.length === 0">
            <td colspan="7" class="px-4 py-12 text-center text-gray-500">
              <template v-if="tabActiva === 'destacado'">
                No hay tarjetas destacadas.
                <NuxtLink to="/admin/marco-normativo/create?tipo=destacado" class="text-primary-600 hover:underline">
                  Crear la primera
                </NuxtLink>
              </template>
              <template v-else>
                No hay documentos en el acordeón.
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ============================================ -->
    <!-- TABLA: ACORDEÓN (agrupada por categoría)      -->
    <!-- ============================================ -->
    <div v-else class="space-y-6">
      <div
        v-for="grupo in gruposAcordeon"
        :key="grupo.nombre"
        class="bg-white rounded-lg shadow overflow-hidden"
      >
        <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-sm font-bold text-gray-800">
            📁 {{ grupo.nombre }}
            <span class="ml-2 text-xs font-normal text-gray-500">
              {{ grupo.documentos.length }} documento{{ grupo.documentos.length === 1 ? '' : 's' }}
            </span>
          </h3>
        </div>

        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-white">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Orden</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Gestión</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">PDF</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Estado</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(doc, idx) in grupo.documentos"
              :key="doc._id"
              class="hover:bg-gray-50"
              :class="{ 'opacity-50': doc.eliminado }"
            >
              <td class="px-4 py-3 text-sm">
                <div class="flex items-center gap-1">
                  <span class="font-mono font-bold text-gray-900">{{ doc.orden }}</span>
                  <div class="flex flex-col ml-1">
                    <button
                      @click="mover(doc, -1)"
                      :disabled="idx === 0"
                      class="text-gray-400 hover:text-gray-800 disabled:opacity-20 leading-none"
                      title="Subir"
                    >▲</button>
                    <button
                      @click="mover(doc, 1)"
                      :disabled="idx === grupo.documentos.length - 1"
                      class="text-gray-400 hover:text-gray-800 disabled:opacity-20 leading-none"
                      title="Bajar"
                    >▼</button>
                  </div>
                </div>
              </td>

              <td class="px-4 py-3 text-sm">
                <div class="font-medium text-gray-900">{{ doc.nombre }}</div>
                <div v-if="doc.codigo" class="text-xs text-gray-500 mt-0.5">{{ doc.codigo }}</div>
              </td>

              <td class="px-4 py-3 text-sm text-gray-600">{{ doc.gestion || '—' }}</td>

              <td class="px-4 py-3 text-sm">
                <a
                  v-if="doc.archivo?.url"
                  :href="doc.archivo.url"
                  target="_blank"
                  class="text-primary-600 hover:underline"
                >Ver PDF</a>
                <span v-else class="text-red-600 font-medium">Falta</span>
              </td>

              <td class="px-4 py-3 text-sm">
                <span
                  v-if="doc.eliminado"
                  class="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800"
                >Eliminado</span>
                <span
                  v-else-if="doc.activo === false"
                  class="px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700"
                >Inactivo</span>
                <span
                  v-else
                  class="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800"
                >Activo</span>
              </td>

              <td class="px-4 py-3 text-sm text-right whitespace-nowrap">
                <NuxtLink
                  :to="`/admin/marco-normativo/edit/${doc._id}`"
                  class="text-primary-600 hover:text-primary-800 font-medium mr-3"
                >Editar</NuxtLink>
                <button
                  v-if="!doc.eliminado"
                  @click="eliminar(doc)"
                  class="text-red-600 hover:text-red-800 font-medium"
                >Eliminar</button>
                <button
                  v-else
                  @click="restaurar(doc)"
                  class="text-green-600 hover:text-green-800 font-medium"
                >Restaurar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="gruposAcordeon.length === 0" class="bg-white rounded-lg shadow p-12 text-center text-gray-500">
        No hay documentos en el acordeón.
        <NuxtLink to="/admin/marco-normativo/create?tipo=acordeon" class="text-primary-600 hover:underline">
          Crear el primero
        </NuxtLink>
      </div>
    </div>

    <!-- Toast -->
    <div
      v-if="toast.show"
      class="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white"
      :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useMarcoNormativo } from '~/composables/useMarcoNormativo'
import type { MarcoNormativoItem } from '~/composables/useMarcoNormativo'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

type TipoUbicacion = 'destacado' | 'acordeon'

const TABS: { id: TipoUbicacion; label: string; icon: string; activaClass: string }[] = [
  { id: 'destacado', label: 'Destacados', icon: '★', activaClass: 'border-amber-500 text-amber-700' },
  { id: 'acordeon', label: 'Acordeón', icon: '📋', activaClass: 'border-blue-500 text-blue-700' }
]

const { getDocumentos, updateDocumento, deleteDocumento, restoreDocumento } = useMarcoNormativo()

// La colección es pequeña (decenas), así que cargamos todo y filtramos en cliente.
const todos = ref<MarcoNormativoItem[]>([])

const loading = ref(false)
const error = ref('')
const tabActiva = ref<TipoUbicacion>('destacado')

const filtroQ = ref('')
const filtroCategoria = ref('')
const incluirInactivos = ref(false)

const toast = reactive({ show: false, message: '', type: 'success' as 'success' | 'error' })

const mostrarToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3500)
}

// ============================================
// CLASIFICACIÓN (estado único)
// ============================================
const esDestacado = (d: MarcoNormativoItem) => d.destacado === true
const esAcordeon = (d: MarcoNormativoItem) => !d.destacado && !!d.categoria

/** Documentos de la pestaña activa, ya filtrados. */
const listaActual = computed(() => {
  const base = todos.value.filter((d) => {
    if (!incluirInactivos.value && d.activo === false) return false
    if (tabActiva.value === 'destacado') return esDestacado(d)
    return esAcordeon(d)
  })

  const q = filtroQ.value.trim().toLowerCase()
  return base
    .filter((d) => {
      if (!q) return true
      return (
        (d.nombre || '').toLowerCase().includes(q) ||
        (d.codigo || '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
})

/** Agrupación del acordeón por categoría. */
const gruposAcordeon = computed(() => {
  const q = filtroQ.value.trim().toLowerCase()
  const cat = filtroCategoria.value.trim().toLowerCase()

  const base = todos.value.filter((d) => {
    if (!incluirInactivos.value && d.activo === false) return false
    if (!esAcordeon(d)) return false
    if (cat && (d.categoria || '').toLowerCase() !== cat) return false
    if (q) {
      return (
        (d.nombre || '').toLowerCase().includes(q) ||
        (d.codigo || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const mapa = new Map<string, MarcoNormativoItem[]>()
  for (const d of base) {
    const nombre = (d.categoria || '').trim()
    if (!nombre) continue
    if (!mapa.has(nombre)) mapa.set(nombre, [])
    mapa.get(nombre)!.push(d)
  }

  return [...mapa.entries()]
    .map(([nombre, documentos]) => ({
      nombre,
      documentos: documentos.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
})

const categoriasDisponibles = computed(() => {
  const set = new Set<string>()
  todos.value.forEach((d) => {
    if (d.categoria && d.categoria.trim()) set.add(d.categoria.trim())
  })
  return [...set].sort()
})

const contarPorTipo = (tipo: TipoUbicacion) => {
  return todos.value.filter((d) => {
    if (!incluirInactivos.value && d.activo === false) return false
    return tipo === 'destacado' ? esDestacado(d) : esAcordeon(d)
  }).length
}

// ============================================
// CARGA
// ============================================
const cargar = async () => {
  loading.value = true
  error.value = ''

  try {
    // Se traen activos y eliminados para poder restaurarlos; el filtro
    // de "incluir inactivos" se aplica en cliente.
    const result = await getDocumentos({
      page: 1,
      limit: 200,
      incluirInactivos: true,
      incluirEliminados: true
    })
    todos.value = result.documentos
  } catch (err: any) {
    console.error(err)
    error.value = err.message || 'Error al cargar los documentos'
  } finally {
    loading.value = false
  }
}

// ============================================
// UI
// ============================================
const cambiarTab = (id: TipoUbicacion) => {
  tabActiva.value = id
}

// El filtrado de texto y categoría es reactivo (computed), no requiere handlers.

const resetFiltros = () => {
  filtroQ.value = ''
  filtroCategoria.value = ''
  incluirInactivos.value = false
}

// ============================================
// ORDEN (solo dentro del mismo grupo)
// ============================================
/**
 * Sube o baja un documento ±1 posición DENTRO de su propia lista ordenada.
 * Intercambia el `orden` con el vecino, de modo que nunca choca con los
 * documentos de la otra pestaña.
 */
const mover = async (doc: MarcoNormativoItem, delta: number) => {
  let lista: MarcoNormativoItem[]

  if (doc.destacado) {
    lista = listaActual.value
  } else {
    const grupo = gruposAcordeon.value.find((g) => g.nombre === doc.categoria)
    lista = grupo ? grupo.documentos : []
  }

  const idx = lista.findIndex((d) => d._id === doc._id)
  const otroIdx = idx + delta
  if (idx === -1 || otroIdx < 0 || otroIdx >= lista.length) return

  const vecino = lista[otroIdx]
  const ordenDoc = doc.orden ?? 0
  const ordenVecino = vecino.orden ?? 0

  // Si comparten orden, desplazar ±1 en la dirección correcta
  const nuevoDoc = ordenVecino === ordenDoc ? ordenDoc + delta : ordenVecino
  const nuevoVecino = ordenVecino === ordenDoc ? ordenVecino - delta : ordenDoc

  try {
    await Promise.all([
      updateDocumento(doc._id, { orden: nuevoDoc }),
      updateDocumento(vecino._id, { orden: nuevoVecino })
    ])
    await cargar()
    mostrarToast('Orden actualizado')
  } catch (err: any) {
    mostrarToast(err.message || 'No se pudo actualizar el orden', 'error')
    await cargar()
  }
}

// ============================================
// ELIMINAR / RESTAURAR
// ============================================
const eliminar = async (doc: MarcoNormativoItem) => {
  const motivo = window.prompt(
    `Motivo por el que se elimina «${doc.nombre}»:\n(dejar vacío para omitir)`
  )
  if (motivo === null) return

  try {
    await deleteDocumento(doc._id, motivo.trim())
    mostrarToast('Documento eliminado')
    await cargar()
  } catch (err: any) {
    mostrarToast(err.message || 'No se pudo eliminar', 'error')
  }
}

const restaurar = async (doc: MarcoNormativoItem) => {
  try {
    await restoreDocumento(doc._id)
    mostrarToast('Documento restaurado')
    await cargar()
  } catch (err: any) {
    mostrarToast(err.message || 'No se pudo restaurar', 'error')
  }
}

onMounted(cargar)
</script>
