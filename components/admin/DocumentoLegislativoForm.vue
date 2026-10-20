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
      <p v-if="config.estadoRequerido" class="text-xs text-blue-700 mt-1">
        Estado requerido para este tipo: <strong>{{ config.estadoRequerido }}</strong>
      </p>
    </div>

    <!-- Banner: modo edición con botón de estado -->
    <div
      v-if="esEdicion && esOrigenTransicion"
      class="bg-amber-50 border border-amber-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3"
    >
      <div class="text-sm text-amber-800">
        <strong>Estado actual:</strong> {{ form.estadoLey || '—' }}
        <span class="text-xs block text-amber-700 mt-0.5">
          Puedes cambiar el estado de este proyecto de ley.
        </span>
      </div>
      <button
        type="button"
        @click="abrirModalEstado"
        class="px-3 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm font-medium"
      >
        🔄 Cambiar estado
      </button>
    </div>

    <!-- Campos básicos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Nº -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Nº <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="form.numero"
          type="number"
          min="1"
          required
          :disabled="esNumeroBloqueado"
          class="mt-1 block w-full px-3 py-2 border rounded-md text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          :class="errores.numero ? 'border-red-400' : 'border-gray-300'"
        />
        <p v-if="errores.numero" class="mt-1 text-xs text-red-600">{{ errores.numero }}</p>
        <p v-else-if="esNumeroBloqueado" class="mt-1 text-xs text-amber-600">
          ⚠️ El número no se puede modificar.
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
          maxlength="150"
          :disabled="esCodigoBloqueado"
          :placeholder="`Ej: ${config.prefijoCodigo} N° 01/2025-2026`"
          class="mt-1 block w-full px-3 py-2 border rounded-md text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          :class="errores.codigo ? 'border-red-400' : 'border-gray-300'"
        />
        <p v-if="errores.codigo" class="mt-1 text-xs text-red-600">{{ errores.codigo }}</p>
        <p v-else-if="esCodigoBloqueado" class="mt-1 text-xs text-amber-600">
          ⚠️ El código no se puede modificar al editar.
        </p>
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

      <!-- Peticionario / Proyectista (MULTI-SELECT) -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          {{ labelPeticionario }} <span class="text-red-500">*</span>
        </label>
        <div class="mt-1">
          <MultiSelectSenadores
            v-model="form.peticionario"
            :disabled="esEdicion && esPeticionarioBloqueado"
            :error="errores.peticionario"
            placeholder="Buscar senador por nombre, partido o departamento…"
          />
        </div>
        <p v-if="esEdicion && esPeticionarioBloqueado" class="mt-1 text-xs text-amber-600">
          ⚠️ El {{ labelPeticionario }} no se puede modificar en este tipo de documento.
        </p>
      </div>
    </div>

    <!-- Asunto -->
    <div>
      <label class="block text-sm font-medium text-gray-700">
        Asunto o Referencia <span class="text-red-500">*</span>
      </label>
      <textarea
        v-model.trim="form.asunto"
        rows="4"
        required
        maxlength="5000"
        placeholder="Escribe el asunto tal como aparece en el documento..."
        class="mt-1 block w-full px-3 py-2 border rounded-md text-sm resize-y"
        :class="errores.asunto ? 'border-red-400' : 'border-gray-300'"
      ></textarea>
      <p v-if="errores.asunto" class="mt-1 text-xs text-red-600">{{ errores.asunto }}</p>
    </div>

    <!-- Campos Proyectos de Ley -->
    <div v-if="esProyectoLey" class="border-t pt-5 space-y-5">

      <!-- Nuevo o Reposición / PL Anterior -->
      <div
        v-if="tipo === 'proyecto-ley-tratamiento-senado' || tipo === 'proyecto-ley-aprobados'"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700">Nuevo o Reposición</label>
          <select
            v-model="form.esNuevoOReReposicion"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">-- Selecciona --</option>
            <option value="NUEVO">NUEVO</option>
            <option value="REPOSICIÓN">REPOSICIÓN</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">P.L. Anterior</label>
          <input
            v-model.trim="form.plAnterior"
            type="text"
            placeholder="Número del PL anterior"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      <!-- Comisiones (MULTI-SELECT) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Comisión I Remitida</label>
          <div class="mt-1">
            <MultiSelectComisiones
              v-model="form.comisionI"
              :error="errores.comisionI"
              placeholder="Buscar comisión…"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Fecha de Remisión Comisión I</label>
          <input
            v-model="form.fechaRemisionComisionI"
            type="date"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Comisión II</label>
          <div class="mt-1">
            <MultiSelectComisiones
              v-model="form.comisionII"
              :error="errores.comisionII"
              placeholder="Buscar comisión…"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Fecha de Remisión Comisión II</label>
          <input
            v-model="form.fechaRemisionComisionII"
            type="date"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      <!-- Estado + fechas específicas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Estado
            <span v-if="config.estadoRequerido" class="text-red-500">*</span>
          </label>
          <select
            v-model="form.estadoLey"
            :disabled="Boolean(esEdicion || config.estadoRequerido)"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">-- Selecciona --</option>
            <template v-if="config.estadoRequerido">
              <option :value="config.estadoRequerido">{{ config.estadoRequerido }}</option>
            </template>
            <template v-else>
              <option value="EN TRATAMIENTO">EN TRATAMIENTO</option>
              <option value="EN REVISIÓN">EN REVISIÓN</option>
            </template>
          </select>
          <p v-if="esEdicion && esOrigenTransicion" class="mt-1 text-xs text-amber-600">
            Usa el botón "Cambiar estado" para modificar.
          </p>
        </div>

        <!-- Tratamiento (Senado) -->
        <template v-if="tipo === 'proyecto-ley-tratamiento-senado'">
          <div>
            <label class="block text-sm font-medium text-gray-700">Fecha de Aprobación</label>
            <input
              v-model="form.fechaAprobacion"
              type="date"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Fecha Remisión a Diputados</label>
            <input
              v-model="form.fechaRemisionDiputados"
              type="date"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </template>

        <!-- Revisión (Diputados) -->
        <template v-if="tipo === 'proyecto-ley-revision-diputados'">
          <div>
            <label class="block text-sm font-medium text-gray-700">Fecha de Sanción</label>
            <input
              v-model="form.fechaSancion"
              type="date"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Fecha Remisión al Ejecutivo</label>
            <input
              v-model="form.fechaRemisionEjecutivo"
              type="date"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </template>

        <!-- APROBADO / MODIFICACIONES -->
        <template v-if="tipo === 'proyecto-ley-aprobados' || tipo === 'proyecto-ley-modificaciones'">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Fecha de Aprobación <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.fechaAprobacion"
              type="date"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
              :class="errores.fechaAprobacion ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="errores.fechaAprobacion" class="mt-1 text-xs text-red-600">{{ errores.fechaAprobacion }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Fecha Remisión a Diputados <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.fechaRemisionDiputados"
              type="date"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
              :class="errores.fechaRemisionDiputados ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="errores.fechaRemisionDiputados" class="mt-1 text-xs text-red-600">{{ errores.fechaRemisionDiputados }}</p>
          </div>
        </template>

        <!-- SANCIONADO -->
        <template v-if="tipo === 'proyecto-ley-sancionados'">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Fecha de Sanción <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.fechaSancion"
              type="date"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
              :class="errores.fechaSancion ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="errores.fechaSancion" class="mt-1 text-xs text-red-600">{{ errores.fechaSancion }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Fecha Remisión al Ejecutivo <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.fechaRemisionEjecutivo"
              type="date"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
              :class="errores.fechaRemisionEjecutivo ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="errores.fechaRemisionEjecutivo" class="mt-1 text-xs text-red-600">{{ errores.fechaRemisionEjecutivo }}</p>
          </div>
        </template>

        <!-- RECHAZADO -->
        <template v-if="tipo === 'proyecto-ley-rechazados'">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Fecha de Rechazo <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.fechaRechazo"
              type="date"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
              :class="errores.fechaRechazo ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="errores.fechaRechazo" class="mt-1 text-xs text-red-600">{{ errores.fechaRechazo }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Fecha Remisión a Diputados <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.fechaRemisionDiputados"
              type="date"
              required
              class="mt-1 block w-full px-3 py-2 border rounded-md text-sm"
              :class="errores.fechaRemisionDiputados ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="errores.fechaRemisionDiputados" class="mt-1 text-xs text-red-600">{{ errores.fechaRemisionDiputados }}</p>
          </div>
        </template>
      </div>

      <!-- N° Ley -->
      <div v-if="['proyecto-ley-aprobados', 'proyecto-ley-sancionados', 'proyecto-ley-modificaciones'].includes(tipo)">
        <label class="block text-sm font-medium text-gray-700">
          N° Ley <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="form.numeroLey"
          type="number"
          min="1"
          required
          class="mt-1 block w-48 px-3 py-2 border rounded-md text-sm"
          :class="errores.numeroLey ? 'border-red-400' : 'border-gray-300'"
          placeholder="Ej: 1763"
        />
        <p v-if="errores.numeroLey" class="mt-1 text-xs text-red-600">{{ errores.numeroLey }}</p>
        <p v-else class="mt-1 text-xs text-gray-500">Debe ser único a nivel global.</p>
      </div>
    </div>

    <!-- Destinatario (PIE, PIO, Minutas) -->
    <div v-if="esConDestinatario" class="border-t pt-5 space-y-4">
      <p class="text-sm font-medium text-gray-700">Destinatario</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Destinatario <span class="text-red-500">*</span></label>
          <input
            v-model.trim="form.destinatario"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Tipo de Destinatario <span class="text-red-500">*</span></label>
          <select
            v-model="form.tipoDestinatario"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">-- Selecciona --</option>
            <option v-for="t in TIPOS_DESTINATARIO" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Fechas del proceso (PIE, PIO, Minutas, Resoluciones) -->
    <div v-if="!esProyectoLey" class="border-t pt-5">
      <p class="text-sm font-medium text-gray-700 mb-3">Fechas del proceso</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-if="esConDestinatario">
          <label class="block text-sm text-gray-600">Fecha Remisión al Destinatario</label>
          <input
            v-model="form.fechaRemisionDestinatario"
            type="date"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

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
            <label class="block text-sm text-gray-600">Fecha Remisión Peticionario</label>
            <input
              v-model="form.fechaRemisionPeticionario"
              type="date"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </template>

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
            <label class="block text-sm text-gray-600">Fecha Realización (Final)</label>
            <input
              v-model="form.fechaRealizacionFinal"
              type="date"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </template>

        <template v-if="tipo === 'minuta-comunicacion'">
          <div>
            <label class="block text-sm text-gray-600">Fecha de Respuesta USCLyR</label>
            <input
              v-model="form.fechaRespuesta"
              type="date"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600">Fecha Remisión Peticionario</label>
            <input
              v-model="form.fechaRemisionPeticionario"
              type="date"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </template>

        <template v-if="esAprobacion && !esProyectoLey">
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
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      />
    </div>

    <!-- Observación -->
    <div>
      <label class="block text-sm font-medium text-gray-700">Observaciones</label>
      <textarea
        v-model.trim="form.observacion"
        rows="3"
        maxlength="1000"
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
      ></textarea>
    </div>

    <!-- Archivo principal (PDF) -->
    <div class="border-t pt-5">
      <p class="text-sm font-medium text-gray-700 mb-3">Archivo PDF Principal</p>
      <div v-if="!form.archivo.url" class="flex items-center gap-3">
        <label class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2">
          <span>📄 Subir PDF</span>
          <input ref="fileInput" type="file" accept="application/pdf" class="hidden" @change="handlePdfSelect" />
        </label>
        <span v-if="uploadingPDF" class="text-sm text-gray-500 flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          Subiendo...
        </span>
      </div>
      <div v-else class="bg-gray-100 rounded-lg p-3 flex items-center gap-3">
        <span class="text-2xl">📄</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800 truncate">{{ form.archivo.originalName || form.archivo.filename }}</p>
          <a :href="form.archivo.url" target="_blank" class="text-xs text-primary-600 hover:underline">Ver PDF actual →</a>
        </div>
        <button
          type="button"
          @click="quitarPdf"
          class="text-red-500 hover:text-red-700 text-xl"
          title="Quitar PDF"
        >✕</button>
      </div>
      <p v-if="uploadError" class="mt-2 text-xs text-red-600">{{ uploadError }}</p>
    </div>

    <!-- Archivo Anexo (solo tipos destino) -->
    <div v-if="mostrarArchivoAnexo" class="border-t pt-5">
      <div class="flex items-start justify-between mb-3">
        <div>
          <p class="text-sm font-medium text-gray-700">
            Archivo Anexo (Informe de Comisión)
            <span class="text-red-500">*</span>
          </p>
          <p class="text-xs text-gray-500 mt-0.5">
            Obligatorio cuando el estado es <strong>{{ config.estadoRequerido }}</strong>.
          </p>
        </div>
      </div>

      <div v-if="form.archivoAnexo.length > 0" class="space-y-2 mb-3">
        <div
          v-for="(anexo, idx) in form.archivoAnexo"
          :key="idx"
          class="bg-gray-100 rounded-lg p-3 flex items-center gap-3"
        >
          <span class="text-2xl">📎</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 truncate">{{ anexo.originalName || anexo.filename }}</p>
            <a :href="anexo.url" target="_blank" class="text-xs text-primary-600 hover:underline">Ver PDF →</a>
          </div>
          <button
            type="button"
            @click="quitarAnexo(idx)"
            class="text-red-500 hover:text-red-700 text-xl"
            title="Quitar anexo"
          >✕</button>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <label class="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2">
          <span>📎 Agregar anexo</span>
          <input ref="anexoInput" type="file" accept="application/pdf" class="hidden" @change="handleAnexoSelect" />
        </label>
        <span v-if="uploadingAnexo" class="text-sm text-gray-500 flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          Subiendo...
        </span>
      </div>
      <p v-if="anexoError" class="mt-2 text-xs text-red-600">{{ anexoError }}</p>
      <p v-if="errores.archivoAnexo" class="mt-2 text-xs text-red-600">{{ errores.archivoAnexo }}</p>
    </div>

    <!-- Error general -->
    <div v-if="errorGeneral" class="bg-red-50 border border-red-200 rounded-lg p-3">
      <p class="text-sm text-red-800">{{ errorGeneral }}</p>
    </div>

    <!-- Botones -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <NuxtLink
        :to="`/admin/legislativos?tipo=${tipo}`"
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

    <!-- Modal de cambio de estado -->
    <CambiarEstadoModal
      v-model="showEstadoModal"
      :documento="documento || null"
      :tipo-actual="tipo"
      :loading="savingEstado"
      @confirm="cambiarEstado"
    />
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
  getConfigTipo,
  TIPOS_DESTINATARIO,
  esTipoOrigenTransicion,
  type TipoDocumento
} from '~/utils/documentoTypes'
import {
  useDocumentosLegislativos,
  type DocumentoLegislativo,
  type UploadResult,
  type ArchivoAnexo
} from '~/composables/useDocumentosLegislativos'
import CambiarEstadoModal from '~/components/admin/CambiarEstadoModal.vue'
import MultiSelectSenadores from '~/components/admin/MultiSelectSenadores.vue'
import MultiSelectComisiones from '~/components/admin/MultiSelectComisiones.vue'

const props = defineProps<{
  tipo: TipoDocumento
  documento?: DocumentoLegislativo | null
  saving?: boolean
  serverError?: string
}>()

const emit = defineEmits<{
  (e: 'submit', payload: Partial<DocumentoLegislativo>): void
  (e: 'cambiarEstado', payload: { estadoLey: string; datos: any }): void
}>()

const { uploadPDF } = useDocumentosLegislativos()

const config = computed(() => getConfigTipo(props.tipo)!)
const esEdicion = computed(() => !!props.documento?._id)
const esOrigenTransicion = computed(() => esTipoOrigenTransicion(props.tipo))

const estaBloqueado = (campo: string): boolean => {
  return esEdicion.value && Boolean(config.value?.camposBloqueadosEnEdicion.includes(campo))
}

const esNumeroBloqueado = computed(() => estaBloqueado('numero'))
const esCodigoBloqueado = computed(() => estaBloqueado('codigo'))
const esPeticionarioBloqueado = computed(() => estaBloqueado('peticionario'))

const labelPeticionario = computed(() => {
  if (props.tipo.startsWith('peticion-')) return 'Peticionario'
  return 'Proyectista'
})

const esConDestinatario = computed(() =>
  ['peticion-informe-escrito', 'peticion-informe-oral', 'minuta-comunicacion'].includes(props.tipo)
)

const esAprobacion = computed(() =>
  ['resolucion-camaral', 'declaracion-camaral', 'homenaje-camaral'].includes(props.tipo)
)

const esProyectoLey = computed(() =>
  [
    'proyecto-ley-tratamiento-senado',
    'proyecto-ley-revision-diputados',
    'proyecto-ley-aprobados',
    'proyecto-ley-sancionados',
    'proyecto-ley-modificaciones',
    'proyecto-ley-rechazados'
  ].includes(props.tipo)
)

const mostrarArchivoAnexo = computed(() => Boolean(config.value?.estadoRequerido))

// ============================================
// FORM
// ============================================
const form = reactive({
  numero: null as number | null,
  codigo: '',
  fechaIngreso: '',
  peticionario: [] as string[],   // 🔥 ahora array
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
  archivo: { url: null as string | null, filename: '', originalName: '', size: 0 },
  archivoAnexo: [] as ArchivoAnexo[],

  // Proyectos de Ley
  esNuevoOReReposicion: '',
  plAnterior: '',
  comisionI: [] as string[],      // 🔥 ahora array
  fechaRemisionComisionI: '',
  comisionII: [] as string[],     // 🔥 ahora array
  fechaRemisionComisionII: '',
  estadoLey: '',
  fechaRemisionDiputados: '',
  fechaSancion: '',
  fechaRemisionEjecutivo: '',
  fechaRechazo: '',
  numeroLey: null as number | null
})

const errores = reactive<Record<string, string>>({})
const errorGeneral = ref('')
const uploadError = ref('')
const anexoError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const anexoInput = ref<HTMLInputElement | null>(null)
const uploadingPDF = ref(false)
const uploadingAnexo = ref(false)

const showEstadoModal = ref(false)
const savingEstado = ref(false)

const abrirModalEstado = () => {
  showEstadoModal.value = true
}

// ============================================
// CARGA INICIAL
// ============================================
const asegurarArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(x => String(x)).filter(Boolean)
  if (typeof v === 'string' && v.trim()) return [v.trim()]
  return []
}

const cargarDesdeDocumento = (doc: DocumentoLegislativo) => {
  form.numero = doc.numero
  form.codigo = doc.codigo
  form.fechaIngreso = doc.fechaIngreso ? doc.fechaIngreso.split('T')[0] : ''
  form.peticionario = asegurarArray(doc.peticionario ?? doc.proyectista)
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
  form.archivoAnexo = Array.isArray(doc.archivoAnexo) ? [...doc.archivoAnexo] : []

  form.esNuevoOReReposicion = doc.esNuevoOReReposicion || ''
  form.plAnterior = doc.plAnterior || ''
  form.comisionI = asegurarArray(doc.comisionI)
  form.fechaRemisionComisionI = doc.fechaRemisionComisionI?.split('T')[0] || ''
  form.comisionII = asegurarArray(doc.comisionII)
  form.fechaRemisionComisionII = doc.fechaRemisionComisionII?.split('T')[0] || ''
  form.estadoLey = doc.estadoLey || ''
  form.fechaRemisionDiputados = doc.fechaRemisionDiputados?.split('T')[0] || ''
  form.fechaSancion = doc.fechaSancion?.split('T')[0] || ''
  form.fechaRemisionEjecutivo = doc.fechaRemisionEjecutivo?.split('T')[0] || ''
  form.fechaRechazo = doc.fechaRechazo?.split('T')[0] || ''
  form.numeroLey = doc.numeroLey ?? null
}

watch(
  () => props.documento,
  (doc) => {
    if (doc) cargarDesdeDocumento(doc)
  },
  { immediate: true }
)

onMounted(() => {
  if (!esEdicion.value) {
    if (props.tipo === 'proyecto-ley-tratamiento-senado') form.estadoLey = 'EN TRATAMIENTO'
    if (props.tipo === 'proyecto-ley-revision-diputados') form.estadoLey = 'EN REVISIÓN'
    if (config.value?.estadoRequerido) form.estadoLey = config.value.estadoRequerido
  }
})

// ============================================
// VALIDACIÓN
// ============================================
const validar = (): boolean => {
  Object.keys(errores).forEach((k) => delete errores[k])
  errorGeneral.value = ''

  config.value.camposObligatorios.forEach((campo) => {
    const valor = (form as any)[campo]

    if (campo === 'archivoAnexo') {
      if (!Array.isArray(valor) || valor.length === 0) {
        errores.archivoAnexo = 'Debe adjuntar al menos un archivo anexo'
      }
      return
    }

    if (campo === 'peticionario' || campo === 'comisionI' || campo === 'comisionII') {
      if (!Array.isArray(valor) || valor.length === 0) {
        errores[campo] = 'Debe seleccionar al menos uno'
      }
      return
    }

    const vacio =
      valor === null ||
      valor === undefined ||
      (typeof valor === 'string' && valor.trim() === '') ||
      (typeof valor === 'number' && valor <= 0)

    if (vacio) errores[campo] = 'Este campo es obligatorio'
  })

  if (form.codigo && form.codigo.length > 150) errores.codigo = 'Máximo 150 caracteres'
  if (form.asunto && form.asunto.length > 5000) errores.asunto = 'Máximo 5000 caracteres'

  return Object.keys(errores).length === 0
}

// ============================================
// ENVÍO NORMAL
// ============================================
const enviar = () => {
  if (!validar()) {
    errorGeneral.value = 'Corrige los errores antes de guardar.'
    return
  }

  const payload: any = {
    numero: form.numero!,
    codigo: form.codigo,
    fechaIngreso: form.fechaIngreso,
    asunto: form.asunto,
    peticionario: form.peticionario,   // 🔥 array
    observacion: form.observacion || '',
    archivo: form.archivo
  }

  if (form.archivoAnexo.length > 0) payload.archivoAnexo = form.archivoAnexo

  if (esConDestinatario.value) {
    payload.destinatario = form.destinatario || undefined
    payload.tipoDestinatario = form.tipoDestinatario || undefined
    payload.fechaRemisionDestinatario = form.fechaRemisionDestinatario || null
  }

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

  if (props.tipo === 'minuta-comunicacion') {
    payload.fechaRespuesta = form.fechaRespuesta || null
    payload.fechaRemisionPeticionario = form.fechaRemisionPeticionario || null
  }

  if (esAprobacion.value && !esProyectoLey.value) {
    payload.fechaAprobacion = form.fechaAprobacion || null
    if (props.tipo === 'resolucion-camaral') payload.sesion = form.sesion || null
  }

  if (esProyectoLey.value) {
    if (props.tipo === 'proyecto-ley-tratamiento-senado' || props.tipo === 'proyecto-ley-aprobados') {
      payload.esNuevoOReReposicion = form.esNuevoOReReposicion || null
      payload.plAnterior = form.plAnterior || null
    }
    payload.comisionI = form.comisionI     // 🔥 array
    payload.fechaRemisionComisionI = form.fechaRemisionComisionI || null
    payload.comisionII = form.comisionII   // 🔥 array
    payload.fechaRemisionComisionII = form.fechaRemisionComisionII || null
    payload.estadoLey = form.estadoLey || null

    if (props.tipo === 'proyecto-ley-tratamiento-senado') {
      payload.fechaAprobacion = form.fechaAprobacion || null
      payload.fechaRemisionDiputados = form.fechaRemisionDiputados || null
    }
    if (props.tipo === 'proyecto-ley-revision-diputados') {
      payload.fechaSancion = form.fechaSancion || null
      payload.fechaRemisionEjecutivo = form.fechaRemisionEjecutivo || null
    }
    if (['proyecto-ley-aprobados', 'proyecto-ley-modificaciones'].includes(props.tipo)) {
      payload.fechaAprobacion = form.fechaAprobacion || null
      payload.fechaRemisionDiputados = form.fechaRemisionDiputados || null
      payload.numeroLey = form.numeroLey
    }
    if (props.tipo === 'proyecto-ley-sancionados') {
      payload.fechaSancion = form.fechaSancion || null
      payload.fechaRemisionEjecutivo = form.fechaRemisionEjecutivo || null
      payload.numeroLey = form.numeroLey
    }
    if (props.tipo === 'proyecto-ley-rechazados') {
      payload.fechaRechazo = form.fechaRechazo || null
      payload.fechaRemisionDiputados = form.fechaRemisionDiputados || null
    }
  }

  emit('submit', payload)
}

// ============================================
// CAMBIO DE ESTADO (desde modal)
// ============================================
const cambiarEstado = (payload: { estadoLey: string; datos: any }) => {
  console.log('🟢 [Form] Evento confirm recibido del modal:', payload)
  savingEstado.value = true
  emit('cambiarEstado', payload)
}

defineExpose({
  setSavingEstado: (v: boolean) => {
    savingEstado.value = v
  },
  closeEstadoModal: () => {
    showEstadoModal.value = false
  }
})

// ============================================
// UPLOAD PRINCIPAL
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
// UPLOAD ANEXO
// ============================================
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
    const result: UploadResult = await uploadPDF(props.tipo, file)
    form.archivoAnexo.push({
      url: result.url,
      filename: result.filename,
      originalName: result.originalName,
      size: result.size
    })
  } catch (err: any) {
    anexoError.value = err.message || 'Error al subir el anexo'
  } finally {
    uploadingAnexo.value = false
    if (anexoInput.value) anexoInput.value.value = ''
  }
}

const quitarAnexo = (idx: number) => {
  form.archivoAnexo.splice(idx, 1)
}
</script>