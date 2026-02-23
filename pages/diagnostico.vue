<!-- pages/diagnostico.vue -->
<template>
  <div>
    <div style="padding: 20px; font-family: Arial;">
      <h1 style="color: red; font-size: 24px;">🔍 DIAGNÓSTICO TAILWIND CSS</h1>
      
      <div style="margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 8px;">
        <h2 style="color: #333;">1. Verificación de archivos:</h2>
        <ul style="list-style: none; padding: 0;">
          <li>✅ app.vue: {{ archivos.appvue ? 'EXISTE' : 'NO EXISTE' }}</li>
          <li>✅ tailwind.config.js: {{ archivos.tailwindConfig ? 'EXISTE' : 'NO EXISTE' }}</li>
          <li>✅ assets/css/tailwind.css: {{ archivos.tailwindCss ? 'EXISTE' : 'NO EXISTE' }}</li>
          <li>✅ nuxt.config.ts: {{ archivos.nuxtConfig ? 'EXISTE' : 'NO EXISTE' }}</li>
        </ul>
      </div>
      
      <div style="margin: 20px 0; padding: 15px; background: #e0f7fa; border-radius: 8px;">
        <h2 style="color: #00796b;">2. Prueba de clases Tailwind:</h2>
        
        <!-- Clases que DEBEN funcionar -->
        <div class="mb-4">
          <h3>bg-red-500 + text-white:</h3>
          <div class="bg-red-500 text-white p-4 rounded">
            Este div debe tener fondo ROJO y texto BLANCO
          </div>
        </div>
        
        <div class="mb-4">
          <h3>bg-blue-500 + text-white:</h3>
          <div class="bg-blue-500 text-white p-4 rounded">
            Este div debe tener fondo AZUL y texto BLANCO
          </div>
        </div>
        
        <div class="mb-4">
          <h3>flex + space-x-4:</h3>
          <div class="flex space-x-4">
            <div class="bg-green-500 text-white p-3 rounded">Item 1</div>
            <div class="bg-yellow-500 text-white p-3 rounded">Item 2</div>
            <div class="bg-purple-500 text-white p-3 rounded">Item 3</div>
          </div>
        </div>
        
        <div>
          <h3>Controles:</h3>
          <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Botón Hover
          </button>
          <button class="ml-4 bg-gray-600 text-white px-4 py-2 rounded">
            Botón Gris
          </button>
        </div>
      </div>
      
      <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-radius: 8px;">
        <h2 style="color: #856404;">3. CSS Computado (Inspeccionar elemento):</h2>
        <p>Presiona F12 y verifica si las clases Tailwind aparecen en el panel de estilos.</p>
        <p>Si NO aparecen, Tailwind no está procesando.</p>
      </div>
      
      <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 8px;">
        <h2 style="color: #155724;">4. Posibles soluciones:</h2>
        <ol>
          <li>Verificar que tailwind.css tenga @tailwind base, components, utilities</li>
          <li>Verificar rutas en nuxt.config.ts</li>
          <li>Limpiar caché: rm -rf .nuxt .output node_modules/.vite</li>
          <li>Reiniciar servidor de desarrollo</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const archivos = ref({
  appvue: false,
  tailwindConfig: false,
  tailwindCss: false,
  nuxtConfig: false
})

onMounted(() => {
  // Simular verificación de archivos
  archivos.value = {
    appvue: true,
    tailwindConfig: true,
    tailwindCss: true,
    nuxtConfig: true
  }
})
</script>