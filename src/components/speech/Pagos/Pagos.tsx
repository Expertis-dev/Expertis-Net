"use client"

import { useEffect, useMemo, useState, type ElementType } from "react"
import { saveAs } from "file-saver"
import * as XLSX from "xlsx"
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  Filter as FilterIcon,
  Eraser,
  Loader2,
  MessageSquare,
  Search,
  Star,
  User2,
} from "lucide-react"
import { usePagos, usePagoDetalle } from "@/hooks/speech/useSpeechAnalytics"
import { useSpeechAccess } from "@/hooks/speech/useSpeechAccess"
import { useSpeechPermissions } from "@/hooks/speech/useSpeechPermissions"
import type { SpeechPago } from "@/types/speech/analytics"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type ModalTipo = "transcripcion" | "resumen" | "observacion" | ""

interface ColumnDefinition {
  id: keyof SpeechPago | "acciones"
  label: string
  filtrable?: boolean
  ordenable?: boolean
}

const columnas: ColumnDefinition[] = [
  { id: "documento", label: "Documento", filtrable: true, ordenable: true },
  { id: "cartera", label: "Cartera", filtrable: true, ordenable: true },
  { id: "deudaCapital", label: "Deuda Capital", filtrable: true, ordenable: true },
  { id: "deudaTotal", label: "Deuda Total", filtrable: true, ordenable: true },
  { id: "cosecha", label: "Cosecha", filtrable: true, ordenable: true },
  { id: "fecha", label: "Fecha", ordenable: true },
  { id: "horaInicio", label: "Hora Inicio", ordenable: true },
  { id: "tiempoHablado", label: "Duración", ordenable: true },
  { id: "agencia", label: "Agencia", filtrable: true, ordenable: true },
  { id: "supervisor", label: "Supervisor", filtrable: true, ordenable: true },
  { id: "calificacion", label: "Calificación", ordenable: true },
  { id: "acciones", label: "Acciones" },
]

type SpeechPagoNormalizado = SpeechPago & { carteraNormalizada?: string }

const toOptionalString = (value: unknown): string | undefined => {
  if (value == null) return undefined
  return String(value).trim()
}

const toCamelCase = (key: string) => {
  const trimmed = key?.trim().replace(/[\[\]]/g, "")
  if (!trimmed) return ""
  const isUpperish = /^[A-Z0-9 _-]+$/.test(trimmed)
  const base = isUpperish ? trimmed.toLowerCase() : trimmed
  const camel = base.replace(/[\s_-]+(.)/g, (_, chr: string) => chr.toUpperCase())
  return camel.replace(/^[A-Z]/, (chr) => chr.toLowerCase())
}

const normalizeRecord = (record: Record<string, unknown>) => {
  const normalized: Record<string, unknown> = {}
  Object.entries(record).forEach(([key, value]) => {
    if (!key) return
    normalized[toCamelCase(key)] = value
  })
  return normalized
}

const normalizarCartera = (value: unknown): string => {
  const texto = toOptionalString(value)?.toLowerCase() ?? ""
  if (texto.startsWith("intern")) return "interno"
  if (texto.startsWith("extern")) return "externo"
  if (texto.startsWith("judicial")) return "judicial"
  return texto
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0

const calificacionBadgeStyles = (calificacion: SpeechPago["calificacion"]) => {
  const cal = Number(calificacion) || 0
  if (cal >= 3.5) return "border-emerald-200 bg-emerald-100 text-emerald-800"
  if (cal >= 3.0) return "border-sky-200 bg-sky-100 text-sky-800"
  if (cal >= 2.5) return "border-amber-200 bg-amber-100 text-amber-800"
  return "border-rose-200 bg-rose-100 text-rose-800"
}

const EstadoCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType
  title: string
  description: string
}) => (
  <Card className="border-dashed">
    <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
      <Icon className="h-10 w-10 text-primary" />
      <div className="space-y-1">
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  </Card>
)

const Pagos = () => {
  const { hasPermiso } = useSpeechPermissions()
  const { alias: aliasActual, isAdmin: puedeUsarFiltrosAvanzados } = useSpeechAccess()

  const [fechaGestion, setFechaGestion] = useState("")
  const [fechaGestionTemp, setFechaGestionTemp] = useState("")
  const [botonActivo, setBotonActivo] = useState<"prometedoras" | "mejorables">("prometedoras")
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState("")
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [modalTipo, setModalTipo] = useState<ModalTipo>("")
  const [detalleIdGestion, setDetalleIdGestion] = useState<string | number | null>(null)
  const [menuFiltroAbierto, setMenuFiltroAbierto] = useState<string | null>(null)
  const [filtrosColumnas, setFiltrosColumnas] = useState<Record<string, string[] | undefined>>({})
  const [ordenColumna, setOrdenColumna] = useState<{ columna: string; direccion: "asc" | "desc" }>({
    columna: "",
    direccion: "asc",
  })
  const [filasPorPagina, setFilasPorPagina] = useState(7)
  const [paginaActual, setPaginaActual] = useState(1)

  const {
    data: dataPagos = [],
    isLoading,
    error,
  } = usePagos(fechaGestion)

  const {
    data: detallePagoRaw,
    isFetching: isDetalleCargando,
    error: errorDetalle,
  } = usePagoDetalle({
    fechaGestion,
    idGestion: detalleIdGestion,
  })

  const detallePago = useMemo(() => {
    if (!detallePagoRaw) return null
    const source = normalizeRecord(detallePagoRaw as Record<string, unknown>)
    const pickString = (key: string) =>
      toOptionalString(source[key]) ??
      (typeof (detallePagoRaw as Record<string, unknown>)[key] === "string"
        ? ((detallePagoRaw as Record<string, unknown>)[key] as string)
        : undefined)

    return {
      ...detallePagoRaw,
      idGestion:
        (source.idGestion as SpeechPago["idGestion"]) ??
        detallePagoRaw.idGestion ??
        (detallePagoRaw as Record<string, unknown>).IdGestion,
      transcripcion: pickString("transcripcion") ?? detallePagoRaw.transcripcion ?? null,
      resumen: pickString("resumen") ?? detallePagoRaw.resumen ?? null,
      observacion: pickString("observacion") ?? detallePagoRaw.observacion ?? null,
    }
  }, [detallePagoRaw])

  const tienePermisoInterno = hasPermiso("PERMISO_PagosInterno-ver")
  const tienePermisoExterno = hasPermiso("PERMISO_PagosExterno-ver")
  const tienePermisoJudicial = hasPermiso("PERMISO_PagosJudicial-ver")

  const datosCompletos = useMemo<SpeechPagoNormalizado[]>(() => {
    if (!Array.isArray(dataPagos)) return []
    return dataPagos
      .map<SpeechPagoNormalizado>((item) => {
        const source = normalizeRecord(item as Record<string, unknown>)
        const documento =
          toOptionalString(source.documento) ??
          toOptionalString(source.idGestion) ??
          (item.documento ?? undefined)
        const cartera = toOptionalString(source.cartera) ?? (item.cartera ?? undefined)
        const carteraNormalizada = normalizarCartera(cartera)
        const fecha =
          toOptionalString(source.fecha ?? source.fecGestion ?? source.fechaGestion ?? source.fechaLlamada) ??
          (item.fecha ?? undefined)
        const horaInicio =
          toOptionalString(source.horaInicio ?? source.horaInicioGestion ?? source.horaInicioLl ?? source.hora) ??
          (item.horaInicio ?? undefined)
        const tiempoHablado =
          toOptionalString(source.tiempoHablado ?? source.tiempHablado ?? source.duracion ?? source.tiempo) ??
          (item.tiempoHablado ?? undefined)

        return {
          ...item,
          idGestion:
            (source.idGestion as SpeechPago["idGestion"]) ??
            (item as SpeechPago).idGestion ??
            (item as Record<string, unknown>).IdGestion ??
            undefined,
          documento,
          cartera,
          fecha,
          horaInicio,
          tiempoHablado,
          agencia: toOptionalString(source.agencia ?? source.aliasAgencia ?? source.agenciaNombre) ??
            (item.agencia ?? undefined),
          supervisor:
            toOptionalString(source.supervisor ?? source.grupo ?? source.supervisorNombre) ??
            (item.supervisor ?? undefined),
          asesor: toOptionalString(source.asesor ?? source.alias) ?? (item as any).asesor,
          cosecha: toOptionalString(source.cosecha) ?? (item.cosecha ?? undefined),
          deudaCapital:
            (source.deudaCapital as SpeechPago["deudaCapital"]) ??
            (source.deudaCapitalTotal as SpeechPago["deudaCapital"]) ??
            (item.deudaCapital ?? undefined),
          deudaTotal:
            (source.deudaTotal as SpeechPago["deudaTotal"]) ??
            (source.deuda as SpeechPago["deudaTotal"]) ??
            (item.deudaTotal ?? undefined),
          calificacion:
            (source.calificacion as SpeechPago["calificacion"]) ??
            (source.calificacionTotal as SpeechPago["calificacion"]) ??
            (source.promedio as SpeechPago["calificacion"]) ??
            (item.calificacion ?? undefined),
          tipificacion: toOptionalString(source.tipificacion ?? source.indLlamada) ?? (item as any).tipificacion,
          grabacion: toOptionalString(source.grabacion ?? source.rutGrabacion) ?? (item as any).grabacion,
          razonNoPago: toOptionalString(source.razonNoPago ?? source.razonNoPagoDescripcion ?? source.razon) ??
            (item as any).razonNoPago,
          tratamiento: toOptionalString(source.tratamiento ?? source.segmentoTratamiento) ?? (item as any).tratamiento,
          resumen: toOptionalString(source.resumen) ?? (item.resumen ?? undefined),
          observacion: toOptionalString(source.observacion) ?? (item.observacion ?? undefined),
          transcripcion: toOptionalString(source.transcripcion) ?? (item.transcripcion ?? undefined),
          carteraNormalizada,
        }
      })
      .filter((item) => {
        const cartera = item.carteraNormalizada ?? ""
        if (cartera === "interno" && !tienePermisoInterno) return false
        if (cartera === "externo" && !tienePermisoExterno) return false
        if (cartera === "judicial" && !tienePermisoJudicial) return false
        return true
      })
  }, [dataPagos, tienePermisoInterno, tienePermisoExterno, tienePermisoJudicial])

  const datosPrometedoras = useMemo(
    () =>
      datosCompletos.filter((item) => {
        const calificacion = Number(item.calificacion) || 0
        return calificacion >= 2
      }),
    [datosCompletos],
  )

  const datosMejorables = useMemo(
    () =>
      datosCompletos.filter((item) => {
        const calificacion = Number(item.calificacion) || 0
        return calificacion < 2
      }),
    [datosCompletos],
  )

  const datosActivos = botonActivo === "prometedoras" ? datosPrometedoras : datosMejorables

  const agenciasUnicas = useMemo(() => {
    const agencias = datosActivos
      .map((item) => item.agencia)
      .filter((agencia): agencia is string => isNonEmptyString(agencia))
    return [...new Set(agencias)].sort()
  }, [datosActivos])

  const supervisoresUnicos = useMemo(() => {
    const supervisores = datosActivos
      .filter((item) => (agenciaSeleccionada ? item.agencia === agenciaSeleccionada : true))
      .map((item) => item.supervisor)
      .filter((supervisor): supervisor is string => isNonEmptyString(supervisor))
    return [...new Set(supervisores)].sort()
  }, [datosActivos, agenciaSeleccionada])

  useEffect(() => {
    if (!puedeUsarFiltrosAvanzados) {
      return
    }
    setSupervisorSeleccionado("")
  }, [agenciaSeleccionada, puedeUsarFiltrosAvanzados])

  useEffect(() => {
    if (puedeUsarFiltrosAvanzados) {
      return
    }
    setAgenciaSeleccionada("EXPERTIS")
    setSupervisorSeleccionado(aliasActual ?? "")
    setFiltrosColumnas({})
    setMenuFiltroAbierto(null)
  }, [puedeUsarFiltrosAvanzados, aliasActual])

  const datosFiltrados = useMemo(() => {
    let datos = [...datosActivos]
    if (puedeUsarFiltrosAvanzados && agenciaSeleccionada) {
      datos = datos.filter((item) => item.agencia === agenciaSeleccionada)
    }
    if (puedeUsarFiltrosAvanzados && supervisorSeleccionado) {
      datos = datos.filter((item) => item.supervisor === supervisorSeleccionado)
    }
    if (puedeUsarFiltrosAvanzados) {
      Object.entries(filtrosColumnas).forEach(([columna, valores]) => {
        if (valores && valores.length > 0) {
          datos = datos.filter((item) => valores.includes(String(item[columna as keyof SpeechPago] ?? "")))
        }
      })
    }
    return datos
  }, [datosActivos, agenciaSeleccionada, supervisorSeleccionado, filtrosColumnas, puedeUsarFiltrosAvanzados])

  const datosOrdenados = useMemo(() => {
    if (!ordenColumna.columna) return datosFiltrados
    return [...datosFiltrados].sort((a, b) => {
      const valorA = (a as Record<string, unknown>)[ordenColumna.columna]
      const valorB = (b as Record<string, unknown>)[ordenColumna.columna]
      if (valorA == null) return 1
      if (valorB == null) return -1
      const comparacion = valorA < valorB ? -1 : valorA > valorB ? 1 : 0
      return ordenColumna.direccion === "asc" ? comparacion : -comparacion
    })
  }, [datosFiltrados, ordenColumna])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!fechaGestion || datosOrdenados.length === 0) {
      setFilasPorPagina((prev) => (prev === 7 ? prev : 7))
      return
    }
    const calcularFilas = () => {
      const contentEl = document.querySelector("[data-pagos-content]") as HTMLElement | null
      if (!contentEl) return
      const filtrosAltura = contentEl.querySelector("[data-pagos-filtros]")?.getBoundingClientRect().height ?? 0
      const tabsAltura = contentEl.querySelector("[data-pagos-tabs]")?.getBoundingClientRect().height ?? 0
      const paginacionAltura = contentEl.querySelector("[data-pagos-pagination]")?.getBoundingClientRect().height ?? 72
      const espacioDisponible = contentEl.clientHeight - filtrosAltura - tabsAltura - paginacionAltura - 30
      const filaAltura =
        (contentEl.querySelector("tbody tr") as HTMLElement | null)?.getBoundingClientRect().height ?? 48
      if (espacioDisponible <= 0 || filaAltura <= 0) return
      const posiblesFilas = Math.max(5, Math.floor(espacioDisponible / filaAltura) - 1)
      if (Number.isFinite(posiblesFilas) && posiblesFilas > 0) {
        setFilasPorPagina((prev) => (prev === posiblesFilas ? prev : posiblesFilas))
      }
    }
    const rafId = window.requestAnimationFrame(calcularFilas)
    window.addEventListener("resize", calcularFilas)
    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener("resize", calcularFilas)
    }
  }, [fechaGestion, datosOrdenados.length, botonActivo])

  const filasPorPaginaActivas = Math.max(1, filasPorPagina)
  const totalPaginas = Math.max(1, Math.ceil(datosOrdenados.length / filasPorPaginaActivas))

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * filasPorPaginaActivas
    return datosOrdenados.slice(inicio, inicio + filasPorPaginaActivas)
  }, [datosOrdenados, paginaActual, filasPorPaginaActivas])

  useEffect(() => {
    setPaginaActual(1)
  }, [botonActivo, agenciaSeleccionada, supervisorSeleccionado, fechaGestion, filtrosColumnas, filasPorPaginaActivas])

  useEffect(() => {
    setPaginaActual((prev) => Math.min(prev, totalPaginas))
  }, [totalPaginas])

  const filtrosInteractivosActivos =
    puedeUsarFiltrosAvanzados &&
    (Boolean(agenciaSeleccionada) || Boolean(supervisorSeleccionado) || Object.keys(filtrosColumnas).length > 0)

  const hayFiltrosActivos = Boolean(fechaGestion || fechaGestionTemp) || filtrosInteractivosActivos

  const handleBuscar = () => {
    if (!fechaGestionTemp) {
      toast.error("Por favor, selecciona una fecha de gestión")
      return
    }
    setFechaGestion(fechaGestionTemp)
  }

  const handleLimpiarFiltros = () => {
    setFechaGestion("")
    setFechaGestionTemp("")
    setAgenciaSeleccionada("")
    setSupervisorSeleccionado("")
    setFiltrosColumnas({})
    setMenuFiltroAbierto(null)
    setOrdenColumna({ columna: "", direccion: "asc" })
  }

  const cambiarBoton = (tipo: "prometedoras" | "mejorables") => {
    setBotonActivo(tipo)
    setAgenciaSeleccionada("")
    setSupervisorSeleccionado("")
    setFiltrosColumnas({})
    setOrdenColumna({ columna: "", direccion: "asc" })
  }

  const abrirModal = (fila: SpeechPago, tipo: ModalTipo) => {
    setModalTipo(tipo)
    setDetalleIdGestion(fila?.idGestion ?? null)
    setDialogOpen(true)
  }

  const cerrarModal = () => {
    setDialogOpen(false)
    setModalTipo("")
    setDetalleIdGestion(null)
  }

  const obtenerValoresUnicos = (columna: keyof SpeechPago): string[] => {
    return [...new Set(datosActivos.map((item) => item[columna]).filter(Boolean))].map((valor) => String(valor))
  }

  const handleFiltroColumnaChange = (columna: string, valor: string) => {
    if (!puedeUsarFiltrosAvanzados) {
      return
    }
    setFiltrosColumnas((prev) => {
      const valoresActuales = prev[columna] ?? []
      const nuevosValores = valoresActuales.includes(valor)
        ? valoresActuales.filter((v) => v !== valor)
        : [...valoresActuales, valor]
      return {
        ...prev,
        [columna]: nuevosValores.length > 0 ? nuevosValores : undefined,
      }
    })
  }

  const limpiarFiltroColumna = (columna: string) => {
    if (!puedeUsarFiltrosAvanzados) {
      return
    }
    setFiltrosColumnas((prev) => {
      const nuevo = { ...prev }
      delete nuevo[columna]
      return nuevo
    })
    setMenuFiltroAbierto(null)
  }

  const seleccionarTodosFiltro = (columna: string) => {
    if (!puedeUsarFiltrosAvanzados) {
      return
    }
    const valores = obtenerValoresUnicos(columna as keyof SpeechPago)
    setFiltrosColumnas((prev) => ({
      ...prev,
      [columna]: valores.length ? valores : undefined,
    }))
  }

  const handleOrden = (columna: string) => {
    setOrdenColumna((prev) => {
      if (prev.columna === columna) {
        return {
          columna,
          direccion: prev.direccion === "asc" ? "desc" : "asc",
        }
      }
      return { columna, direccion: "asc" }
    })
  }

  const irPaginaAnterior = () => setPaginaActual((prev) => Math.max(prev - 1, 1))
  const irPaginaSiguiente = () => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))

  const exportarExcel = () => {
    if (datosOrdenados.length === 0) {
      toast.error("No hay datos para exportar")
      return
    }
    const datosExcel = datosOrdenados.map((item) => ({
      Documento: item.documento ?? "",
      Cartera: item.cartera ?? "",
      "Deuda Capital": item.deudaCapital ?? "",
      "Deuda Total": item.deudaTotal ?? "",
      Cosecha: item.cosecha ?? "",
      Fecha: item.fecha ?? "",
      "Hora Inicio": item.horaInicio ?? "",
      Duración: item.tiempoHablado ?? "",
      Agencia: item.agencia ?? "",
      Supervisor: item.supervisor ?? "",
      Calificación: item.calificacion ?? "",
      Resumen: item.resumen ?? "",
      Observación: item.observacion ?? "",
    }))
    const ws = XLSX.utils.json_to_sheet(datosExcel)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Pagos")
    const nombreArchivo = `Pagos_${botonActivo}_${fechaGestion || "todos"}.xlsx`
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], { type: "application/octet-stream" })
    saveAs(blob, nombreArchivo)
  }

  const obtenerContenidoModal = () => {
    if (isDetalleCargando) {
      return "Cargando detalle..."
    }
    if (errorDetalle) {
      return "Error al cargar el detalle."
    }
    if (!detallePago) {
      return "No disponible"
    }
    if (modalTipo === "transcripcion") {
      return detallePago.transcripcion || "No disponible"
    }
    if (modalTipo === "resumen") {
      return detallePago.resumen || "No disponible"
    }
    if (modalTipo === "observacion") {
      return detallePago.observacion || "No disponible"
    }
    return "No disponible"
  }

  const errorMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : "Ocurrió un error inesperado"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Speech Analytics</p>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight">Pagos</h1>
        <p className="text-muted-foreground">
          Analiza gestiones prometedoras y mejorables con clientes potenciales.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4" data-pagos-filtros>
          <div className="flex items-end gap-3 overflow-x-auto pb-2">
            <div className="space-y-2 mr-6">
              <Label htmlFor="fecha">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Fecha de gestión
                </span>
              </Label>
              <Input
                id="fecha"
                type="date"
                value={fechaGestionTemp}
                onChange={(event) => setFechaGestionTemp(event.target.value)}
                className="w-[150px]"
              />
            </div>

            <div className="space-y-2">
              <Label>
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Agencia
                </span>
              </Label>
              <Select
                value={agenciaSeleccionada || "all"}
                onValueChange={(value) => setAgenciaSeleccionada(value === "all" ? "" : value)}
                disabled={!puedeUsarFiltrosAvanzados || datosActivos.length === 0}
              >
                <SelectTrigger id="agencia" className="w-[210px]">
                  <SelectValue placeholder="Todas las agencias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las agencias</SelectItem>
                  {agenciasUnicas.map((agencia) => (
                    <SelectItem key={agencia} value={agencia}>
                      {agencia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                <span className="flex items-center gap-2">
                  <User2 className="h-4 w-4 text-primary" />
                  Supervisor
                </span>
              </Label>
              <Select
                value={supervisorSeleccionado || "all"}
                onValueChange={(value) => setSupervisorSeleccionado(value === "all" ? "" : value)}
                disabled={!puedeUsarFiltrosAvanzados || !agenciaSeleccionada || supervisoresUnicos.length === 0}
              >
                <SelectTrigger id="supervisor" className="w-[210px]">
                  <SelectValue placeholder="Todos los supervisores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los supervisores</SelectItem>
                  {supervisoresUnicos.map((supervisor) => (
                    <SelectItem key={supervisor} value={supervisor}>
                      {supervisor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex items-center gap-2" data-pagos-acciones>
              <Button
                onClick={handleBuscar}
                disabled={!fechaGestionTemp || isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Buscar
              </Button>
              <Button
                variant="outline"
                onClick={handleLimpiarFiltros}
                disabled={!hayFiltrosActivos}
                className="w-full sm:w-auto"
              >
                <Eraser className="h-4 w-4" />
              </Button>

              <div className="hidden h-6 w-px bg-muted sm:mx-1 sm:block" />

              <Button
                variant="secondary"
                onClick={exportarExcel}
                disabled={datosOrdenados.length === 0}
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-12" data-pagos-content>
        <Card className="lg:col-span-12">
          <CardHeader
            className="flex flex-col gap-4 pb-2 lg:flex-row lg:items-center lg:justify-between"
            data-pagos-tabs
          >
            <div>
              <CardTitle>Estado de llamadas</CardTitle>
              <CardDescription>Alterna entre gestiones prometedoras y mejorables.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={botonActivo === "prometedoras" ? "default" : "outline"}
                onClick={() => cambiarBoton("prometedoras")}
                disabled={isLoading}
                className="gap-2"
              >
                <Star className="h-4 w-4" />
                Prometedoras
                <Badge variant={botonActivo === "prometedoras" ? "secondary" : "outline"}>
                  {datosPrometedoras.length}
                </Badge>
              </Button>
              <Button
                variant={botonActivo === "mejorables" ? "default" : "outline"}
                onClick={() => cambiarBoton("mejorables")}
                disabled={isLoading}
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Mejorables
                <Badge variant={botonActivo === "mejorables" ? "secondary" : "outline"}>
                  {datosMejorables.length}
                </Badge>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <EstadoCard
                icon={Loader2}
                title="Cargando datos"
                description="Estamos consultando las gestiones solicitadas..."
              />
            ) : error ? (
              <EstadoCard icon={AlertTriangle} title="Error al cargar" description={errorMessage} />
            ) : !fechaGestion ? (
              <EstadoCard
                icon={CalendarDays}
                title="Selecciona una fecha"
                description="Elige una fecha y presiona buscar para mostrar los registros."
              />
            ) : datosOrdenados.length === 0 ? (
              <EstadoCard
                icon={ClipboardList}
                title="Sin resultados"
                description="No encontramos registros con los filtros actuales."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        {columnas.map((col) => (
                          <TableHead key={col.id} className="whitespace-nowrap">
                            <div className="flex items-center justify-between gap-2">
                              <button
                                type="button"
                                className={cn(
                                  "flex flex-1 items-center gap-1 text-left text-xs font-semibold tracking-wide",
                                  col.ordenable ? "cursor-pointer" : "cursor-default",
                                )}
                                onClick={() => col.ordenable && handleOrden(col.id)}
                              >
                                {col.label}
                                {ordenColumna.columna === col.id && (
                                  <span className="text-muted-foreground">
                                    {ordenColumna.direccion === "asc" ? "▲" : "▼"}
                                  </span>
                                )}
                              </button>
                              {col.filtrable && puedeUsarFiltrosAvanzados && (
                                <Popover
                                  open={menuFiltroAbierto === col.id}
                                  onOpenChange={(open) => setMenuFiltroAbierto(open ? col.id : null)}
                                >
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <FilterIcon
                                        className={cn(
                                          "h-4 w-4 text-muted-foreground",
                                          filtrosColumnas[col.id]?.length ? "text-primary" : undefined,
                                        )}
                                      />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-60 space-y-3" align="end">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-semibold">Filtrar por {col.label}</p>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => seleccionarTodosFiltro(col.id)}
                                        className="h-auto px-2 text-xs"
                                      >
                                        Seleccionar todo
                                      </Button>
                                    </div>
                                    <div className="max-h-48 space-y-2 overflow-y-auto">
                                      {obtenerValoresUnicos(col.id as keyof SpeechPago).map((valor) => (
                                        <label key={valor} className="flex items-center gap-2 text-sm">
                                          <Checkbox
                                            checked={(filtrosColumnas[col.id] || []).includes(valor)}
                                            onCheckedChange={() => handleFiltroColumnaChange(col.id, valor)}
                                          />
                                          <span className="truncate">{valor}</span>
                                        </label>
                                      ))}
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto px-2 text-xs"
                                        onClick={() => limpiarFiltroColumna(col.id)}
                                      >
                                        Limpiar
                                      </Button>
                                      <Button size="sm" className="h-auto px-3 text-xs" onClick={() => setMenuFiltroAbierto(null)}>
                                        Aplicar
                                      </Button>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {datosPaginados.map((fila, idx) => (
                        <TableRow key={`${fila.documento}-${idx}`}>
                          <TableCell>{fila.documento}</TableCell>
                          <TableCell>{fila.cartera}</TableCell>
                          <TableCell>{fila.deudaCapital}</TableCell>
                          <TableCell>{fila.deudaTotal}</TableCell>
                          <TableCell>{fila.cosecha}</TableCell>
                          <TableCell>{fila.fecha}</TableCell>
                          <TableCell>{fila.horaInicio}</TableCell>
                          <TableCell>{fila.tiempoHablado}</TableCell>
                          <TableCell>{fila.agencia}</TableCell>
                          <TableCell>{fila.supervisor}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn("px-3 py-1 font-semibold", calificacionBadgeStyles(fila.calificacion))}
                            >
                              {fila.calificacion}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                title="Ver transcripción"
                                onClick={() => abrirModal(fila, "transcripcion")}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                title="Ver resumen"
                                onClick={() => abrirModal(fila, "resumen")}
                              >
                                <ClipboardList className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                title="Ver observación"
                                onClick={() => abrirModal(fila, "observacion")}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div
                  className="flex flex-col gap-3 border-t px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between"
                  data-pagos-pagination
                >
                  <p className="text-muted-foreground">
                    Mostrando <span className="font-semibold text-foreground">{datosPaginados.length}</span> de{" "}
                    <span className="font-semibold text-foreground">{datosOrdenados.length}</span> registros
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={irPaginaAnterior} disabled={paginaActual === 1}>
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Anterior
                    </Button>
                    <span className="text-sm font-semibold">
                      Página {paginaActual} de {totalPaginas}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={irPaginaSiguiente}
                      disabled={paginaActual === totalPaginas || datosOrdenados.length === 0}
                    >
                      Siguiente
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {modalTipo === "transcripcion"
                ? "Transcripción"
                : modalTipo === "resumen"
                  ? "Resumen"
                  : modalTipo === "observacion"
                    ? "Observación"
                    : "Detalle"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm text-muted-foreground">
            {obtenerContenidoModal()}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={cerrarModal}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Pagos
