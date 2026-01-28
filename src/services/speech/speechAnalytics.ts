import { speechAnalyticsApi } from "./api"
import type {
  SpeechCalidadDetalle,
  SpeechFeedbackUploadPayload,
  SpeechFeedbackViewPayload,
  SpeechFeedbackViewResponse,
  SpeechPago,
  SpeechPagoDetalle,
  SpeechReclamo,
} from "@/types/speech/analytics"

type DateInput = string | Date | null | undefined

const toISODate = (value: DateInput): string => {
  if (!value) return ""

  if (typeof value === "string") {
    return value
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return ""
  }

  const offset = parsed.getTimezoneOffset() * 60_000
  const adjusted = new Date(parsed.getTime() - offset)
  return adjusted.toISOString().slice(0, 10)
}

export const speechAnalyticsService = {
  async getPagos(fechaInicio: string, fechaFin: string): Promise<SpeechPago[]> {
    if (!fechaInicio || !fechaFin) return []
    const response = await speechAnalyticsApi.get<SpeechPago[]>(`/pagos`, {
      params: { fechaInicio, fechaFin },
    })
    return response.data ?? []
  },

  async getPagoDetalle({
    fechaInicio,
    fechaFin,
    idGestion,
  }: {
    fechaInicio: string
    fechaFin: string
    idGestion: string | number
  }): Promise<SpeechPagoDetalle | null> {
    if (!fechaInicio || !fechaFin || !idGestion) return null
    const response = await speechAnalyticsApi.get<SpeechPagoDetalle>(`/pagos/${idGestion}`, {
      params: { fechaInicio, fechaFin },
    })
    return response.data ?? null
  },

  async getReclamos(fechaGestion: string): Promise<SpeechReclamo[]> {
    if (!fechaGestion) return []
    const response = await speechAnalyticsApi.get<SpeechReclamo[]>(`/reclamos`, {
      params: { fecha: fechaGestion },
    })
    return response.data ?? []
  },

  async getCalidadDetalle({
    desde,
    hasta,
  }: {
    desde: DateInput
    hasta: DateInput
  }): Promise<SpeechCalidadDetalle[]> {
    if (!desde || !hasta) return []
    const response = await speechAnalyticsApi.get<SpeechCalidadDetalle[]>(`/calidad`, {
      params: { desde: toISODate(desde), hasta: toISODate(hasta) },
    })
    return response.data ?? []
  },

  async subirFeedbackPdf(payload: SpeechFeedbackUploadPayload) {
    const formData = new FormData()
    formData.append("supervisor", payload.supervisor)
    formData.append("asesor", payload.asesor)
    formData.append("fechaCarpeta", payload.fechaCarpeta)
    formData.append("nombreArchivo", payload.nombreArchivo)
    formData.append("file", payload.archivo, payload.nombreArchivo)

    const response = await speechAnalyticsApi.post("/feedback/save-pdf", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    })
    return response.data
  },

  async obtenerFeedbackPdfUrl(payload: SpeechFeedbackViewPayload): Promise<SpeechFeedbackViewResponse> {
    const response = await speechAnalyticsApi.get<SpeechFeedbackViewResponse>("/feedback/view-url", {
      params: payload,
    })
    return response.data
  },
}

export default speechAnalyticsService
