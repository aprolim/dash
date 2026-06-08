<template>
  <div class="tiptap-editor">
    <!-- Barra de herramientas -->
    <div class="toolbar mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap gap-1 sticky top-0 z-10">
      <button
        type="button"
        @click="editor?.chain().focus().toggleBold().run()"
        :class="{ 'bg-gray-200': editor?.isActive('bold') }"
        class="p-2 rounded hover:bg-gray-200 transition"
        title="Negrita"
      >
        <strong>N</strong>
      </button>
      
      <button
        type="button"
        @click="editor?.chain().focus().toggleItalic().run()"
        :class="{ 'bg-gray-200': editor?.isActive('italic') }"
        class="p-2 rounded hover:bg-gray-200 transition"
        title="Cursiva"
      >
        <em>C</em>
      </button>
      
      <button
        type="button"
        @click="editor?.chain().focus().toggleUnderline().run()"
        :class="{ 'bg-gray-200': editor?.isActive('underline') }"
        class="p-2 rounded hover:bg-gray-200 transition"
        title="Subrayado"
      >
        <u>S</u>
      </button>
      
      <div class="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'bg-gray-200': editor?.isActive('heading', { level: 1 }) }"
        class="p-2 rounded hover:bg-gray-200 transition text-sm font-bold"
      >
        H1
      </button>
      
      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'bg-gray-200': editor?.isActive('heading', { level: 2 }) }"
        class="p-2 rounded hover:bg-gray-200 transition text-sm font-bold"
      >
        H2
      </button>
      
      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'bg-gray-200': editor?.isActive('heading', { level: 3 }) }"
        class="p-2 rounded hover:bg-gray-200 transition text-sm font-bold"
      >
        H3
      </button>
      
      <div class="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button
        type="button"
        @click="editor?.chain().focus().toggleBulletList().run()"
        :class="{ 'bg-gray-200': editor?.isActive('bulletList') }"
        class="p-2 rounded hover:bg-gray-200 transition"
        title="Lista con viñetas"
      >
        <span class="text-lg">•</span> Lista
      </button>
      
      <button
        type="button"
        @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="{ 'bg-gray-200': editor?.isActive('orderedList') }"
        class="p-2 rounded hover:bg-gray-200 transition"
        title="Lista numerada"
      >
        <span class="text-sm">1.</span> Lista
      </button>
      
      <div class="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button
        type="button"
        @click="abrirModalCita"
        class="p-2 rounded hover:bg-gray-200 transition"
        title="Insertar cita"
      >
        <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Cita
      </button>
      
      <div class="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button
        type="button"
        @click="showVideoModal = true"
        class="p-2 rounded hover:bg-gray-200 transition"
        title="Insertar video (YouTube)"
      >
        📹 Video
      </button>
      
      <div class="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button
        type="button"
        @click="editor?.chain().focus().undo().run()"
        class="p-2 rounded hover:bg-gray-200 transition"
        title="Deshacer"
      >
        ↩️
      </button>
      
      <button
        type="button"
        @click="editor?.chain().focus().redo().run()"
        class="p-2 rounded hover:bg-gray-200 transition"
        title="Rehacer"
      >
        ↪️
      </button>
      
      <div class="flex-1"></div>
      
      <button
        type="button"
        @click="editor?.chain().focus().clearNodes().unsetAllMarks().run()"
        class="p-2 rounded hover:bg-gray-200 text-red-500 transition"
        title="Limpiar formato"
      >
        ✖️ Limpiar
      </button>
    </div>
    
    <EditorContent :editor="editor" class="min-h-[400px]" />
    
    <!-- Modal para insertar cita -->
    <Teleport to="body">
      <div v-if="showCitaModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click.self="showCitaModal = false">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div class="px-6 py-4 border-b">
            <h3 class="text-lg font-semibold text-gray-900">Insertar Cita</h3>
          </div>
          
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Autor</label>
              <input 
                v-model="citaForm.autor" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Ej: Leonilda Zurita Vargas"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cargo / Rol</label>
              <input 
                v-model="citaForm.cargo" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Ej: Senadora por Potosí"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Texto de la cita</label>
              <textarea 
                v-model="citaForm.texto" 
                rows="4" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                placeholder="Escribe el texto de la cita aquí..."
              ></textarea>
            </div>
          </div>
          
          <div class="px-6 py-4 border-t flex justify-end gap-3">
            <button 
              @click="showCitaModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              @click="guardarCita" 
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Insertar Cita
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal para insertar video -->
    <Teleport to="body">
      <div v-if="showVideoModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click.self="showVideoModal = false">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div class="px-6 py-4 border-b">
            <h3 class="text-lg font-semibold text-gray-900">Insertar Video</h3>
          </div>
          
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                URL del Video <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="videoForm.url" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p class="text-xs text-gray-500 mt-1">Soporta YouTube</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Título (opcional)
              </label>
              <input 
                v-model="videoForm.title" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Título del video"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <textarea 
                v-model="videoForm.caption" 
                rows="2" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                placeholder="Descripción del video..."
              ></textarea>
            </div>
          </div>
          
          <div class="px-6 py-4 border-t flex justify-end gap-3">
            <button 
              @click="showVideoModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              @click="guardarVideo" 
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Insertar Video
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// Estado para modales
const showCitaModal = ref(false)
const editandoCita = ref(false)
const citaSeleccionada = ref<any>(null)
const showVideoModal = ref(false)

const citaForm = ref({ autor: '', cargo: '', texto: '' })
const videoForm = ref({ url: '', title: '', caption: '' })

const abrirModalCita = () => {
  editandoCita.value = false
  citaSeleccionada.value = null
  citaForm.value = { autor: '', cargo: '', texto: '' }
  showCitaModal.value = true
}

// 🔥 Guardar cita en línea nueva
const guardarCita = () => {
  if (!citaForm.value.texto.trim()) {
    alert('El texto de la cita es requerido')
    return
  }
  
  const autor = citaForm.value.autor || 'Senado de Bolivia'
  const cargo = citaForm.value.cargo || 'Cámara de Senadores'
  const texto = citaForm.value.texto
  
  // Crear marcador con saltos de línea
  const marker = `\n\n[[CITA:${autor}|${cargo}|${texto}]]\n\n`
  
  editor.value?.chain().focus().insertContent(marker).run()
  
  citaForm.value = { autor: '', cargo: '', texto: '' }
  showCitaModal.value = false
}

// 🔥 Guardar video en línea nueva
const guardarVideo = () => {
  if (!videoForm.value.url.trim()) {
    alert('La URL del video es requerida')
    return
  }
  
  // Crear marcador con saltos de línea
  const marker = `\n\n[[VIDEO:${videoForm.value.url}|${videoForm.value.title || 'Video'}|${videoForm.value.caption || ''}]]\n\n`
  
  editor.value?.chain().focus().insertContent(marker).run()
  
  videoForm.value = { url: '', title: '', caption: '' }
  showVideoModal.value = false
}

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2, 3] }, bulletList: {}, orderedList: {} }),
    Image.configure({ inline: true, allowBase64: true }),
    Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank' } }),
    Underline,
    Placeholder.configure({ placeholder: props.placeholder || 'Escribe el contenido aquí...' })
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  onCreate: () => console.log('✅ Editor creado')
})

onUnmounted(() => editor.value?.destroy())
</script>

<style scoped>
.tiptap-editor :deep(.ProseMirror) {
  @apply p-4 border border-gray-300 rounded-lg min-h-[400px] focus:outline-none focus:ring-2 focus:ring-primary-500;
}
.tiptap-editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  @apply text-gray-400 float-left h-0 pointer-events-none;
}
.tiptap-editor :deep(.ProseMirror h1) { @apply text-3xl font-bold mt-6 mb-4; }
.tiptap-editor :deep(.ProseMirror h2) { @apply text-2xl font-bold mt-5 mb-3; }
.tiptap-editor :deep(.ProseMirror h3) { @apply text-xl font-semibold mt-4 mb-2; }
.tiptap-editor :deep(.ProseMirror ul) { @apply list-disc pl-5 my-3; }
.tiptap-editor :deep(.ProseMirror ol) { @apply list-decimal pl-5 my-3; }
.tiptap-editor :deep(.ProseMirror li) { @apply mb-1; }
.tiptap-editor :deep(.ProseMirror a) { @apply text-primary-600 underline; }
.tiptap-editor :deep(.ProseMirror img) { @apply max-w-full h-auto rounded-lg my-2; }
</style>