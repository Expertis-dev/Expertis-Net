export interface SpeechPago {
  idGestion?: number | string
  documento?: string | null
  cartera?: string | null
  deudaCapital?: number | string | null
  deudaTotal?: number | string | null
  cosecha?: string | null
  fecha?: string | null
  horaInicio?: string | null
  tiempoHablado?: string | null
  agencia?: string | null
  supervisor?: string | null
  calificacion?: number | string | null
  resumen?: string | null
  observacion?: string | null
  transcripcion?: string | null
}

export interface SpeechPagoDetalle extends SpeechPago {
  idGestion: number | string
}

export interface SpeechReclamo {
  idGestion?: number | string
  documento?: string | null
  cartera?: string | null
  fecha?: string | null
  horaInicio?: string | null
  tiempoHablado?: string | null
  agencia?: string | null
  supervisor?: string | null
  grupo?: string | null
  tipoReclamo?: string | null
  tipificacion?: string | null
  grabacion?: string | null
  transcripcion?: string | null
  observacion?: string | null
}

export interface SpeechCalidadDetalle {
  idGestion?: number | string
  cartera?: string | null
  fecha?: string | null
  fechaLlamada?: string | null
  asesor?: string | null
  agencia?: string | null
  supervisor?: string | null
  promedio?: number | string | null
  calificacionCalidad?: number | string | null
  calificacionActitud?: number | string | null
  calificacionApertura?: number | string | null
  calificacionNegociacion?: number | string | null
  calificacionComunicacionefectiva?: number | string | null
  calificacionCumplimientoNormativo?: number | string | null
  calificacionCierre?: number | string | null
  calificaciontotal?: number | string | null
  observacionCalidad?: string | null
  grabacion?: string | null
  transcripcion?: string | null
  resumen?: string | null
  tipificacion?: string | null
  codmes?: string | number | null
  [key: string]: unknown
}

export interface SpeechFeedbackUploadPayload {
  supervisor: string
  fechaCarpeta: string
  nombreArchivo: string
  archivo: File
}

export type SpeechPermiso = string
