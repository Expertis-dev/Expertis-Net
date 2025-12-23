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

export const usePagos = (fechaGestion: string) =>
  useQuery<SpeechPago[]>({
    queryKey: ["speech", "pagos", fechaGestion],
    queryFn: () => speechAnalyticsService.getPagos(fechaGestion),
    enabled: Boolean(fechaGestion),
  })

export const usePagoDetalle = (params: { fechaGestion: string; idGestion?: string | number | null }) =>
  useQuery<SpeechPagoDetalle | null>({
    queryKey: ["speech", "pagos", "detalle", params.fechaGestion, params.idGestion],
    queryFn: () =>
      speechAnalyticsService.getPagoDetalle({
        fechaGestion: params.fechaGestion,
        idGestion: params.idGestion as string | number,
      }),
    enabled: Boolean(params.fechaGestion && params.idGestion),
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
