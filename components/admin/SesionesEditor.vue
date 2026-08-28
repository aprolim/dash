<!-- components/admin/SesionesEditor.vue -->
<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">🎥 Videos de Sesiones</h2>
        <p class="text-sm text-gray-500 mt-1">
          Los 3 videos que aparecen en la sección "Sesiones" + 1 video para "En Vivo"
        </p>
      </div>
      <button 
        @click="cargarVideos" 
        :disabled="loading"
        class="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        🔄 Actualizar
      </button>
    </div>
    
    <div v-if="loading" class="flex justify-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-[#E03636] border-t-transparent rounded-full animate-spin"></div>
      <p class="ml-3 text-gray-500">Cargando videos...</p>
    </div>
    
    <div v-else class="space-y-6">
      
      <!-- 🔴 VIDEO EN VIVO (NUEVO) -->
      <div class="border-2 border-red-400 rounded-lg p-4 bg-red-50" :class="!videos[3]?.isActive ? 'opacity-70' : ''">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full text-sm font-bold animate-pulse">🔴</span>
            <h3 class="font-medium text-gray-900">EN VIVO</h3>
            <span class="text-xs text-red-600 font-semibold">(Transmisión actual)</span>
          </div>
          <label class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Activo</span>
            <input type="checkbox" v-model="videos[3].isActive" class="toggle">
          </label>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input 
              v-model="videos[3].title" 
              type="text" 
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E03636] focus:border-[#E03636]"
              placeholder="Ej: Sesión Plenaria del Senado - EN VIVO"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL de YouTube</label>
            <input 
              v-model="videos[3].url" 
              type="text" 
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E03636] focus:border-[#E03636]"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </div>
        <div v-if="videos[3]?.youtubeId" class="mt-2 text-xs text-gray-400">
          Embed URL: https://www.youtube.com/embed/{{ videos[3].youtubeId }}
        </div>
        <div v-if="videos[3]?.isActive && videos[3]?.url" class="mt-3 p-2 bg-red-100 border border-red-300 rounded-lg">
          <p class="text-sm text-red-700 flex items-center gap-2">
            <span class="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            <strong>🔴 TRANSMISIÓN ACTIVA</strong> - Este video se mostrará como "En Vivo" en el portal
          </p>
        </div>
      </div>

      <!-- Separador -->
      <div class="border-t-2 border-dashed border-gray-300 py-2">
        <p class="text-sm text-gray-400 text-center">⬇️ Videos de sesiones grabadas ⬇️</p>
      </div>
      
      <!-- Video 1 - Último de la lista -->
      <div class="border rounded-lg p-4" :class="videos[0]?.isActive === false ? 'bg-gray-50 opacity-70' : ''">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center justify-center w-8 h-8 bg-[#E03636] text-white rounded-full text-sm font-bold">1</span>
            <h3 class="font-medium text-gray-900">Último video (más reciente)</h3>
          </div>
          <label class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Activo</span>
            <input type="checkbox" v-model="videos[0].isActive" class="toggle">
          </label>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input 
              v-model="videos[0].title" 
              type="text" 
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E03636] focus:border-[#E03636]"
              placeholder="Ej: Sesión Plenaria del Senado - 6 de junio 2026"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL de YouTube</label>
            <input 
              v-model="videos[0].url" 
              type="text" 
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E03636] focus:border-[#E03636]"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </div>
        <div v-if="videos[0]?.youtubeId" class="mt-2 text-xs text-gray-400">
          Embed URL: https://www.youtube.com/embed/{{ videos[0].youtubeId }}
        </div>
      </div>
      
      <!-- Video 2 - Penúltimo -->
      <div class="border rounded-lg p-4" :class="videos[1]?.isActive === false ? 'bg-gray-50 opacity-70' : ''">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center justify-center w-8 h-8 bg-[#E03636] text-white rounded-full text-sm font-bold">2</span>
            <h3 class="font-medium text-gray-900">Penúltimo video</h3>
          </div>
          <label class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Activo</span>
            <input type="checkbox" v-model="videos[1].isActive" class="toggle">
          </label>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input 
              v-model="videos[1].title" 
              type="text" 
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E03636] focus:border-[#E03636]"
              placeholder="Ej: 90 Sesión Ordinaria - 30 de mayo 2026"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL de YouTube</label>
            <input 
              v-model="videos[1].url" 
              type="text" 
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E03636] focus:border-[#E03636]"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </div>
        <div v-if="videos[1]?.youtubeId" class="mt-2 text-xs text-gray-400">
          Embed URL: https://www.youtube.com/embed/{{ videos[1].youtubeId }}
        </div>
      </div>
      
      <!-- Video 3 - Antepenúltimo -->
      <div class="border rounded-lg p-4" :class="videos[2]?.isActive === false ? 'bg-gray-50 opacity-70' : ''">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center justify-center w-8 h-8 bg-[#E03636] text-white rounded-full text-sm font-bold">3</span>
            <h3 class="font-medium text-gray-900">Antepenúltimo video</h3>
          </div>
          <label class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Activo</span>
            <input type="checkbox" v-model="videos[2].isActive" class="toggle">
          </label>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input 
              v-model="videos[2].title" 
              type="text" 
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E03636] focus:border-[#E03636]"
              placeholder="Ej: 88 Sesión Ordinaria - 23 de mayo 2026"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL de YouTube</label>
            <input 
              v-model="videos[2].url" 
              type="text" 
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E03636] focus:border-[#E03636]"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </div>
        <div v-if="videos[2]?.youtubeId" class="mt-2 text-xs text-gray-400">
          Embed URL: https://www.youtube.com/embed/{{ videos[2].youtubeId }}
        </div>
      </div>
      
      <div class="flex justify-end pt-4 border-t">
        <button 
          @click="guardarTodos" 
          :disabled="guardando"
          class="px-4 py-2 bg-[#E03636] text-white rounded-lg hover:bg-[#C12F2F] disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="guardando" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ guardando ? 'Guardando...' : 'Guardar todos los cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const API_BASE_URL = 'http://demoback.senado.gob.bo/api'

interface SesionVideo {
  position: number
  title: string
  url: string
  youtubeId: string
  isActive: boolean
  isLive?: boolean  // 🔥 NUEVO: Para identificar el video en vivo
}

const loading = ref(false)
const guardando = ref(false)

// 🔥 AHORA SON 4 VIDEOS: posición 0,1,2 = normales, posición 3 = LIVE
const videos = ref<SesionVideo[]>([
  { position: 1, title: '', url: '', youtubeId: '', isActive: true, isLive: false },
  { position: 2, title: '', url: '', youtubeId: '', isActive: true, isLive: false },
  { position: 3, title: '', url: '', youtubeId: '', isActive: true, isLive: false },
  { position: 4, title: '', url: '', youtubeId: '', isActive: false, isLive: true }  // 🔥 VIDEO EN VIVO
])

// Extraer YouTube ID
const extractYoutubeId = (url: string): string => {
  if (!url) return ''
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/
  const match = url.match(regex)
  return match ? match[1] : ''
}

// Cargar videos desde el backend
const cargarVideos = async () => {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE_URL}/sesiones`)
    const result = await response.json()
    
    if (result.success && result.data) {
      result.data.forEach((video: SesionVideo) => {
        const index = videos.value.findIndex(v => v.position === video.position)
        if (index !== -1) {
          videos.value[index] = { 
            ...videos.value[index], 
            ...video,
            isLive: video.position === 4 // 🔥 Marcar posición 4 como LIVE
          }
        }
      })
    }
  } catch (error) {
    console.error('Error cargando videos:', error)
    alert('Error al cargar los videos de sesiones')
  } finally {
    loading.value = false
  }
}

// Guardar todos los videos (incluyendo el LIVE)
const guardarTodos = async () => {
  guardando.value = true
  
  // Validar URLs
  for (const video of videos.value) {
    if (video.url && !extractYoutubeId(video.url)) {
      const nombre = video.isLive ? 'EN VIVO' : `${video.position === 1 ? 'primer' : video.position === 2 ? 'segundo' : 'tercer'} video`
      alert(`La URL del ${nombre} no es válida`)
      guardando.value = false
      return
    }
  }
  
  try {
    const token = localStorage.getItem('auth_token')
    
    for (const video of videos.value) {
      const youtubeId = extractYoutubeId(video.url)
      
      const response = await fetch(`${API_BASE_URL}/sesiones/${video.position}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: video.title,
          url: video.url,
          youtubeId: youtubeId,
          isActive: video.isActive,
          isLive: video.isLive || false
        })
      })
      
      if (!response.ok) {
        throw new Error(`Error guardando video ${video.position}`)
      }
    }
    
    alert('✅ Todos los videos guardados correctamente')
    await cargarVideos()
  } catch (error) {
    console.error('Error guardando:', error)
    alert('❌ Error al guardar los videos')
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  cargarVideos()
})
</script>

<style scoped>
.toggle {
  width: 36px;
  height: 20px;
  appearance: none;
  background-color: #cbd5e1;
  border-radius: 9999px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle:checked {
  background-color: #E03636;
}

.toggle::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: white;
  top: 2px;
  left: 2px;
  transition: transform 0.2s;
}

.toggle:checked::before {
  transform: translateX(16px);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>