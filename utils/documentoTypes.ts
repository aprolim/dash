// utils/documentoTypes.js
// Configuración de tipos de documentos legislativos.

export type TipoDocumento =
  | 'peticion-informe-escrito'
  | 'peticion-informe-oral'
  | 'minuta-comunicacion'
  | 'resolucion-camaral'
  | 'declaracion-camaral'
  | 'homenaje-camaral'
  | 'proyecto-ley-tratamiento-senado'
  | 'proyecto-ley-revision-diputados'
  | 'proyecto-ley-aprobados'
  | 'proyecto-ley-sancionados'
  | 'proyecto-ley-modificaciones'
  | 'proyecto-ley-rechazados'
  | 'ley-promulgada'

export type BloqueId = 'fiscalizacion' | 'gestion' | 'legislacion'

export type ColumnaTipo =
  | 'number'
  | 'text'
  | 'longtext'
  | 'date'
  | 'enum'
  | 'file'

export interface ColumnaConfig {
  key: string
  label: string
  type: ColumnaTipo
  ancho?: string
  opciones?: string[]
  ocultoEnTabla?: boolean
}

export interface TipoDocumentoConfig {
  tipo: TipoDocumento
  label: string
  labelSingular: string
  bloque: BloqueId
  icono: string
  prefijoCodigo: string
  columnas: ColumnaConfig[]
  camposObligatorios: string[]
  camposBloqueadosEnEdicion: string[]
  estadoRequerido?: string  // 🔥 Solo para tipos destino (aprobados/sancionados/etc.)
}

// ============================================
// LISTA DE TIPOS DE DESTINATARIO
// ============================================
export const TIPOS_DESTINATARIO = [
  'Órgano Ejecutivo',
  'Órgano Judicial',
  'Órgano Electoral',
  'Gobernación',
  'Alcaldía',
  'Universidad',
  'Otra Entidad'
]

// ============================================
// ESTADOS DE LEY Y SU MAPEO A TIPO
// ============================================
export const ESTADOS_LEY = [
  'EN TRATAMIENTO',
  'EN REVISIÓN',
  'APROBADO',
  'SANCIONADO',
  'APROBADO CON MODIFICACIONES',
  'RECHAZADO'
] as const

export const ESTADO_A_TIPO: Record<string, TipoDocumento> = {
  'APROBADO': 'proyecto-ley-aprobados',
  'SANCIONADO': 'proyecto-ley-sancionados',
  'APROBADO CON MODIFICACIONES': 'proyecto-ley-modificaciones',
  'RECHAZADO': 'proyecto-ley-rechazados'
}

export const TIPO_A_ESTADO: Record<TipoDocumento, string> = {
  'proyecto-ley-aprobados': 'APROBADO',
  'proyecto-ley-sancionados': 'SANCIONADO',
  'proyecto-ley-modificaciones': 'APROBADO CON MODIFICACIONES',
  'proyecto-ley-rechazados': 'RECHAZADO'
} as any

// Tipos origen (desde donde se puede cambiar estado)
export const TIPOS_ORIGEN_TRANSICION: TipoDocumento[] = [
  'proyecto-ley-tratamiento-senado',
  'proyecto-ley-revision-diputados'
]

// Tipos destino (a los que se puede llegar)
export const TIPOS_DESTINO_TRANSICION: TipoDocumento[] = [
  'proyecto-ley-aprobados',
  'proyecto-ley-sancionados',
  'proyecto-ley-modificaciones',
  'proyecto-ley-rechazados'
]

// ¿Qué estados puede tomar un documento origen?
export const ESTADOS_TRANSICION_DISPONIBLES = [
  'APROBADO',
  'SANCIONADO',
  'APROBADO CON MODIFICACIONES',
  'RECHAZADO'
]

// ============================================
// CONFIGURACIÓN DE CADA TIPO
// ============================================
export const TIPOS_DOCUMENTO: Record<TipoDocumento, TipoDocumentoConfig> = {
  // ============================================
  // 🔍 FISCALIZACIÓN
  // ============================================
  'peticion-informe-escrito': {
    tipo: 'peticion-informe-escrito',
    label: 'Peticiones de Informe Escrito',
    labelSingular: 'Petición de Informe Escrito',
    bloque: 'fiscalizacion',
    icono: 'mdi:file-document-outline',
    prefijoCodigo: 'P.I.E.',
    columnas: [
      { key: 'numero', label: 'Nº', type: 'number', ancho: '60px' },
      { key: 'codigo', label: 'Código o Nombre', type: 'text' },
      { key: 'fechaIngreso', label: 'Fecha de Ingreso', type: 'date' },
      { key: 'peticionario', label: 'Peticionario', type: 'text' },
      { key: 'asunto', label: 'Asunto', type: 'longtext' },
      { key: 'destinatario', label: 'Destinatario', type: 'text' },
      { key: 'tipoDestinatario', label: 'Tipo de Destinatario', type: 'text' },
      { key: 'fechaRemisionDestinatario', label: 'Fecha de Remisión al Destinatario', type: 'date' },
      { key: 'fechaRespuesta', label: 'Fecha de Respuesta', type: 'date' },
      { key: 'fechaRemisionPeticionario', label: 'Fecha de Remisión al Peticionario', type: 'date' },
      { key: 'conminatoria', label: 'Conminatoria', type: 'text' },
      { key: 'observacion', label: 'Observación', type: 'text' },
      { key: 'archivo', label: 'Archivo', type: 'file' }
    ],
    camposObligatorios: ['numero', 'codigo', 'fechaIngreso', 'peticionario', 'asunto', 'destinatario', 'tipoDestinatario'],
    camposBloqueadosEnEdicion: ['numero']
  },

  'peticion-informe-oral': {
    tipo: 'peticion-informe-oral',
    label: 'Peticiones de Informe Oral',
    labelSingular: 'Petición de Informe Oral',
    bloque: 'fiscalizacion',
    icono: 'mdi:microphone',
    prefijoCodigo: 'P.I.O.',
    columnas: [
      { key: 'numero', label: 'Nº', type: 'number', ancho: '60px' },
      { key: 'codigo', label: 'Código o Nombre', type: 'text' },
      { key: 'fechaIngreso', label: 'Fecha de Ingreso', type: 'date' },
      { key: 'peticionario', label: 'Peticionario', type: 'text' },
      { key: 'asunto', label: 'Asunto', type: 'longtext' },
      { key: 'destinatario', label: 'Destinatario', type: 'text' },
      { key: 'tipoDestinatario', label: 'Tipo de Destinatario', type: 'text' },
      { key: 'fechaRemisionDestinatario', label: 'Fecha de Remisión al Destinatario', type: 'date' },
      { key: 'fechaRealizacion', label: 'Fecha de Realización', type: 'date' },
      { key: 'fechaReprogramacion', label: 'Fecha de Reprogramación', type: 'date' },
      { key: 'fechaRealizacionFinal', label: 'Fecha de Realización (final)', type: 'date' },
      { key: 'observacion', label: 'Observaciones', type: 'text' },
      { key: 'archivo', label: 'Archivo', type: 'file' }
    ],
    camposObligatorios: ['numero', 'codigo', 'fechaIngreso', 'peticionario', 'asunto', 'destinatario', 'tipoDestinatario'],
    camposBloqueadosEnEdicion: ['numero']
  },

  // ============================================
  // 📋 GESTIÓN
  // ============================================
  'minuta-comunicacion': {
    tipo: 'minuta-comunicacion',
    label: 'Minutas de Comunicación',
    labelSingular: 'Minuta de Comunicación',
    bloque: 'gestion',
    icono: 'mdi:file-document',
    prefijoCodigo: 'M.C.',
    columnas: [
      { key: 'numero', label: 'Nº', type: 'number', ancho: '60px' },
      { key: 'codigo', label: 'Código o Nombre', type: 'text' },
      { key: 'fechaIngreso', label: 'Fecha de Ingreso', type: 'date' },
      { key: 'peticionario', label: 'Proyectista', type: 'text' },
      { key: 'asunto', label: 'Asunto', type: 'longtext' },
      { key: 'destinatario', label: 'Destinatario', type: 'text' },
      { key: 'fechaRemisionDestinatario', label: 'Fecha de Remisión al Destinatario', type: 'date' },
      { key: 'tipoDestinatario', label: 'Tipo de Destinatario', type: 'text' },
      { key: 'fechaRespuesta', label: 'Fecha de Respuesta USCLyR', type: 'date' },
      { key: 'fechaRemisionPeticionario', label: 'Fecha de Remisión al Peticionario', type: 'date' },
      { key: 'observacion', label: 'Observaciones', type: 'text' },
      { key: 'archivo', label: 'Archivo', type: 'file' }
    ],
    camposObligatorios: ['numero', 'codigo', 'fechaIngreso', 'peticionario', 'asunto', 'destinatario', 'tipoDestinatario'],
    camposBloqueadosEnEdicion: ['numero']
  },

  'resolucion-camaral': {
    tipo: 'resolucion-camaral',
    label: 'Resoluciones Camarales',
    labelSingular: 'Resolución Camaral',
    bloque: 'gestion',
    icono: 'mdi:gavel',
    prefijoCodigo: 'R.C.',
    columnas: [
      { key: 'numero', label: 'Nº', type: 'number', ancho: '60px' },
      { key: 'codigo', label: 'Código o Nombre', type: 'text' },
      { key: 'fechaIngreso', label: 'Fecha de Ingreso', type: 'date' },
      { key: 'peticionario', label: 'Proyectista', type: 'text' },
      { key: 'asunto', label: 'Asunto', type: 'longtext' },
      { key: 'fechaAprobacion', label: 'Fecha de Aprobación', type: 'date' },
      { key: 'sesion', label: 'Sesión', type: 'enum', opciones: ['PUBLICA', 'RESERVADA'] },
      { key: 'observacion', label: 'Observaciones', type: 'text' },
      { key: 'archivo', label: 'Archivo', type: 'file' }
    ],
    camposObligatorios: ['numero', 'codigo', 'fechaIngreso', 'peticionario', 'asunto'],
    camposBloqueadosEnEdicion: ['numero', 'peticionario']
  },

  'declaracion-camaral': {
    tipo: 'declaracion-camaral',
    label: 'Declaraciones Camarales',
    labelSingular: 'Declaración Camaral',
    bloque: 'gestion',
    icono: 'mdi:bullhorn',
    prefijoCodigo: 'D.C.',
    columnas: [
      { key: 'numero', label: 'Nº', type: 'number', ancho: '60px' },
      { key: 'codigo', label: 'Código o Nombre', type: 'text' },
      { key: 'fechaIngreso', label: 'Fecha de Ingreso', type: 'date' },
      { key: 'peticionario', label: 'Proyectista', type: 'text' },
      { key: 'asunto', label: 'Asunto', type: 'longtext' },
      { key: 'fechaAprobacion', label: 'Fecha de Aprobación', type: 'date' },
      { key: 'observacion', label: 'Observaciones', type: 'text' },
      { key: 'archivo', label: 'Archivo', type: 'file' }
    ],
    camposObligatorios: ['numero', 'codigo', 'fechaIngreso', 'peticionario', 'asunto'],
    camposBloqueadosEnEdicion: ['numero']
  },

  'homenaje-camaral': {
    tipo: 'homenaje-camaral',
    label: 'Homenajes Camarales',
    labelSingular: 'Homenaje Camaral',
    bloque: 'gestion',
    icono: 'mdi:medal',
    prefijoCodigo: 'H.C.',
    columnas: [
      { key: 'numero', label: 'Nº', type: 'number', ancho: '60px' },
      { key: 'codigo', label: 'Código o Nombre', type: 'text' },
      { key: 'fechaIngreso', label: 'Fecha de Ingreso', type: 'date' },
      { key: 'peticionario', label: 'Proyectista', type: 'text' },
      { key: 'asunto', label: 'Asunto', type: 'longtext' },
      { key: 'fechaAprobacion', label: 'Fecha de Aprobación', type: 'date' },
      { key: 'observacion', label: 'Observaciones', type: 'text' },
      { key: 'archivo', label: 'Archivo', type: 'file' }
    ],
    camposObligatorios: ['numero', 'codigo', 'fechaIngreso', 'peticionario', 'asunto'],
    camposBloqueadosEnEdicion: ['numero']
  },

  // ============================================
  // ⚖️ LEGISLACIÓN - ORIGEN
  // ============================================
  'proyecto-ley-tratamiento-senado': {
    tipo: 'proyecto-ley-tratamiento-senado',
    label: 'Proyectos de Ley en Tratamiento (Senado)',
    labelSingular: 'Proyecto de Ley en Tratamiento',
    bloque: 'legislacion',
    icono: 'mdi:file-document-edit',
    prefijoCodigo: 'P.L. C.S.',
    columnas: [
      { key: 'numero', label: 'Nº', type: 'number', ancho: '60px' },
      { key: 'codigo', label: 'Código o Nombre', type: 'text' },
      { key: 'fechaIngreso', label: 'Fecha de Ingreso', type: 'date' },
      { key: 'asunto', label: 'Asunto o Referencia', type: 'longtext' },
      { key: 'peticionario', label: 'Proyectista', type: 'text' },
      { key: 'esNuevoOReReposicion', label: 'Nuevo o Reposición', type: 'text' },
      { key: 'plAnterior', label: 'P.L. Anterior', type: 'text' },
      { key: 'comisionI', label: 'Comisión I Remitida', type: 'text' },
      { key: 'fechaRemisionComisionI', label: 'Fecha Remisión Comisión I', type: 'date' },
      { key: 'comisionII', label: 'Comisión II', type: 'text' },
      { key: 'fechaRemisionComisionII', label: 'Fecha Remisión Comisión II', type: 'date' },
      { key: 'estadoLey', label: 'Estado', type: 'text' },
      { key: 'fechaAprobacion', label: 'Fecha de Aprobación', type: 'date' },
      { key: 'fechaRemisionDiputados', label: 'Fecha Remisión a Diputados', type: 'date' },
      { key: 'observacion', label: 'Observaciones', type: 'text' },
      { key: 'archivo', label: 'Archivo', type: 'file' }
    ],
    camposObligatorios: ['numero', 'codigo', 'fechaIngreso', 'asunto', 'peticionario', 'estadoLey'],
    camposBloqueadosEnEdicion: ['numero', 'codigo']
  },

  'proyecto-ley-revision-diputados': {
    tipo: 'proyecto-ley-revision-diputados',
    label: 'Proyectos de Ley en Revisión (Diputados)',
    labelSingular: 'Proyecto de Ley en Revisión',
    bloque: 'legislacion',
    icono: 'mdi:file-search',
    prefijoCodigo: 'P.L. C.D.',
    columnas: [
      { key: 'numero', label: 'Nº', type: 'number', ancho: '60px' },
      { key: 'codigo', label: 'Código o Nombre', type: 'text' },
      { key: 'fechaIngreso', label: 'Fecha de Ingreso', type: 'date' },
      { key: 'asunto', label: 'Asunto o Referencia', type: 'longtext' },
      { key: 'peticionario', label: 'Proyectista', type: 'text' },
      { key: 'comisionI', label: 'Comisión I Remitida', type: 'text' },
      { key: 'fechaRemisionComisionI', label: 'Fecha Remisión Comisión I', type: 'date' },
      { key: 'comisionII', label: 'Comisión II', type: 'text' },
      { key: 'fechaRemisionComisionII', label: 'Fecha Remisión Comisión II', type: 'date' },
      { key: 'estadoLey', label: 'Estado', type: 'text' },
      { key: 'fechaSancion', label: 'Fecha de Sanción', type: 'date' },
      { key: 'fechaRemisionEjecutivo', label: 'Fecha Remisión al Ejecutivo', type: 'date' },
      { key: 'observacion', label: 'Observaciones', type: 'text' },
      { key: 'archivo', label: 'Archivo', type: 'file' }
    ],
    camposObligatorios: ['numero', 'codigo', 'fechaIngreso', 'asunto', 'peticionario', 'estadoLey'],
    camposBloqueadosEnEdicion: ['numero', 'codigo']
  },

  // ============================================
  // ⚖️ LEGISLACIÓN - DESTINOS
  // ============================================
  'proyecto-ley-aprobados': {
    tipo: 'proyecto-ley-aprobados',
    label: 'Proyectos de Ley Aprobados',
    labelSingular: 'Proyecto de Ley Aprobado',
    bloque: 'legislacion',
    icono: 'mdi:check-circle',
    prefijoCodigo: 'P.L.',
    estadoRequerido: 'APROBADO',
    columnas: [
      { key: 'numero', label: 'Nº', type: 'number', ancho: '60px' },
      { key: 'codigo', label: 'Código o Nombre', type: 'text' },
      { key: 'fechaIngreso', label: 'Fecha de Ingreso', type: 'date' },
      { key: 'asunto', label: 'Asunto o Referencia', type: 'longtext' },
      { key: 'peticionario', label: 'Proyectista', type: 'text' },
      { key: 'esNuevoOReReposicion', label: 'Nuevo o Reposición', type: 'text' },
      { key: 'plAnterior', label: 'P.L. Anterior', type: 'text' },
      { key: 'comisionI', label: 'Comisión I Remitida', type: 'text' },
      { key: 'fechaRemisionComisionI', label: 'Fecha Remisión Comisión I', type: 'date' },
      { key: 'comisionII', label: 'Comisión II', type: 'text' },
      { key: 'fechaRemisionComisionII', label: 'Fecha Remisión Comisión II', type: 'date' },
      { key: 'estadoLey', label: 'Estado', type: 'text' },
      { key: 'fechaAprobacion', label: 'Fecha de Aprobación', type: 'date' },
      { key: 'fechaRemisionDiputados', label: 'Fecha de Remisión a Diputados', type: 'date' },
      { key: 'numeroLey', label: 'N° Ley', type: 'number', ancho: '80px' },
      { key: 'observacion', label: 'Observaciones', type: 'text' },
      { key: 'archivo', label: 'Archivo', type: 'file' },
      { key: 'archivoAnexo', label: 'Archivo Anexo', type: 'file' }
    ],
    camposObligatorios: [
      'numero', 'codigo', 'fechaIngreso', 'asunto', 'peticionario',
      'estadoLey', 'fechaAprobacion', 'fechaRemisionDiputados',
      'numeroLey', 'archivoAnexo'
    ],
    camposBloqueadosEnEdicion: ['numero', 'codigo']
  },

  'proyecto-ley-sancionados': {
    tipo: 'proyecto-ley-sancionados',
    label: 'Proyectos de Ley Sancionados',
    labelSingular: 'Proyecto de Ley Sancionado',
    bloque: 'legislacion',
    icono: 'mdi:seal',
    prefijoCodigo: 'P.L.',
    estadoRequerido: 'SANCIONADO',
    columnas: [
      { key: 'numero', label: 'Nº', type: 'number', ancho: '60px' },
      { key: 'codigo', label: 'Código o Nombre', type: 'text' },
      { key: 'fechaIngreso', label: 'Fecha de Ingreso', type: 'date' },
      { key: 'asunto', label: 'Asunto o Referencia', type: 'longtext' },
      { key: 'peticionario', label: 'Proyectista', type: 'text' },
      { key: 'comisionI', label: 'Comisión I Remitida', type: 'text' },
      { key: 'fechaRemisionComisionI', label: 'Fecha Remisión Comisión I', type: 'date' },
      { key: 'comisionII', label: 'Comisión II', type: 'text' },
      { key: 'fechaRemisionComisionII', label: 'Fecha Remisión Comisión II', type: 'date' },
      { key: 'estadoLey', label: 'Estado', type: 'text' },
      { key: 'fechaSancion', label: 'Fecha de Sanción', type: 'date' },
      { key: 'fechaRemisionEjecutivo', label: 'Fecha de Remisión al Ejecutivo', type: 'date' },
      { key: 'numeroLey', label: 'N° Ley', type: 'number', ancho: '80px' },
      { key: 'observacion', label: 'Observaciones', type: 'text' },
      { key: 'archivo', label: 'Archivo', type: 'file' },
      { key: 'archivoAnexo', label: 'Archivo Anexo', type: 'file' }
    ],
    camposObligatorios: [
      'numero', 'codigo', 'fechaIngreso', 'asunto', 'peticionario',
      'estadoLey', 'fechaSancion', 'fechaRemisionEjecutivo',
      'numeroLey', 'archivoAnexo'
    ],
    camposBloqueadosEnEdicion: ['numero', 'codigo']
  },

  'proyecto-ley-modificaciones': {
    tipo: 'proyecto-ley-modificaciones',
    label: 'Proyectos de Ley con Modificaciones',
    labelSingular: 'Proyecto de Ley con Modificaciones',
    bloque: 'legislacion',
    icono: 'mdi:file-edit',
    prefijoCodigo: 'P.L.',
    estadoRequerido: 'APROBADO CON MODIFICACIONES',
    columnas: [
      { key: 'numero', label: 'Nº', type: 'number', ancho: '60px' },
      { key: 'codigo', label: 'Código o Nombre', type: 'text' },
      { key: 'fechaIngreso', label: 'Fecha de Ingreso', type: 'date' },
      { key: 'asunto', label: 'Asunto o Referencia', type: 'longtext' },
      { key: 'peticionario', label: 'Proyectista', type: 'text' },
      { key: 'comisionI', label: 'Comisión I Remitida', type: 'text' },
      { key: 'fechaRemisionComisionI', label: 'Fecha Remisión Comisión I', type: 'date' },
      { key: 'comisionII', label: 'Comisión II', type: 'text' },
      { key: 'fechaRemisionComisionII', label: 'Fecha Remisión Comisión II', type: 'date' },
      { key: 'estadoLey', label: 'Estado', type: 'text' },
      { key: 'fechaAprobacion', label: 'Fecha de Aprobación', type: 'date' },
      { key: 'fechaRemisionDiputados', label: 'Fecha de Remisión a Diputados', type: 'date' },
      { key: 'numeroLey', label: 'N° Ley', type: 'number', ancho: '80px' },
      { key: 'observacion', label: 'Observaciones', type: 'text' },
      { key: 'archivo', label: 'Archivo', type: 'file' },
      { key: 'archivoAnexo', label: 'Archivo Anexo', type: 'file' }
    ],
    camposObligatorios: [
      'numero', 'codigo', 'fechaIngreso', 'asunto', 'peticionario',
      'estadoLey', 'fechaAprobacion', 'fechaRemisionDiputados',
      'numeroLey', 'archivoAnexo'
    ],
    camposBloqueadosEnEdicion: ['numero', 'codigo']
  },

  'proyecto-ley-rechazados': {
    tipo: 'proyecto-ley-rechazados',
    label: 'Proyectos de Ley Rechazados',
    labelSingular: 'Proyecto de Ley Rechazado',
    bloque: 'legislacion',
    icono: 'mdi:close-circle',
    prefijoCodigo: 'P.L.',
    estadoRequerido: 'RECHAZADO',
    columnas: [
      { key: 'numero', label: 'Nº', type: 'number', ancho: '60px' },
      { key: 'codigo', label: 'Código o Nombre', type: 'text' },
      { key: 'fechaIngreso', label: 'Fecha de Ingreso', type: 'date' },
      { key: 'asunto', label: 'Asunto o Referencia', type: 'longtext' },
      { key: 'peticionario', label: 'Proyectista', type: 'text' },
      { key: 'comisionI', label: 'Comisión I Remitida', type: 'text' },
      { key: 'fechaRemisionComisionI', label: 'Fecha Remisión Comisión I', type: 'date' },
      { key: 'comisionII', label: 'Comisión II', type: 'text' },
      { key: 'fechaRemisionComisionII', label: 'Fecha Remisión Comisión II', type: 'date' },
      { key: 'estadoLey', label: 'Estado', type: 'text' },
      { key: 'fechaRechazo', label: 'Fecha de Rechazo', type: 'date' },
      { key: 'fechaRemisionDiputados', label: 'Fecha de Remisión a Diputados', type: 'date' },
      { key: 'observacion', label: 'Observaciones', type: 'text' },
      { key: 'archivo', label: 'Archivo', type: 'file' },
      { key: 'archivoAnexo', label: 'Archivo Anexo', type: 'file' }
    ],
    camposObligatorios: [
      'numero', 'codigo', 'fechaIngreso', 'asunto', 'peticionario',
      'estadoLey', 'fechaRechazo', 'fechaRemisionDiputados',
      'archivoAnexo'
    ],
    camposBloqueadosEnEdicion: ['numero', 'codigo']
  },

  // ============================================
  // ⚖️ LEY PROMULGADA (existente)
  // ============================================
  'ley-promulgada': {
    tipo: 'ley-promulgada',
    label: 'Leyes Promulgadas',
    labelSingular: 'Ley Promulgada',
    bloque: 'legislacion',
    icono: 'mdi:book-open-variant',
    prefijoCodigo: '',
    columnas: [
      { key: 'numero', label: 'Nº', type: 'number', ancho: '60px' },
      { key: 'codigo', label: 'Código o Nombre', type: 'text' },
      { key: 'fechaIngreso', label: 'Fecha de Ingreso', type: 'date' },
      { key: 'peticionario', label: 'Proyectista', type: 'text' },
      { key: 'asunto', label: 'Asunto', type: 'longtext' },
      { key: 'archivo', label: 'Archivo', type: 'file' }
    ],
    camposObligatorios: ['numero', 'codigo', 'fechaIngreso', 'asunto', 'peticionario'],
    camposBloqueadosEnEdicion: ['numero']
  }
}

// ============================================
// BLOQUES
// ============================================
export const BLOQUES: Record<BloqueId, { label: string; tipos: TipoDocumento[] }> = {
  fiscalizacion: {
    label: 'Fiscalización',
    tipos: ['peticion-informe-escrito', 'peticion-informe-oral']
  },
  gestion: {
    label: 'Gestión',
    tipos: ['resolucion-camaral', 'declaracion-camaral', 'minuta-comunicacion', 'homenaje-camaral']
  },
  legislacion: {
    label: 'Legislación',
    tipos: [
      'proyecto-ley-tratamiento-senado',
      'proyecto-ley-revision-diputados',
      'proyecto-ley-aprobados',
      'proyecto-ley-sancionados',
      'proyecto-ley-modificaciones',
      'proyecto-ley-rechazados',
      'ley-promulgada'
    ]
  }
}

// ============================================
// HELPERS
// ============================================
export function getConfigTipo(tipo: TipoDocumento | string): TipoDocumentoConfig | null {
  return TIPOS_DOCUMENTO[tipo as TipoDocumento] || null
}

export function getTiposDelBloque(bloque: BloqueId): TipoDocumentoConfig[] {
  const b = BLOQUES[bloque]
  if (!b) return []
  return b.tipos.map(t => TIPOS_DOCUMENTO[t]).filter(Boolean)
}

export function esTipoValido(tipo: string): tipo is TipoDocumento {
  return tipo in TIPOS_DOCUMENTO
}

export function esCampoBloqueadoEnEdicion(tipo: TipoDocumento, campo: string): boolean {
  const config = getConfigTipo(tipo)
  if (!config) return false
  return config.camposBloqueadosEnEdicion.includes(campo)
}

/**
 * ¿Este tipo es un origen del que se puede cambiar estado?
 */
export function esTipoOrigenTransicion(tipo: string): boolean {
  return TIPOS_ORIGEN_TRANSICION.includes(tipo as TipoDocumento)
}

/**
 * ¿Este tipo es un destino (al que se llega por transición)?
 */
export function esTipoDestinoTransicion(tipo: string): boolean {
  return TIPOS_DESTINO_TRANSICION.includes(tipo as TipoDocumento)
}

/**
 * Devuelve el estado requerido de un tipo destino (o null si no aplica).
 */
export function getEstadoRequerido(tipo: string): string | null {
  const config = getConfigTipo(tipo)
  return config?.estadoRequerido || null
}

/**
 * Mapea un estadoLey al tipo resultante.
 */
export function getTipoPorEstado(estado: string): TipoDocumento | null {
  return ESTADO_A_TIPO[estado] || null
}