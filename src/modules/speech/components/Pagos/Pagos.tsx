"use client"

import { useEffect, useMemo, useState } from "react"
import { saveAs } from "file-saver"
import * as XLSX from "xlsx"
import { usePagos, usePagoDetalle } from "@/hooks/speech/useSpeechAnalytics"
import { useSpeechAuth } from "@/modules/speech/context/SpeechAuthContext"
import type { SpeechPago } from "@/types/speech/analytics"
import "./Pagos.css"

type ModalTipo = "transcripcion" | "resumen" | "observacion" | ""
type ColumnFilters = Record<string, string[] | undefined>

const Pagos = () => {
  const { hasPermiso } = useSpeechAuth()

  const [fechaGestion, setFechaGestion] = useState("")
  const [fechaGestionTemp, setFechaGestionTemp] = useState("")
  const [botonActivo, setBotonActivo] = useState<"prometedoras" | "mejorables">("prometedoras")
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState("")
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState("")

  const [modalAbierto, setModalAbierto] = useState(false)
  const [filaSeleccionada, setFilaSeleccionada] = useState<SpeechPago | null>(null)
  const [modalTipo, setModalTipo] = useState<ModalTipo>("")
  const [detalleIdGestion, setDetalleIdGestion] = useState<string | number | null>(null)

  const [filtrosColumnas, setFiltrosColumnas] = useState<ColumnFilters>({})
  const [menuFiltroAbierto, setMenuFiltroAbierto] = useState<string | null>(null)
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
    data: detallePago,
    isFetching: isDetalleCargando,
    error: errorDetalle,
  } = usePagoDetalle({
    fechaGestion,
    idGestion: detalleIdGestion,
  })

  const tienePermisoInterno = hasPermiso("PERMISO_Pagos-ver-Interno")
  const tienePermisoExterno = hasPermiso("PERMISO_Pagos-ver-Externo")
  const tienePermisoJudicial = hasPermiso("PERMISO_Pagos-ver-Judicial")

  const datosCompletos = useMemo<SpeechPago[]>(() => {
    if (!Array.isArray(dataPagos)) return []
    return dataPagos.filter((item) => {
      const cartera = item.cartera?.trim().toLowerCase() ?? ""
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

  const agenciasUnicas = useMemo(
    () => [...new Set(datosActivos.map((item) => item.agencia).filter(Boolean))].sort(),
    [datosActivos],
  )

  const supervisoresUnicos = useMemo(() => {
    let supervisores = datosActivos
      .filter((item) => (agenciaSeleccionada ? item.agencia === agenciaSeleccionada : true))
      .map((item) => item.supervisor)
      .filter(Boolean)
    return [...new Set(supervisores)].sort()
  }, [datosActivos, agenciaSeleccionada])

  useEffect(() => {
    setSupervisorSeleccionado("")
  }, [agenciaSeleccionada])

  const datosFiltrados = useMemo(() => {
    let datos = [...datosActivos]
    if (agenciaSeleccionada) {
      datos = datos.filter((item) => item.agencia === agenciaSeleccionada)
    }
    if (supervisorSeleccionado) {
      datos = datos.filter((item) => item.supervisor === supervisorSeleccionado)
    }
    Object.entries(filtrosColumnas).forEach(([columna, valores]) => {
      if (valores && valores.length > 0) {
        datos = datos.filter((item) => valores.includes(String(item[columna as keyof SpeechPago] ?? "")))
      }
    })
    return datos
  }, [datosActivos, agenciaSeleccionada, supervisorSeleccionado, filtrosColumnas])

  const filtrosColumnasKey = useMemo(() => JSON.stringify(filtrosColumnas), [filtrosColumnas])

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
      const contentEl = document.querySelector(".pagos-content") as HTMLElement | null
      if (!contentEl) return
      const filtrosAltura = contentEl.querySelector(".filtros-principales")?.getBoundingClientRect().height ?? 0
      const tabsAltura = contentEl.querySelector(".tabs-estadisticas")?.getBoundingClientRect().height ?? 0
      const paginacionAltura = contentEl.querySelector(".tabla-paginacion")?.getBoundingClientRect().height ?? 72
      const espacioDisponible = contentEl.clientHeight - filtrosAltura - tabsAltura - paginacionAltura - 30
      const filaAltura =
        (document.querySelector(".tabla-pagos tbody tr") as HTMLElement | null)?.getBoundingClientRect().height ?? 48
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
  }, [botonActivo, agenciaSeleccionada, supervisorSeleccionado, fechaGestion, filtrosColumnasKey, filasPorPaginaActivas])

  useEffect(() => {
    setPaginaActual((prev) => Math.min(prev, totalPaginas))
  }, [totalPaginas])

  const hayFiltrosActivos =
    Boolean(fechaGestion || fechaGestionTemp || agenciaSeleccionada || supervisorSeleccionado) ||
    Object.keys(filtrosColumnas).length > 0

  const handleBuscar = () => {
    if (!fechaGestionTemp) {
      window.alert("Por favor, selecciona una fecha de gestión")
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
    setFilaSeleccionada(fila)
    setModalTipo(tipo)
    setDetalleIdGestion(fila?.idGestion ?? null)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setFilaSeleccionada(null)
    setModalTipo("")
    setDetalleIdGestion(null)
  }

  const toggleMenuFiltro = (columna: string) => {
    setMenuFiltroAbierto((prev) => (prev === columna ? null : columna))
  }

  const obtenerValoresUnicos = (columna: keyof SpeechPago): string[] => {
    return [...new Set(datosActivos.map((item) => item[columna]).filter(Boolean))].map((valor) => String(valor))
  }

  const handleFiltroColumnaChange = (columna: string, valor: string) => {
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
    setFiltrosColumnas((prev) => {
      const nuevo = { ...prev }
      delete nuevo[columna]
      return nuevo
    })
    setMenuFiltroAbierto(null)
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

  const irPaginaAnterior = () => {
    setPaginaActual((prev) => Math.max(prev - 1, 1))
  }

  const irPaginaSiguiente = () => {
    setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
  }

  const exportarExcel = () => {
    if (datosOrdenados.length === 0) {
      window.alert("No hay datos para exportar")
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

  const obtenerClaseCalificacion = (calificacion: SpeechPago["calificacion"]) => {
    const cal = Number(calificacion) || 0
    if (cal >= 3.5) return "calificacion-q1"
    if (cal >= 3.0) return "calificacion-q2"
    if (cal >= 2.5) return "calificacion-q3"
    return "calificacion-q4"
  }

  const obtenerTituloModal = (tipo: ModalTipo): string => {
    const titulos: Record<ModalTipo, string> = {
      transcripcion: "Transcripción",
      resumen: "Resumen",
      observacion: "Observación",
      "": "Detalle",
    }
    return titulos[tipo]
  }

  const columnas = [
    { id: "documento", label: "Documento", filtrable: true },
    { id: "cartera", label: "Cartera", filtrable: true },
    { id: "deudaCapital", label: "Deuda Capital", filtrable: true },
    { id: "deudaTotal", label: "Deuda Total", filtrable: true },
    { id: "cosecha", label: "Cosecha", filtrable: true },
    { id: "fecha", label: "Fecha", filtrable: false },
    { id: "horaInicio", label: "Hora Inicio", filtrable: false },
    { id: "tiempoHablado", label: "Duración", filtrable: false },
    { id: "agencia", label: "Agencia", filtrable: true },
    { id: "supervisor", label: "Supervisor", filtrable: true },
    { id: "calificacion", label: "Calificación", filtrable: false },
    { id: "acciones", label: "Acciones", filtrable: false },
  ]

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
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Ocurrió un error inesperado"

  return (
    <div className="pagos-container">
      <div className="pagos-header">
        <div className="header-content">
          <h1 className="pagos-title">
            <i className="fas fa-money-bill-wave"></i>
            Análisis de Pagos
          </h1>
        </div>
      </div>

      <div className="pagos-content">
        <div className="filtros-principales">
          <div className="filtro-grupo">
            <label htmlFor="fecha">
              <i className="fas fa-calendar-alt"></i> Fecha de Gestión
            </label>
            <input
              id="fecha"
              type="date"
              className="input-fecha"
              value={fechaGestionTemp}
              onChange={(event) => setFechaGestionTemp(event.target.value)}
            />
          </div>

          <div className="filtro-grupo">
            <label htmlFor="agencia">
              <i className="fas fa-building"></i> Agencia
            </label>
            <select
              id="agencia"
              className="select-filtro"
              value={agenciaSeleccionada}
              onChange={(event) => setAgenciaSeleccionada(event.target.value)}
              disabled={datosActivos.length === 0}
            >
              <option value="">Todas las agencias</option>
              {agenciasUnicas.map((agencia) => (
                <option key={agencia} value={agencia}>
                  {agencia}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label htmlFor="supervisor">
              <i className="fas fa-user-tie"></i> Supervisor
            </label>
            <select
              id="supervisor"
              className="select-filtro"
              value={supervisorSeleccionado}
              onChange={(event) => setSupervisorSeleccionado(event.target.value)}
              disabled={!agenciaSeleccionada || supervisoresUnicos.length === 0}
            >
              <option value="">Todos los supervisores</option>
              {supervisoresUnicos.map((supervisor) => (
                <option key={supervisor} value={supervisor}>
                  {supervisor}
                </option>
              ))}
            </select>
          </div>

          <div className="acciones-filtros">
            <button className="btn-icono btn-icono-buscar" onClick={handleBuscar} disabled={!fechaGestionTemp || isLoading} title="Buscar">
              <i className={`fas ${isLoading ? "fa-spinner fa-spin" : "fa-search"}`}></i>
            </button>
            <button className="btn-icono btn-icono-limpiar" onClick={handleLimpiarFiltros} disabled={!hayFiltrosActivos} title="Limpiar filtros">
              <i className="fas fa-eraser"></i>
            </button>
            <button className="btn-icono btn-icono-exportar" onClick={exportarExcel} disabled={datosOrdenados.length === 0} title="Exportar a Excel">
              <i className="fas fa-file-excel"></i>
            </button>
          </div>
        </div>

        <div className="tabs-estadisticas">
          <button
            className={`tab-btn ${botonActivo === "prometedoras" ? "activo" : ""}`}
            onClick={() => cambiarBoton("prometedoras")}
            disabled={isLoading}
          >
            <i className="fas fa-star"></i>
            Llamadas Prometedoras
            <span className="tab-badge">{datosPrometedoras.length}</span>
          </button>
          <button
            className={`tab-btn ${botonActivo === "mejorables" ? "activo" : ""}`}
            onClick={() => cambiarBoton("mejorables")}
            disabled={isLoading}
          >
            <i className="fas fa-exclamation-triangle"></i>
            Llamadas Mejorables
            <span className="tab-badge">{datosMejorables.length}</span>
          </button>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Cargando datos...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <i className="fas fa-exclamation-circle"></i>
            <h3>Error al cargar datos</h3>
            <p>{errorMessage}</p>
          </div>
        ) : !fechaGestion ? (
          <div className="mensaje-inicial">
            <i className="fas fa-calendar-check"></i>
            <h3>Selecciona una fecha</h3>
            <p>Por favor, selecciona una fecha de gestión para visualizar los datos</p>
          </div>
        ) : datosOrdenados.length === 0 ? (
          <div className="mensaje-vacio">
            <i className="fas fa-inbox"></i>
            <h3>No hay datos disponibles</h3>
            <p>No se encontraron registros para los filtros seleccionados</p>
          </div>
        ) : (
          <div className="tabla-responsive">
            <table className="tabla-pagos">
              <thead>
                <tr>
                  {columnas.map((col) => (
                    <th key={col.id}>
                      <div className="th-content">
                        <span
                          onClick={() => col.id !== "acciones" && handleOrden(col.id)}
                          style={{ cursor: col.id !== "acciones" ? "pointer" : "default" }}
                        >
                          {col.label}
                          {ordenColumna.columna === col.id && (
                            <i className={`fas fa-sort-${ordenColumna.direccion === "asc" ? "up" : "down"}`}></i>
                          )}
                        </span>
                        {col.filtrable && (
                          <button className="btn-filtro" onClick={() => toggleMenuFiltro(col.id)} title={`Filtrar ${col.label}`}>
                            <i className={`fas fa-filter ${filtrosColumnas[col.id]?.length ? "activo" : ""}`}></i>
                          </button>
                        )}
                        {col.filtrable && menuFiltroAbierto === col.id && (
                          <div className="menu-filtro">
                            <div className="menu-filtro-header">
                              <span>Filtrar por {col.label}</span>
                              <button className="btn-limpiar-filtro" onClick={() => limpiarFiltroColumna(col.id)}>
                                Limpiar
                              </button>
                            </div>
                            <div className="menu-filtro-opciones">
                              {obtenerValoresUnicos(col.id as keyof SpeechPago).map((valor) => (
                                <label key={valor} className="checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={(filtrosColumnas[col.id] || []).includes(valor)}
                                    onChange={() => handleFiltroColumnaChange(col.id, valor)}
                                  />
                                  {valor}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datosPaginados.map((fila, idx) => (
                  <tr key={`${fila.documento}-${idx}`}>
                    <td>{fila.documento}</td>
                    <td>{fila.cartera}</td>
                    <td>{fila.deudaCapital}</td>
                    <td>{fila.deudaTotal}</td>
                    <td>{fila.cosecha}</td>
                    <td>{fila.fecha}</td>
                    <td>{fila.horaInicio}</td>
                    <td>{fila.tiempoHablado}</td>
                    <td>{fila.agencia}</td>
                    <td>{fila.supervisor}</td>
                    <td>
                      <span className={obtenerClaseCalificacion(fila.calificacion)}>{fila.calificacion}</span>
                    </td>
                    <td>
                      <div className="acciones-btns">
                        <button
                          className="btn-accion btn-transcripcion"
                          onClick={() => abrirModal(fila, "transcripcion")}
                          title="Ver transcripción"
                        >
                          <i className="fas fa-file-alt"></i>
                        </button>
                        <button className="btn-accion btn-resumen" onClick={() => abrirModal(fila, "resumen")} title="Ver resumen">
                          <i className="fas fa-clipboard-list"></i>
                        </button>
                        <button
                          className="btn-accion btn-observacion"
                          onClick={() => abrirModal(fila, "observacion")}
                          title="Ver observación"
                        >
                          <i className="fas fa-comment-dots"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="tabla-paginacion">
              <div className="info-paginacion">
                Mostrando <strong>{datosPaginados.length}</strong> de <strong>{datosOrdenados.length}</strong> registros
              </div>
              <div className="paginacion-controles">
                <button className="btn-paginacion" onClick={irPaginaAnterior} disabled={paginaActual === 1}>
                  <i className="fas fa-chevron-left"></i>
                  Anterior
                </button>
                <span className="paginacion-estado">
                  Página {paginaActual} de {totalPaginas}
                </span>
                <button
                  className="btn-paginacion"
                  onClick={irPaginaSiguiente}
                  disabled={paginaActual === totalPaginas || datosOrdenados.length === 0}
                >
                  Siguiente
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i
                  className={`fas fa-${
                    modalTipo === "transcripcion" ? "file-alt" : modalTipo === "resumen" ? "clipboard-list" : "comment-dots"
                  }`}
                ></i>
                {obtenerTituloModal(modalTipo)}
              </h2>
              <button className="btn-cerrar-modal" onClick={cerrarModal} title="Cerrar">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>{obtenerContenidoModal()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pagos
