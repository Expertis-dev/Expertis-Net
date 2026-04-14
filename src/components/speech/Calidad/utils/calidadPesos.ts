export interface CalidadPesoItem {
  numero: number
  pesoGrupo: string
  pesoItem: string
  grupo: string
  criterio: string
}

export const CALIDAD_PESOS_ITEMS: CalidadPesoItem[] = [
  { numero: 1, pesoGrupo: "10%", pesoItem: "3%", grupo: "Apertura", criterio: "Saluda y valida la identidad del titular de la llamada" },
  { numero: 2, pesoGrupo: "10%", pesoItem: "3%", grupo: "Apertura", criterio: "Se presenta correctamente como asesor y como empresa" },
  { numero: 3, pesoGrupo: "10%", pesoItem: "4%", grupo: "Apertura", criterio: "Indica el motivo de llamada" },
  { numero: 4, pesoGrupo: "40%", pesoItem: "6%", grupo: "Negociacion", criterio: "Indaga sobre la situacion de la deuda y ofrece soluciones de pago personalizadas" },
  { numero: 5, pesoGrupo: "40%", pesoItem: "7%", grupo: "Negociacion", criterio: "Negocia de manera escalonada" },
  { numero: 6, pesoGrupo: "40%", pesoItem: "5%", grupo: "Negociacion", criterio: "Presenta buen manejo de objeciones" },
  { numero: 7, pesoGrupo: "40%", pesoItem: "5%", grupo: "Negociacion", criterio: "Genera urgencia para la solucion" },
  { numero: 8, pesoGrupo: "40%", pesoItem: "5%", grupo: "Negociacion", criterio: "Valida procedencia/sustento del dinero" },
  { numero: 9, pesoGrupo: "40%", pesoItem: "7%", grupo: "Negociacion", criterio: "Persevera en el cierre de compromiso" },
  { numero: 10, pesoGrupo: "40%", pesoItem: "5%", grupo: "Negociacion", criterio: "Uso de beneficios y advertencias" },
  { numero: 11, pesoGrupo: "20%", pesoItem: "4%", grupo: "Comunicacion Efectiva", criterio: "Demuestra escucha activa" },
  { numero: 12, pesoGrupo: "20%", pesoItem: "4%", grupo: "Comunicacion Efectiva", criterio: "Muestra seguridad" },
  { numero: 13, pesoGrupo: "20%", pesoItem: "4%", grupo: "Comunicacion Efectiva", criterio: "Uso adecuado y persuasion con el tono de voz" },
  { numero: 14, pesoGrupo: "20%", pesoItem: "4%", grupo: "Comunicacion Efectiva", criterio: "Tiene buena diccion" },
  { numero: 15, pesoGrupo: "20%", pesoItem: "4%", grupo: "Comunicacion Efectiva", criterio: "Manejo de los tiempos" },
  { numero: 16, pesoGrupo: "10%", pesoItem: "5%", grupo: "Cierre", criterio: "Indica formas y medios de pago" },
  { numero: 17, pesoGrupo: "10%", pesoItem: "5%", grupo: "Cierre", criterio: "Envio de documentos autorizados" },
  { numero: 18, pesoGrupo: "10%", pesoItem: "5%", grupo: "Actitud", criterio: "Muestra empatia con el cliente y buena actitud" },
  { numero: 19, pesoGrupo: "10%", pesoItem: "5%", grupo: "Actitud", criterio: "No genera mala reaccion en el cliente" },
  { numero: 20, pesoGrupo: "10%", pesoItem: "5%", grupo: "Cumplimiento Normativo", criterio: "No menciona datos personales" },
  { numero: 21, pesoGrupo: "10%", pesoItem: "5%", grupo: "Cumplimiento Normativo", criterio: "Cumple con metodos de cobranza autorizados" },
]

export const CALIDAD_PESOS_GRUPO = [
  { grupo: "Apertura", pesoGrupo: "10%" },
  { grupo: "Negociacion", pesoGrupo: "40%" },
  { grupo: "Comunicacion Efectiva", pesoGrupo: "20%" },
  { grupo: "Cierre", pesoGrupo: "10%" },
  { grupo: "Actitud", pesoGrupo: "10%" },
  { grupo: "Cumplimiento Normativo", pesoGrupo: "10%" },
]
