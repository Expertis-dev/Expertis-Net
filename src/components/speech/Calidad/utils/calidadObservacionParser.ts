import { CALIDAD_PESOS_ITEMS, type CalidadPesoItem } from "./calidadPesos"

type EstadoCumplimiento = "SI" | "NO"

export interface CalidadSubcriterioParseado {
  grupo: string
  subcriterio: string
  estado: EstadoCumplimiento
  pesoGrupo: string | null
  pesoItem: string | null
}

export interface CalidadObservacionParseada {
  observacion: string
  subcriterios: CalidadSubcriterioParseado[]
}

const normalizeText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9/\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const normalizeGroup = (group: string): string => {
  const token = normalizeText(group)
  if (token.includes("apertura")) return "Apertura"
  if (token.includes("negociacion")) return "Negociacion"
  if (token.includes("comunicacion")) return "Comunicacion Efectiva"
  if (token.includes("cierre")) return "Cierre"
  if (token.includes("actitud")) return "Actitud"
  if (token.includes("cumplimiento")) return "Cumplimiento Normativo"
  return group.trim() || "Sin grupo"
}

const hasAnyToken = (text: string, tokens: string[]) => tokens.some((token) => text.includes(token))

const scoreByTokenOverlap = (source: string, target: string) => {
  const sourceTokens = new Set(source.split(" ").filter((token) => token.length > 2))
  const targetTokens = target.split(" ").filter((token) => token.length > 2)
  if (!sourceTokens.size || !targetTokens.length) return 0
  let score = 0
  targetTokens.forEach((token) => {
    if (sourceTokens.has(token)) score += 1
  })
  return score
}

const findByGroupAlias = (normalizedItem: string, normalizedGroupHint: string): CalidadPesoItem | null => {
  const group = normalizeGroup(normalizedGroupHint)
  if (group === "Apertura") {
    if (hasAnyToken(normalizedItem, ["saludo", "saluda", "valida", "identidad", "cliente", "titular"])) {
      return CALIDAD_PESOS_ITEMS.find((item) => item.numero === 1) ?? null
    }
    if (hasAnyToken(normalizedItem, ["presentacion", "presenta", "asesor", "empresa", "nombre"])) {
      return CALIDAD_PESOS_ITEMS.find((item) => item.numero === 2) ?? null
    }
    if (hasAnyToken(normalizedItem, ["motivo", "deuda", "llamada", "mencion"])) {
      return CALIDAD_PESOS_ITEMS.find((item) => item.numero === 3) ?? null
    }
  }

  if (group === "Cierre") {
    if (hasAnyToken(normalizedItem, ["medios", "formas", "pago", "explica", "indica"])) {
      return CALIDAD_PESOS_ITEMS.find((item) => item.numero === 16) ?? null
    }
    if (hasAnyToken(normalizedItem, ["envia", "envio", "documentos", "autorizados", "permitidos"])) {
      return CALIDAD_PESOS_ITEMS.find((item) => item.numero === 17) ?? null
    }
  }

  return null
}

const findPesoItem = (subcriterio: string, groupHint?: string | null): CalidadPesoItem | null => {
  const normalizedItem = normalizeText(subcriterio)
  const normalizedGroupHint = groupHint ? normalizeText(groupHint) : ""

  const groupMatches = CALIDAD_PESOS_ITEMS.filter((item) => {
    if (!normalizedGroupHint) return true
    return normalizeText(item.grupo) === normalizedGroupHint
  })

  const exact = groupMatches.find((item) => normalizeText(item.criterio) === normalizedItem)
  if (exact) return exact

  const partial = groupMatches.find((item) => {
    const criterio = normalizeText(item.criterio)
    return criterio.includes(normalizedItem) || normalizedItem.includes(criterio)
  })
  if (partial) return partial

  if (normalizedGroupHint) {
    const byAlias = findByGroupAlias(normalizedItem, normalizedGroupHint)
    if (byAlias) return byAlias
  }

  const bestByScore = groupMatches
    .map((item) => ({
      item,
      score: scoreByTokenOverlap(normalizeText(item.criterio), normalizedItem),
    }))
    .sort((a, b) => b.score - a.score)[0]
  if (bestByScore && bestByScore.score >= 2) {
    return bestByScore.item
  }

  const withoutGroup = CALIDAD_PESOS_ITEMS.find((item) => {
    const criterio = normalizeText(item.criterio)
    return criterio.includes(normalizedItem) || normalizedItem.includes(criterio)
  })
  return withoutGroup ?? null
}

const splitOverviewAndDetail = (raw: string): { observacion: string; detalle: string } => {
  if (!raw.trim()) return { observacion: "", detalle: "" }

  const markerRegex = /-{2,}\s*detalle por dimensi[oó]n\s*-{2,}/i
  const markerMatch = markerRegex.exec(raw)
  if (markerMatch?.index != null) {
    const observacion = raw.slice(0, markerMatch.index).trim()
    const detalle = raw.slice(markerMatch.index + markerMatch[0].length).trim()
    return { observacion, detalle }
  }

  return { observacion: raw.trim(), detalle: raw.trim() }
}

export const parseCalidadObservacion = (value?: string | null): CalidadObservacionParseada | null => {
  const raw = (value ?? "").trim()
  if (!raw) return null

  const { observacion, detalle } = splitOverviewAndDetail(raw)
  if (!detalle) {
    return { observacion, subcriterios: [] }
  }

  const canonical = detalle
    .replace(/\r/g, "\n")
    .replace(/•/g, "\n• ")
    .replace(/\t/g, " ")
    .replace(/\s{2,}(?=[A-Za-z][^:\n]{2,}:)/g, "\n")

  const lines = canonical
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  const subcriterios: CalidadSubcriterioParseado[] = []
  let currentGroup: string | null = null

  lines.forEach((line) => {
    const groupMatch = line.match(/^([A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+):$/)
    if (groupMatch) {
      currentGroup = normalizeGroup(groupMatch[1] ?? "")
      return
    }

    const cleanLine = line.replace(/^[•*-]\s*/, "").trim()
    const statusMatch = cleanLine.match(/:\s*(SI|S[IÍ]|NO)\s*$/i)
    if (!statusMatch) {
      return
    }

    const estado = normalizeText(statusMatch[1] ?? "") === "no" ? "NO" : "SI"
    const splitIndex = cleanLine.lastIndexOf(":")
    const subcriterioLabel = splitIndex >= 0 ? cleanLine.slice(0, splitIndex).trim() : cleanLine
    const pesoItem = findPesoItem(subcriterioLabel, currentGroup)
    const resolvedGroup = pesoItem?.grupo ?? currentGroup ?? "Sin grupo"

    subcriterios.push({
      grupo: resolvedGroup,
      subcriterio: subcriterioLabel,
      estado,
      pesoGrupo: pesoItem?.pesoGrupo ?? null,
      pesoItem: pesoItem?.pesoItem ?? null,
    })
  })

  return {
    observacion,
    subcriterios,
  }
}
