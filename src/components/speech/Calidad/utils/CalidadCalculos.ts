/**
 * Utilidades para cálculos del módulo de Calidad
 */

type NumericLike = number | string | null | undefined

export interface CalidadRegistroAgrupable extends Record<string, unknown> {
  asesor?: string | null
  supervisor?: string | null
  grupo?: string | null
  agencia?: string | null
  promedio?: NumericLike
  calificacion?: NumericLike
  fecha?: string | null
}

export interface CalidadAsesorAgrupado extends Record<string, unknown> {
  asesor: string
  supervisor: string
  agencia: string
  llamadas: CalidadRegistroAgrupable[]
  totalLlamadas: number
  promedio: number
  cantidad: number
  cuartil: string
  semana?: number
}

interface LimitesCuartiles {
  Q1: number
  Q2: number
  Q3: number
}

interface TendenciaResultado {
  icono: string
  delta: string
  clase: "positivo" | "negativo" | "neutral"
}

const normalizarCalificacion = (valor: NumericLike): number => {
  const numero = Number(valor)
  if (Number.isNaN(numero)) return 0
  return Math.min(10, Math.max(0, numero))
}

export const obtenerSemanaDelAno = (fechaISO?: string | null): number => {
  if (!fechaISO) return 0
  const fecha = new Date(fechaISO)
  if (Number.isNaN(fecha.getTime())) return 0
  const primerDiaAno = new Date(fecha.getFullYear(), 0, 1)
  const diasTranscurridos = Math.floor((Number(fecha) - Number(primerDiaAno)) / (24 * 60 * 60 * 1000))
  const semana = Math.ceil((diasTranscurridos + primerDiaAno.getDay() + 1) / 7)
  return semana
}

export const formatearSemana = (numeroSemana: number): string => `Semana ${numeroSemana}`

export const calcularLimitesCuartiles = (valores?: NumericLike[]): LimitesCuartiles => {
  if (!valores || valores.length === 0) {
    const rangoMin = 0
    const rangoMax = 10
    const intervalo = (rangoMax - rangoMin) / 4
    return {
      Q1: rangoMin + intervalo,
      Q2: rangoMin + intervalo * 2,
      Q3: rangoMin + intervalo * 3,
    }
  }

  const normalizados = valores.map(normalizarCalificacion).sort((a, b) => a - b)
  const pickValue = (percentile: number) => {
    if (!normalizados.length) return 0
    const index = Math.min(normalizados.length - 1, Math.floor(percentile))
    return normalizados[index] ?? 0
  }

  return {
    Q1: pickValue(normalizados.length * 0.25),
    Q2: pickValue(normalizados.length * 0.5),
    Q3: pickValue(normalizados.length * 0.75),
  }
}

export const calcularCuartil = (calificacion: NumericLike, limitesCuartiles?: LimitesCuartiles): "Q1" | "Q2" | "Q3" | "Q4" => {
  const cal = normalizarCalificacion(calificacion)

  if (!limitesCuartiles) return "Q1"
  if (cal >= limitesCuartiles.Q3) return "Q1"
  if (cal >= limitesCuartiles.Q2) return "Q2"
  if (cal >= limitesCuartiles.Q1) return "Q3"
  return "Q4"
}

export const calcularPromedio = (valores: NumericLike[]): number => {
  if (!valores || valores.length === 0) return 0
  const suma = valores.reduce((acc: number, val) => acc + normalizarCalificacion(val), 0)
  return Number((suma / valores.length).toFixed(2))
}

const ensureCriterioArray = (grupo: CalidadAsesorAgrupado, indice: number): number[] => {
  const key = `criterio${indice}`
  const valores = (grupo[key] as number[] | undefined) ?? []
  if (!grupo[key]) {
    grupo[key] = valores
  }
  return valores
}

export const agruparPorAsesor = (datos: CalidadRegistroAgrupable[]): CalidadAsesorAgrupado[] => {
  const agrupado: Record<string, CalidadAsesorAgrupado> = {}

  datos.forEach((item) => {
    const asesor = (item.asesor || "Sin Asesor") as string

    if (!agrupado[asesor]) {
      agrupado[asesor] = {
        asesor,
        supervisor: (item.supervisor || item.grupo || "") as string,
        agencia: (item.agencia || "") as string,
        llamadas: [],
        totalLlamadas: 0,
        promedio: 0,
        cantidad: 0,
        cuartil: "",
      }
    }

    agrupado[asesor].llamadas.push(item)
    agrupado[asesor].totalLlamadas += 1

    for (let i = 1; i <= 7; i += 1) {
      const criterio = item[`criterio${i}`]
      if (criterio != null) {
        const valores = ensureCriterioArray(agrupado[asesor], i)
        valores.push(normalizarCalificacion(criterio as NumericLike))
      }
    }
  })

  const grupos = Object.values(agrupado)
  grupos.forEach((grupo) => {
    const calificaciones = grupo.llamadas.map((l) => normalizarCalificacion(l.promedio))
    grupo.promedio = calcularPromedio(calificaciones)
    grupo.cantidad = grupo.totalLlamadas

    for (let i = 1; i <= 7; i += 1) {
      const valores = (grupo[`criterio${i}`] as number[] | undefined) ?? []
      grupo[`criterio${i}Promedio`] = calcularPromedio(valores)
    }
  })

  const limitesCuartiles = calcularLimitesCuartiles(grupos.map((g) => g.promedio))
  grupos.forEach((grupo) => {
    grupo.cuartil = calcularCuartil(grupo.promedio, limitesCuartiles)
  })

  return grupos
}

export const agruparPorAsesorYSemana = (datos: CalidadRegistroAgrupable[]): CalidadAsesorAgrupado[] => {
  const agrupado: Record<string, CalidadAsesorAgrupado> = {}

  datos.forEach((item) => {
    const asesor = (item.asesor || "Sin Asesor") as string
    const semanaBase = typeof item.fecha === "string" ? item.fecha : null
    const semana = obtenerSemanaDelAno(semanaBase)
    const clave = `${asesor}_${semana}`

    if (!agrupado[clave]) {
      agrupado[clave] = {
        asesor,
        supervisor: (item.supervisor || item.grupo || "") as string,
        agencia: (item.agencia || "") as string,
        semana,
        llamadas: [],
        totalLlamadas: 0,
        promedio: 0,
        cantidad: 0,
        cuartil: "",
      }
    }

    agrupado[clave].llamadas.push(item)
    agrupado[clave].totalLlamadas += 1
  })

  const grupos = Object.values(agrupado)
  grupos.forEach((grupo) => {
    const calificaciones = grupo.llamadas.map((l) => normalizarCalificacion(l.calificacion ?? l.promedio))
    grupo.promedio = calcularPromedio(calificaciones)
  })

  const limitesCuartiles = calcularLimitesCuartiles(grupos.map((g) => g.promedio))
  grupos.forEach((grupo) => {
    grupo.cuartil = calcularCuartil(grupo.promedio, limitesCuartiles)
  })

  return grupos
}

export const calcularTendencia = (valorActual: NumericLike, valorAnterior: NumericLike): TendenciaResultado => {
  const actual = normalizarCalificacion(valorActual)
  const anterior = normalizarCalificacion(valorAnterior)

  if (anterior === 0) {
    return { icono: "=", delta: "0%", clase: "neutral" }
  }

  const diferencia = actual - anterior
  const porcentaje = ((diferencia / anterior) * 100).toFixed(1)

  if (diferencia > 0) {
    return { icono: "up", delta: `+${porcentaje}%`, clase: "positivo" }
  }
  if (diferencia < 0) {
    return { icono: "down", delta: `${porcentaje}%`, clase: "negativo" }
  }

  return { icono: "=", delta: "0%", clase: "neutral" }
}

export const obtenerUltimas4Semanas = (datosAgrupados: CalidadAsesorAgrupado[]): CalidadAsesorAgrupado[] => {
  const semanasUnicas = [...new Set(datosAgrupados.map((d) => d.semana ?? 0))].sort((a, b) => b - a)
  const ultimas4 = semanasUnicas.slice(0, 4).sort((a, b) => a - b)
  return datosAgrupados.filter((d) => d.semana != null && ultimas4.includes(d.semana))
}

export const normalizar = (texto?: string | null): string => {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim()
}

const esAgrupado = (dato: CalidadRegistroAgrupable | CalidadAsesorAgrupado): dato is CalidadAsesorAgrupado => {
  return Array.isArray((dato as CalidadAsesorAgrupado).llamadas)
}

export const calcularKPIsGenerales = (datos: Array<CalidadRegistroAgrupable | CalidadAsesorAgrupado>) => {
  if (!datos || datos.length === 0) {
    return {
      totalLlamadas: 0,
      totalAsesores: 0,
      promedioGeneral: 0,
      mejorPromedio: 0,
    }
  }

  let calificaciones: number[] = []
  let totalAsesores = 0
  let mejorPromedio = 0
  let totalLlamadas = 0

  if (esAgrupado(datos[0]!)) {
    const agrupados = datos as CalidadAsesorAgrupado[]
    totalAsesores = agrupados.length
    calificaciones = agrupados.map((d) => normalizarCalificacion(d.promedio))
    mejorPromedio = Math.max(...calificaciones, 0)
    totalLlamadas = agrupados.reduce((sum, d) => sum + (d.totalLlamadas || 0), 0)
  } else {
    const detalle = datos as CalidadRegistroAgrupable[]
    calificaciones = detalle.map((d) => normalizarCalificacion(d.promedio))
    totalLlamadas = detalle.length
    mejorPromedio = Math.max(...calificaciones, 0)
  }

  return {
    totalLlamadas,
    totalAsesores,
    promedioGeneral: calcularPromedio(calificaciones),
    mejorPromedio,
  }
}

export const distribuirPorCuartiles = (datosAgrupados: CalidadAsesorAgrupado[]) => {
  const distribucion = {
    Q1: datosAgrupados.filter((d) => d.cuartil === "Q1").length,
    Q2: datosAgrupados.filter((d) => d.cuartil === "Q2").length,
    Q3: datosAgrupados.filter((d) => d.cuartil === "Q3").length,
    Q4: datosAgrupados.filter((d) => d.cuartil === "Q4").length,
  }

  return distribucion
}
