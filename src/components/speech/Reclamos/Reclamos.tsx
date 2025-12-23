"use client"

import { useEffect, useMemo, useState, type ElementType } from "react"
import { saveAs } from "file-saver"
import * as XLSX from "xlsx"
import { toast } from "sonner"
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Eraser,
  FileText,
  Filter as FilterIcon,
  Loader2,
  MessageSquare,
  PlayCircle,
  Search,
  User2,
} from "lucide-react"
import { useReclamos } from "@/hooks/speech/useSpeechAnalytics"
import { useSpeechAccess } from "@/hooks/speech/useSpeechAccess"
import { useSpeechPermissions } from "@/hooks/speech/useSpeechPermissions"
import type { SpeechReclamo } from "@/types/speech/analytics"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type OrdenColumna = { columna: string; direccion: "asc" | "desc" }
type ColumnFilters = Record<string, string[] | undefined>
type ColumnDefinition = { id: string; label: string; filtrable?: boolean; ordenable?: boolean }

const columnas: ColumnDefinition[] = [
  { id: "documento", label: "Documento", filtrable: true, ordenable: true },
  { id: "cartera", label: "Cartera", filtrable: true, ordenable: true },
  { id: "fecha", label: "Fecha", filtrable: false, ordenable: true },
  { id: "horaInicio", label: "Hora Inicio", filtrable: false, ordenable: true },
  { id: "duracion", label: "Duración", filtrable: false, ordenable: true },
  { id: "agencia", label: "Agencia", filtrable: true, ordenable: true },
  { id: "supervisor", label: "Supervisor", filtrable: true, ordenable: true },
  { id: "tipoReclamo", label: "Tipo Reclamo", filtrable: true, ordenable: true },
  { id: "motivo", label: "Motivo", filtrable: true, ordenable: true },
  { id: "grabacion", label: "Grabaci+n", filtrable: false, ordenable: false },
  { id: "acciones", label: "Acciones", filtrable: false, ordenable: false },
]

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

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0

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

type SpeechReclamoNormalizado = SpeechReclamo & { carteraNormalizada?: string }

const Reclamos = () => {
  const { hasPermiso } = useSpeechPermissions()
  const { alias: aliasActual, isAdmin: puedeUsarFiltrosAvanzados } = useSpeechAccess()

  const [fechaSeleccionada, setFechaSeleccionada] = useState("")
  const [fechaTemporal, setFechaTemporal] = useState("")
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState("")
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState("")
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalTipo, setModalTipo] = useState<"transcripcion" | "observacion" | "">("")
  const [contenidoModal, setContenidoModal] = useState("")
  const [menuFiltroAbierto, setMenuFiltroAbierto] = useState<string | null>(null)
  const [filtrosColumnas, setFiltrosColumnas] = useState<ColumnFilters>({})
  const [busquedaFiltro, setBusquedaFiltro] = useState<Record<string, string>>({})
  const [ordenColumna, setOrdenColumna] = useState<OrdenColumna>({ columna: "", direccion: "asc" })
  const [filasPorPagina, setFilasPorPagina] = useState(10)
  const [paginaActual, setPaginaActual] = useState(1)

  const { data: dataReclamos = [], isLoading, error } = useReclamos(fechaSeleccionada)

  const tienePermisoInterno = hasPermiso("PERMISO_ReclamosInterno-ver")
  const tienePermisoExterno = hasPermiso("PERMISO_ReclamosExterno-ver")
  const tienePermisoJudicial = hasPermiso("PERMISO_ReclamosJudicial-ver")

  const datosCompletos = useMemo<SpeechReclamoNormalizado[]>(() => {
    if (!Array.isArray(dataReclamos)) return []
    return dataReclamos
      .map<SpeechReclamoNormalizado>((item) => {
        const source = normalizeRecord(item as Record<string, unknown>)
        const documento =
          toOptionalString(source.documento) ??
          toOptionalString(source.idGestion) ??
          (item.documento ?? undefined)
        const cartera = toOptionalString(source.cartera) ?? (item.cartera ?? undefined)
        const carteraNormalizada = normalizarCartera(cartera)
        const fecha =
          toOptionalString(source.fecha ?? source.fechaGestion ?? source.fechaLlamada) ?? (item.fecha ?? undefined)
        const horaInicio =
          toOptionalString(source.horaInicio ?? source.hora ?? source.horaInicioGestion) ?? (item.horaInicio ?? undefined)
        const tiempoHablado =
          toOptionalString(source.tiempoHablado ?? source.duracion ?? source.tiempo) ?? (item.tiempoHablado ?? undefined)
        const agencia = toOptionalString(source.agencia ?? source.agenciaNombre ?? source.aliasAgencia) ?? (item.agencia ?? undefined)
        const supervisor =
          toOptionalString(
            source.supervisor ??
              source.supervisorNombre ??
              source.aliasSupervisor ??
              source.supervisorAlias ??
              source.grupo ??
              source.lider ??
              source.jefe ??
              source.supervisorAsignado,
          ) ??
          (item.supervisor ?? (item as unknown as Record<string, unknown>).grupo ?? undefined)
        const tipoReclamo =
          toOptionalString(source.tipoReclamo ?? source.nivel1 ?? source.categoria) ?? (item.tipoReclamo ?? undefined)
        const tipificacion =
          toOptionalString(source.tipificacion ?? source.motivo ?? source.nivel3) ?? (item.tipificacion ?? undefined)
        const grabacion = toOptionalString(source.grabacion ?? source.urlGrabacion) ?? (item.grabacion ?? undefined)
        const transcripcion = toOptionalString(source.transcripcion) ?? (item.transcripcion ?? undefined)
        const observacion = toOptionalString(source.observacion) ?? (item.observacion ?? undefined)

        return {
          ...item,
          documento,
          cartera,
          fecha,
          horaInicio,
          tiempoHablado,
          agencia,
          supervisor,
          tipoReclamo,
          tipificacion,
          grabacion,
          transcripcion,
          observacion,
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
  }, [dataReclamos, tienePermisoInterno, tienePermisoExterno, tienePermisoJudicial])

  useEffect(() => {
    if (dataReclamos && dataReclamos.length > 0) {
      console.log("Primer registro:", dataReclamos[0])
      console.log("Claves disponibles:", Object.keys(dataReclamos[0]))
    }
  }, [dataReclamos])

  const agenciasUnicas = useMemo(() => {
    const agencias = datosCompletos
      .map((item) => item.agencia)
      .filter((agencia): agencia is string => isNonEmptyString(agencia))
    return [...new Set(agencias)].sort()
  }, [datosCompletos])

  const supervisoresUnicos = useMemo(() => {
    let datos = datosCompletos
    if (agenciaSeleccionada) {
      datos = datos.filter((item) => item.agencia === agenciaSeleccionada)
    }
    const supervisores = datos
      .map((item) => item.supervisor)
      .filter((supervisor): supervisor is string => isNonEmptyString(supervisor))
    return [...new Set(supervisores)].sort()
  }, [datosCompletos, agenciaSeleccionada])

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
    setBusquedaFiltro({})
    setMenuFiltroAbierto(null)
  }, [puedeUsarFiltrosAvanzados, aliasActual])

  const datosFiltradosPrincipales = useMemo(() => {
    let datos = [...datosCompletos]
    if (puedeUsarFiltrosAvanzados && agenciaSeleccionada) {
      datos = datos.filter((item) => item.agencia === agenciaSeleccionada)
    }
    if (puedeUsarFiltrosAvanzados && supervisorSeleccionado) {
      datos = datos.filter((item) => item.supervisor === supervisorSeleccionado)
    }
    return datos
  }, [datosCompletos, agenciaSeleccionada, supervisorSeleccionado, puedeUsarFiltrosAvanzados])

  const datosFiltrados = useMemo(() => {
    let datos = [...datosFiltradosPrincipales]
    if (puedeUsarFiltrosAvanzados) {
      Object.entries(filtrosColumnas).forEach(([columna, valores]) => {
        if (valores && valores.length > 0) {
          datos = datos.filter((item) => valores.includes(String(item[columna as keyof SpeechReclamo] ?? "")))
        }
      })
    }
    return datos
  }, [datosFiltradosPrincipales, filtrosColumnas, puedeUsarFiltrosAvanzados])

  const filtrosColumnasKey = useMemo(() => JSON.stringify(filtrosColumnas), [filtrosColumnas])

  const datosOrdenados = useMemo(() => {
    if (!ordenColumna.columna) return datosFiltrados
    return [...datosFiltrados].sort((a, b) => {
      const valorA = (a as unknown as Record<string, unknown>)[ordenColumna.columna]
      const valorB = (b as unknown as Record<string, unknown>)[ordenColumna.columna]
      if (valorA == null) return 1
      if (valorB == null) return -1
      const comparacion = valorA < valorB ? -1 : valorA > valorB ? 1 : 0
      return ordenColumna.direccion === "asc" ? comparacion : -comparacion
    })
  }, [datosFiltrados, ordenColumna])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!fechaSeleccionada || datosOrdenados.length === 0) {
      setFilasPorPagina((prev) => (prev === 10 ? prev : 10))
      return
    }
    const calcularFilas = () => {
      const contentEl = document.querySelector(".reclamos-content") as HTMLElement | null
      if (!contentEl) return
      const filtrosAltura = contentEl.querySelector(".filtros-principales")?.getBoundingClientRect().height ?? 0
      const paginacionAltura = contentEl.querySelector(".tabla-paginacion")?.getBoundingClientRect().height ?? 72
      const espacioDisponible = contentEl.clientHeight - filtrosAltura - paginacionAltura - 48
      const filaAltura =
        (document.querySelector(".tabla-reclamos tbody tr") as HTMLElement | null)?.getBoundingClientRect().height ?? 48
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
  }, [fechaSeleccionada, datosOrdenados.length])

  const filasPorPaginaActivas = Math.max(1, filasPorPagina)
  const totalPaginas = Math.max(1, Math.ceil(datosOrdenados.length / filasPorPaginaActivas))

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * filasPorPaginaActivas
    return datosOrdenados.slice(inicio, inicio + filasPorPaginaActivas)
  }, [datosOrdenados, paginaActual, filasPorPaginaActivas])

  useEffect(() => {
    setPaginaActual(1)
  }, [agenciaSeleccionada, supervisorSeleccionado, fechaSeleccionada, filtrosColumnasKey])

  useEffect(() => {
    setPaginaActual((prev) => Math.min(prev, totalPaginas))
  }, [totalPaginas])

  const filtrosInteractivosActivos =
    puedeUsarFiltrosAvanzados &&
    (Boolean(agenciaSeleccionada) || Boolean(supervisorSeleccionado) || Object.keys(filtrosColumnas).length > 0)

  const hayFiltrosActivos = Boolean(fechaSeleccionada || fechaTemporal) || filtrosInteractivosActivos

  const handleBuscar = () => {
    if (!fechaTemporal) {
      toast.error("Por favor, selecciona una fecha")
      return
    }
    setFechaSeleccionada(fechaTemporal)
  }

  const handleLimpiar = () => {
    setFechaTemporal("")
    setFechaSeleccionada("")
    setAgenciaSeleccionada("")
    setSupervisorSeleccionado("")
    setFiltrosColumnas({})
    setBusquedaFiltro({})
    setMenuFiltroAbierto(null)
    setOrdenColumna({ columna: "", direccion: "asc" })
    setPaginaActual(1)
  }

  const handleOrden = (columna: string, direccion: "asc" | "desc") => {
    if (columna === "acciones") return
    setOrdenColumna({ columna, direccion })
    setMenuFiltroAbierto(null)
  }

  const obtenerValoresUnicos = (columna: keyof SpeechReclamo): string[] => {
    const valores = datosFiltradosPrincipales.map((item) => String(item[columna] ?? "")).filter(Boolean)
    const unicos = [...new Set(valores)].sort()
    const busqueda = busquedaFiltro[columna as string]?.toLowerCase() ?? ""
    if (!busqueda) return unicos
    return unicos.filter((val) => val.toLowerCase().includes(busqueda))
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

  const seleccionarTodosFiltro = (columna: string) => {
    if (!puedeUsarFiltrosAvanzados) {
      return
    }
    const todosValores = obtenerValoresUnicos(columna as keyof SpeechReclamo)
    setFiltrosColumnas((prev) => ({
      ...prev,
      [columna]: todosValores,
    }))
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
  }

  const aplicarFiltroColumna = (columna: string) => {
    if (!puedeUsarFiltrosAvanzados) {
      return
    }
    setMenuFiltroAbierto(null)
    if (!filtrosColumnas[columna]?.length) {
      setFiltrosColumnas((prev) => {
        const nuevo = { ...prev }
        delete nuevo[columna]
        return nuevo
      })
    }
  }

  const irPaginaAnterior = () => {
    setPaginaActual((prev) => Math.max(prev - 1, 1))
  }

  const irPaginaSiguiente = () => {
    setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
  }

  const abrirModal = (contenido: string, tipo: "transcripcion" | "observacion") => {
    setContenidoModal(contenido || "No disponible")
    setModalTipo(tipo)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setContenidoModal("")
    setModalTipo("")
  }

  const exportarExcel = () => {
    if (datosOrdenados.length === 0) {
      toast.error("No hay datos para exportar")
      return
    }
    const datosExcel = datosOrdenados.map((item) => ({
      Documento: item.documento ?? "",
      Cartera: item.cartera ?? "",
      Fecha: item.fecha ?? "",
      "Hora Inicio": item.horaInicio ?? "",
      Duracion: item.tiempoHablado ?? "",
      Agencia: item.agencia ?? "",
      Supervisor: item.supervisor ?? "",
      "Tipo Reclamo": item.tipoReclamo ?? "",
      Motivo: item.tipificacion ?? "",
      Observacion: item.observacion ?? "",
    }))
    const ws = XLSX.utils.json_to_sheet(datosExcel)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Reclamos")
    const nombreArchivo = `Reclamos_${fechaSeleccionada || "todos"}.xlsx`
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], { type: "application/octet-stream" })
    saveAs(blob, nombreArchivo)
  }

  const datosPaginacion = {
    total: datosOrdenados.length,
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Ocurrio un error inesperado"

  const modalTitle =
    modalTipo === "transcripcion" ? "Transcripcion" : modalTipo === "observacion" ? "Observacion" : "Detalle"
  const ModalIcon = modalTipo === "observacion" ? MessageSquare : FileText

  return (
    <div className="space-y-6" data-reclamos-content>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Speech Analytics</p>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight">Reclamos</h1>
        <p className="text-muted-foreground">
          Visualiza reclamos en las gestiones.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4" data-reclamos-filtros>
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
                value={fechaTemporal}
                onChange={(event) => setFechaTemporal(event.target.value)}
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
                disabled={!puedeUsarFiltrosAvanzados || datosCompletos.length === 0}
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
                disabled={
                  !puedeUsarFiltrosAvanzados || !agenciaSeleccionada || supervisoresUnicos.length === 0
                }
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

            <div className="ml-auto flex items-center gap-2" data-reclamos-acciones>
              <Button onClick={handleBuscar} disabled={!fechaTemporal || isLoading} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Buscar
              </Button>
              <Button variant="outline" onClick={handleLimpiar} disabled={!hayFiltrosActivos} className="w-full sm:w-auto">
                <Eraser className="h-4 w-4" />
              </Button>

              <div className="hidden h-6 w-px bg-muted sm:mx-1 sm:block" />

              <Button variant="secondary" onClick={exportarExcel} disabled={datosOrdenados.length === 0} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Listado de reclamos</CardTitle>
          <CardDescription>Consulta la informacion detallada de cada interaccion supervisada.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <EstadoCard icon={Loader2} title="Cargando datos" description="Estamos consultando los reclamos del dia." />
          ) : error ? (
            <EstadoCard icon={AlertTriangle} title="Error al cargar" description={errorMessage} />
          ) : !fechaSeleccionada ? (
            <EstadoCard
              icon={CalendarDays}
              title="Selecciona una fecha"
              description="Elige una fecha y presiona buscar para mostrar los registros."
            />
          ) : datosOrdenados.length === 0 ? (
            <EstadoCard
              icon={ClipboardList}
              title="Sin resultados"
              description="No encontramos reclamos que coincidan con los filtros aplicados."
            />
          ) : (
            <>
              <div className="overflow-x-auto" data-reclamos-table>
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      {columnas.map((col) => {
                        const valoresDisponibles = obtenerValoresUnicos(col.id as keyof SpeechReclamo)
                        const isSorted = ordenColumna.columna === col.id
                        return (
                          <TableHead key={col.id} className="whitespace-nowrap text-xs uppercase tracking-wide">
                            <div className="flex items-center justify-between gap-2">
                              <button
                                type="button"
                                className={cn(
                                  "flex flex-1 items-center gap-1 text-left font-semibold",
                                  col.id !== "acciones" ? "cursor-pointer" : "cursor-default",
                                )}
                                onClick={() =>
                                  col.id !== "acciones" &&
                                  handleOrden(col.id, isSorted && ordenColumna.direccion === "asc" ? "desc" : "asc")
                                }
                              >
                                {col.label}
                                {isSorted && (
                                  <span className="text-muted-foreground">
                                    {ordenColumna.direccion === "asc" ? "?" : "?"}
                                  </span>
                                )}
                              </button>
                              {col.filtrable && puedeUsarFiltrosAvanzados && (
                                <Popover
                                  open={menuFiltroAbierto === col.id}
                                  onOpenChange={(open) => setMenuFiltroAbierto(open ? col.id : null)}
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={cn(
                                        "h-8 w-8",
                                        filtrosColumnas[col.id]?.length ? "text-primary" : "text-muted-foreground",
                                      )}
                                    >
                                      <FilterIcon className="h-4 w-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-64 space-y-3" align="end">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-semibold">Filtrar {col.label}</p>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto px-2 text-xs"
                                        onClick={() => seleccionarTodosFiltro(col.id)}
                                      >
                                        Todos
                                      </Button>
                                    </div>
                                    <Input
                                      placeholder="Buscar valor"
                                      value={busquedaFiltro[col.id] || ""}
                                      onChange={(event) =>
                                        setBusquedaFiltro((prev) => ({ ...prev, [col.id]: event.target.value }))
                                      }
                                    />
                                    <label className="flex items-center gap-2 text-sm font-medium">
                                      <Checkbox
                                        checked={
                                          valoresDisponibles.length > 0 &&
                                          (filtrosColumnas[col.id]?.length ?? 0) === valoresDisponibles.length
                                        }
                                        onCheckedChange={() => seleccionarTodosFiltro(col.id)}
                                      />
                                      Seleccionar todos
                                    </label>
                                    <div className="max-h-48 space-y-2 overflow-y-auto">
                                      {valoresDisponibles.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">Sin coincidencias</p>
                                      ) : (
                                        valoresDisponibles.map((valor) => (
                                          <label key={valor} className="flex items-center gap-2 text-sm">
                                            <Checkbox
                                              checked={(filtrosColumnas[col.id] || []).includes(valor)}
                                              onCheckedChange={() => handleFiltroColumnaChange(col.id, valor)}
                                            />
                                            <span className="truncate">{valor}</span>
                                          </label>
                                        ))
                                      )}
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
                                      <Button
                                        size="sm"
                                        className="h-auto px-3 text-xs"
                                        onClick={() => aplicarFiltroColumna(col.id)}
                                      >
                                        Aplicar
                                      </Button>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datosPaginados.map((fila, idx) => (
                      <TableRow key={`${fila.documento || "fila"}-${idx}`}>
                        <TableCell>{fila.documento}</TableCell>
                        <TableCell>{fila.cartera}</TableCell>
                        <TableCell>{fila.fecha}</TableCell>
                        <TableCell>{fila.horaInicio}</TableCell>
                        <TableCell>{fila.tiempoHablado}</TableCell>
                        <TableCell>{fila.agencia}</TableCell>
                        <TableCell>{fila.supervisor}</TableCell>
                        <TableCell>{fila.tipoReclamo}</TableCell>
                        <TableCell>{fila.tipificacion}</TableCell>
                        <TableCell>
                          {fila.grabacion ? (
                            <Button variant="outline" size="sm" asChild className="gap-2">
                              <a href={fila.grabacion} target="_blank" rel="noopener noreferrer">
                                <PlayCircle className="h-4 w-4" />
                                Escuchar
                              </a>
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">No disponible</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              title="Ver transcripcion"
                              onClick={() => abrirModal(fila.transcripcion || "", "transcripcion")}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Ver observacion"
                              onClick={() => abrirModal(fila.observacion || "", "observacion")}
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
                data-reclamos-pagination
              >
                <p className="text-muted-foreground">
                  Mostrando {" "}
                  <span className="font-semibold text-foreground">{datosPaginados.length}</span> de {" "}
                  <span className="font-semibold text-foreground">{datosPaginacion.total}</span> registros
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={irPaginaAnterior} disabled={paginaActual === 1}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Anterior
                  </Button>
                  <span className="text-sm font-semibold">
                    Pagina {paginaActual} de {totalPaginas}
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

      <Dialog open={modalAbierto} onOpenChange={(open) => (open ? setModalAbierto(true) : cerrarModal())}>
        <DialogContent className="max-w-2xl space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ModalIcon className="h-5 w-5 text-primary" />
              {modalTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-md bg-muted/40 p-4 text-sm text-muted-foreground">
            {contenidoModal || "No disponible"}
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

export default Reclamos
