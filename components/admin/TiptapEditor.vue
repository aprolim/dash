<!-- components/admin/TiptapEditor.vue -->
<template>
  <div class="tiptap-editor">
    <!-- Barra de herramientas -->
    <div class="toolbar mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap gap-1 sticky top-0 z-10">
      <!-- Texto -->
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
      
      <!-- Títulos -->
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
      
      <!-- Listas -->
      <button
        type="button"
        @click="editor?.chain().focus().toggleBulletList().run()"
        :class="{ 'bg-gray-200': editor?.isActive('bulletList') }"
        class="p-2 rounded hover:bg-gray-200 transition"
        title="Lista desordenada"
      >
        • Lista
      </button>
      
      <button
        type="button"
        @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="{ 'bg-gray-200': editor?.isActive('orderedList') }"
        class="p-2 rounded hover:bg-gray-200 transition"
        title="Lista ordenada"
      >
        1. Lista
      </button>
      
      <div class="w-px h-6 bg-gray-300 mx-1"></div>
      
      <!-- Cita y línea -->
      <button
        type="button"
        @click="editor?.chain().focus().toggleBlockquote().run()"
        :class="{ 'bg-gray-200': editor?.isActive('blockquote') }"
        class="p-2 rounded hover:bg-gray-200 transition"
        title="Cita"
      >
        ""
      </button>
      
      <button
        type="button"
        @click="editor?.chain().focus().setHorizontalRule().run()"
        class="p-2 rounded hover:bg-gray-200 transition"
        title="Línea horizontal"
      >
        ―
      </button>
      
      <div class="w-px h-6 bg-gray-300 mx-1"></div>
      
      <!-- Imagen y enlace -->
      <button
        type="button"
        @click="addImage"
        class="p-2 rounded hover:bg-gray-200 transition"
        title="Insertar imagen"
      >
        🖼️
      </button>
      
      <button
        type="button"
        @click="setLink"
        :class="{ 'bg-gray-200': editor?.isActive('link') }"
        class="p-2 rounded hover:bg-gray-200 transition"
        title="Insertar enlace"
      >
        🔗
      </button>
      
      <div class="w-px h-6 bg-gray-300 mx-1"></div>
      
      <!-- Deshacer/Rehacer -->
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
      
      <!-- Limpiar formato -->
      <button
        type="button"
        @click="editor?.chain().focus().clearNodes().unsetAllMarks().run()"
        class="p-2 rounded hover:bg-gray-200 text-red-500 transition"
        title="Limpiar formato"
      >
        ✖️ Limpiar
      </button>
    </div>
    
    <!-- Área de edición -->
    <EditorContent :editor="editor" class="min-h-[400px]" />
    
    <!-- Vista previa (opcional) -->
    <div v-if="showPreview" class="mt-4 border-t pt-4">
      <div class="flex justify-between items-center mb-2">
        <h4 class="text-sm font-medium text-gray-700">Vista previa</h4>
        <button @click="showPreview = false" class="text-xs text-gray-500 hover:text-gray-700">Ocultar</button>
      </div>
      <div class="p-4 bg-gray-50 rounded-lg prose prose-sm max-w-none" v-html="editor?.getHTML()"></div>
    </div>
    
    <button 
      v-if="!showPreview"
      @click="showPreview = true" 
      class="mt-2 text-sm text-primary-600 hover:text-primary-700"
    >
      Ver vista previa
    </button>
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

const showPreview = ref(false)

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3]
      }
    }),
    Image.configure({
      inline: true,
      allowBase64: true,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
    Underline,
    Placeholder.configure({
      placeholder: props.placeholder || 'Escribe el contenido de la noticia aquí...',
    }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// Insertar imagen
const addImage = () => {
  const url = window.prompt('URL de la imagen:')
  if (url && editor.value) {
    editor.value.chain().focus().setImage({ src: url }).run()
  }
}

// Insertar enlace
const setLink = () => {
  const previousUrl = editor.value?.getAttributes('link').href
  const url = window.prompt('URL del enlace:', previousUrl)
  
  if (url === null) return
  
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

// Actualizar contenido cuando cambia externamente
watch(() => props.modelValue, (newValue) => {
  const isSame = editor.value?.getHTML() === newValue
  if (!isSame && editor.value) {
    editor.value.commands.setContent(newValue)
  }
})

onUnmounted(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.tiptap-editor :deep(.ProseMirror) {
  @apply p-4 border border-gray-300 rounded-lg min-h-[400px] focus:outline-none focus:ring-2 focus:ring-primary-500;
}

.tiptap-editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  @apply text-gray-400 float-left h-0 pointer-events-none;
}

/* Estilos para el contenido */
.tiptap-editor :deep(.ProseMirror h1) {
  @apply text-3xl font-bold mt-6 mb-4;
}

.tiptap-editor :deep(.ProseMirror h2) {
  @apply text-2xl font-bold mt-5 mb-3;
}

.tiptap-editor :deep(.ProseMirror h3) {
  @apply text-xl font-semibold mt-4 mb-2;
}

.tiptap-editor :deep(.ProseMirror ul) {
  @apply list-disc pl-5 my-3;
}

.tiptap-editor :deep(.ProseMirror ol) {
  @apply list-decimal pl-5 my-3;
}

.tiptap-editor :deep(.ProseMirror blockquote) {
  @apply border-l-4 border-gray-300 pl-4 my-3 text-gray-600 italic;
}

.tiptap-editor :deep(.ProseMirror a) {
  @apply text-primary-600 underline;
}

.tiptap-editor :deep(.ProseMirror img) {
  @apply max-w-full h-auto rounded-lg my-2;
}

.tiptap-editor :deep(.ProseMirror hr) {
  @apply my-4 border-gray-300;
}

/* Toolbar responsive */
@media (max-width: 768px) {
  .toolbar {
    @apply gap-0.5;
  }
  .toolbar button {
    @apply p-1.5 text-sm;
  }
}
</style>