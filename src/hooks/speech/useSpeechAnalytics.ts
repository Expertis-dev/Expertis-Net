"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import speechAnalyticsService from "@/services/speech/speechAnalytics"
import type {
  SpeechCalidadDetalle,
  SpeechFeedbackUploadPayload,
  SpeechFeedbackViewPayload,
  SpeechPago,
  SpeechPagoDetalle,
  SpeechReclamo,
} from "@/types/speech/analytics"

export const usePagos = (params: { fechaInicio: string; fechaFin: string }) =>
  useQuery<SpeechPago[]>({
    queryKey: ["speech", "pagos", params.fechaInicio, params.fechaFin],
    queryFn: () => speechAnalyticsService.getPagos(params.fechaInicio, params.fechaFin),
    enabled: Boolean(params.fechaInicio && params.fechaFin),
  })

export const usePagoDetalle = (params: {
  fechaInicio: string
  fechaFin: string
  idGestion?: string | number | null
}) =>
  useQuery<SpeechPagoDetalle | null>({
    queryKey: ["speech", "pagos", "detalle", params.fechaInicio, params.fechaFin, params.idGestion],
    queryFn: () =>
      speechAnalyticsService.getPagoDetalle({
        fechaInicio: params.fechaInicio,
        fechaFin: params.fechaFin,
        idGestion: params.idGestion as string | number,
      }),
    enabled: Boolean(params.fechaInicio && params.fechaFin && params.idGestion),
    staleTime: 5 * 60 * 1000,
  })

export const useReclamos = (fechaGestion: string) =>
  useQuery<SpeechReclamo[]>({
    queryKey: ["speech", "reclamos", fechaGestion],
    queryFn: () => speechAnalyticsService.getReclamos(fechaGestion),
    enabled: Boolean(fechaGestion),
  })

export const useCalidadDetalle = (params: { desde: string; hasta: string }) =>
  useQuery<SpeechCalidadDetalle[]>({
    queryKey: ["speech", "calidad", params.desde, params.hasta],
    queryFn: () => speechAnalyticsService.getCalidadDetalle(params),
    enabled: Boolean(params.desde && params.hasta),
  })

export const useSubirFeedbackPdf = () =>
  useMutation({
    mutationFn: (payload: SpeechFeedbackUploadPayload) => speechAnalyticsService.subirFeedbackPdf(payload),
  })

export const useFeedbackPdfUrl = () =>
  useMutation({
    mutationFn: (payload: SpeechFeedbackViewPayload) => speechAnalyticsService.obtenerFeedbackPdfUrl(payload),
  })
