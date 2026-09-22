<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">🔍 Gestión de Auditoría</h1>
      <p class="text-gray-600 mt-1">Administra los documentos de la Unidad de Auditoría Interna</p>
    </div>

    <!-- Tarjetas de módulos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- POA-UAI -->
      <NuxtLink
        to="/admin/auditoria/poa-uai"
        class="bg-white rounded-lg shadow hover:shadow-lg transition-all border-2 border-gray-100 hover:border-purple-300 p-6 group"
      >
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center text-2xl flex-shrink-0">
            📄
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
              POA - UAI
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              Plan Operativo Anual Individual. Sube y gestiona los PDFs por año.
            </p>
            <div class="mt-3 text-xs text-gray-500">
              <span class="inline-block bg-gray-100 px-2 py-1 rounded">Sin categorías</span>
              <span class="inline-block bg-gray-100 px-2 py-1 rounded ml-2">Solo PDFs por año</span>
            </div>
          </div>
          <div class="text-gray-400 group-hover:text-purple-500 transition-colors text-2xl">→</div>
        </div>
      </NuxtLink>

      <!-- Auditorías Ejecutadas -->
      <div class="bg-white rounded-lg shadow hover:shadow-lg transition-all border-2 border-gray-100 hover:border-blue-300 p-6 group">
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
            📋
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
              Auditorías Ejecutadas
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              Documentos organizados por categorías (Cumplimiento, Operativa, Confiabilidad)
            </p>
            <div class="mt-4 flex gap-3 flex-wrap">
              <NuxtLink
                to="/admin/auditoria/categorias/auditorias-ejecutadas"
                class="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
              >
                📁 Categorías
              </NuxtLink>
              <NuxtLink
                to="/admin/auditoria/documentos/auditorias-ejecutadas"
                class="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                📄 Documentos
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Informes de Actividades -->
      <div class="bg-white rounded-lg shadow hover:shadow-lg transition-all border-2 border-gray-100 hover:border-green-300 p-6 group">
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-lg bg-green-100 flex items-center justify-center text-2xl flex-shrink-0">
            📊
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
              Informes de Actividades
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              Documentos organizados por categorías (Anuales, Semestrales)
            </p>
            <div class="mt-4 flex gap-3 flex-wrap">
              <NuxtLink
                to="/admin/auditoria/categorias/informes-actividades"
                class="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium"
              >
                📁 Categorías
              </NuxtLink>
              <NuxtLink
                to="/admin/auditoria/documentos/informes-actividades"
                class="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                📄 Documentos
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Otras Actividades -->
      <div class="bg-white rounded-lg shadow hover:shadow-lg transition-all border-2 border-gray-100 hover:border-yellow-300 p-6 group">
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-lg bg-yellow-100 flex items-center justify-center text-2xl flex-shrink-0">
            📌
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 group-hover:text-yellow-700 transition-colors">
              Otras Actividades
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              Documentos organizados por categorías (Relevamientos, Seguimientos)
            </p>
            <div class="mt-4 flex gap-3 flex-wrap">
              <NuxtLink
                to="/admin/auditoria/categorias/otras-actividades"
                class="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 text-sm font-medium"
              >
                📁 Categorías
              </NuxtLink>
              <NuxtLink
                to="/admin/auditoria/documentos/otras-actividades"
                class="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
              >
                📄 Documentos
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info -->
    <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
      <p class="font-medium mb-1">💡 Cómo funciona:</p>
      <ul class="list-disc list-inside space-y-1 text-xs">
        <li><strong>POA-UAI</strong>: Cada año tiene un PDF. Solo puede haber un POA activo a la vez.</li>
        <li><strong>Auditorías Ejecutadas</strong>: Tiene 3 categorías (Cumplimiento, Operativa, Confiabilidad). Cada categoría tiene documentos con PDFs.</li>
        <li><strong>Informes de Actividades</strong>: Tiene 2 categorías (Anuales, Semestrales).</li>
        <li><strong>Otras Actividades</strong>: Tiene 2 categorías (Relevamientos, Seguimientos).</li>
        <li>Las <strong>categorías</strong> se pueden editar (nombre, icono, orden).</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth',
})
</script>