"use client"

import { useEffect, useMemo, useState } from "react"
import { saveAs } from "file-saver"
import * as XLSX from "xlsx"
import { useSpeechAuth } from "@/modules/speech/context/SpeechAuthContext"
import { useReclamos } from "@/hooks/speech/useSpeechAnalytics"
import type { SpeechReclamo } from "@/types/speech/analytics"
import "./Reclamos.css"

type OrdenColumna = { columna: string; direccion: "asc" | "desc" }
type ColumnFilters = Record<string, string[] | undefined>

const columnas = [
  { id: "documento", label: "Documento", filtrable: true, ordenable: true },
  { id: "cartera", label: "Cartera", filtrable: true, ordenable: true },
  { id: "fecha", label: "Fecha", filtrable: false, ordenable: true },
  { id: "horaInicio", label: "Hora Inicio", filtrable: false, ordenable: true },
  { id: "duracion", label: "Duración", filtrable: false, ordenable: true },
  { id: "agencia", label: "Agencia", filtrable: true, ordenable: true },
  { id: "supervisor", label: "Supervisor", filtrable: true, ordenable: true },
  { id: "tipoReclamo", label: "Tipo Reclamo", filtrable: true, ordenable: true },
  { id: "motivo", label: "Motivo", filtrable: true, ordenable: true },
  { id: "grabacion", label: "Grabación", filtrable: false, ordenable: false },
  { id: "acciones", label: "Acciones", filtrable: false, ordenable: false },
]

const Reclamos = () => {
  const { hasPermiso } = useSpeechAuth()

  const [fechaSeleccionada, setFechaSeleccionada] = useState("")
  const [fechaTemporal, setFechaTemporal] = useState("")
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState("")
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState("")
  const [modalAbierto, setModalAbierto] = useState(false)
  const [contenidoModal, setContenidoModal] = useState("")
  const [tituloModal, setTituloModal] = useState("")
  const [menuFiltroAbierto, setMenuFiltroAbierto] = useState<string | null>(null)
  const [filtrosColumnas, setFiltrosColumnas] = useState<ColumnFilters>({})
  const [busquedaFiltro, setBusquedaFiltro] = useState<Record<string, string>>({})
  const [ordenColumna, setOrdenColumna] = useState<OrdenColumna>({ columna: "", direccion: "asc" })
  const [filasPorPagina, setFilasPorPagina] = useState(10)
  const [paginaActual, setPaginaActual] = useState(1)

  const { data: dataReclamos = [], isLoading, error } = useReclamos(fechaSeleccionada)

  const tienePermisoInterno = hasPermiso("PERMISO_Reclamos-ver-Interno")
  const tienePermisoExterno = hasPermiso("PERMISO_Reclamos-ver-Externo")
  const tienePermisoJudicial = hasPermiso("PERMISO_Reclamos-ver-Judicial")

  const datosCompletos = useMemo(() => {
    if (!Array.isArray(dataReclamos)) return []
    return dataReclamos
      .map<SpeechReclamo & { documento: string | number | undefined; motivo?: string; duracion?: string }>((item) => ({
        ...item,
        documento: item.documento ?? item.idGestion,
        motivo: item.tipificacion,
        duracion: item.tiempoHablado,
      }))
      .filter((item) => {
        const cartera = item.cartera?.trim().toLowerCase() ?? ""
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

  const agenciasUnicas = useMemo(
    () => [...new Set(datosCompletos.map((item) => item.agencia).filter(Boolean))].sort(),
    [datosCompletos],
  )

  const supervisoresUnicos = useMemo(() => {
    let datos = datosCompletos
    if (agenciaSeleccionada) {
      datos = datos.filter((item) => item.agencia === agenciaSeleccionada)
    }
    return [...new Set(datos.map((item) => item.supervisor).filter(Boolean))].sort()
  }, [datosCompletos, agenciaSeleccionada])

  useEffect(() => {
    setSupervisorSeleccionado("")
  }, [agenciaSeleccionada])

  const datosFiltradosPrincipales = useMemo(() => {
    let datos = [...datosCompletos]
    if (agenciaSeleccionada) {
      datos = datos.filter((item) => item.agencia === agenciaSeleccionada)
    }
    if (supervisorSeleccionado) {
      datos = datos.filter((item) => item.supervisor === supervisorSeleccionado)
    }
    return datos
  }, [datosCompletos, agenciaSeleccionada, supervisorSeleccionado])

  const datosFiltrados = useMemo(() => {
    let datos = [...datosFiltradosPrincipales]
    Object.entries(filtrosColumnas).forEach(([columna, valores]) => {
      if (valores && valores.length > 0) {
        datos = datos.filter((item) => valores.includes(String(item[columna as keyof SpeechReclamo] ?? "")))
      }
    })
    return datos
  }, [datosFiltradosPrincipales, filtrosColumnas])

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

  const hayFiltrosActivos =
    Boolean(fechaSeleccionada || fechaTemporal || agenciaSeleccionada || supervisorSeleccionado) ||
    Object.keys(filtrosColumnas).length > 0

  const handleBuscar = () => {
    if (!fechaTemporal) {
      window.alert("Por favor, selecciona una fecha")
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
    setOrdenColumna({ columna, direccion })
    setMenuFiltroAbierto(null)
  }

  const toggleMenuFiltro = (columna: string) => {
    setMenuFiltroAbierto((prev) => (prev === columna ? null : columna))
    setBusquedaFiltro((prev) => ({ ...prev, [columna]: "" }))
  }

  const obtenerValoresUnicos = (columna: keyof SpeechReclamo): string[] => {
    const valores = datosFiltradosPrincipales.map((item) => String(item[columna] ?? "")).filter(Boolean)
    const unicos = [...new Set(valores)].sort()
    const busqueda = busquedaFiltro[columna as string]?.toLowerCase() ?? ""
    if (!busqueda) return unicos
    return unicos.filter((val) => val.toLowerCase().includes(busqueda))
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

  const seleccionarTodosFiltro = (columna: string) => {
    const todosValores = obtenerValoresUnicos(columna as keyof SpeechReclamo)
    setFiltrosColumnas((prev) => ({
      ...prev,
      [columna]: todosValores,
    }))
  }

  const limpiarFiltroColumna = (columna: string) => {
    setFiltrosColumnas((prev) => {
      const nuevo = { ...prev }
      delete nuevo[columna]
      return nuevo
    })
  }

  const aplicarFiltroColumna = (columna: string) => {
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

  const abrirModal = (contenido: string, titulo: string) => {
    setContenidoModal(contenido || "No disponible")
    setTituloModal(titulo)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setContenidoModal("")
    setTituloModal("")
  }

  const exportarExcel = () => {
    if (datosOrdenados.length === 0) {
      window.alert("No hay datos para exportar")
      return
    }
    const datosExcel = datosOrdenados.map((item) => ({
      Documento: item.documento ?? "",
      Cartera: item.cartera ?? "",
      Fecha: item.fecha ?? "",
      "Hora Inicio": item.horaInicio ?? "",
      Duración: item.tiempoHablado ?? "",
      Agencia: item.agencia ?? "",
      Supervisor: item.supervisor ?? "",
      "Tipo Reclamo": item.tipoReclamo ?? "",
      Motivo: item.tipificacion ?? "",
      Observación: item.observacion ?? "",
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
    visibles: datosPaginados.length,
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Ocurrió un error inesperado"

  return (
    <div className="reclamos-container">
      <div className="reclamos-header">
        <div className="header-content">
          <h1 className="reclamos-title">
            <i className="fas fa-exclamation-circle"></i>
            Análisis de Reclamos
          </h1>
        </div>
      </div>

      <div className="reclamos-content">
        <div className="filtros-principales">
          <div className="filtro-grupo">
            <label htmlFor="fecha">
              <i className="fas fa-calendar-alt"></i> Fecha
            </label>
            <input
              id="fecha"
              type="date"
              className="input-fecha"
              value={fechaTemporal}
              onChange={(event) => setFechaTemporal(event.target.value)}
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
              disabled={datosCompletos.length === 0}
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
            <button className="btn-icono btn-icono-buscar" onClick={handleBuscar} disabled={!fechaTemporal || isLoading} title="Buscar">
              <i className={`fas ${isLoading ? "fa-spinner fa-spin" : "fa-search"}`}></i>
            </button>
            <button className="btn-icono btn-icono-limpiar" onClick={handleLimpiar} disabled={!hayFiltrosActivos} title="Limpiar filtros">
              <i className="fas fa-eraser"></i>
            </button>
            <button className="btn-icono btn-icono-exportar" onClick={exportarExcel} disabled={datosOrdenados.length === 0} title="Exportar a Excel">
              <i className="fas fa-file-excel"></i>
            </button>
          </div>
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
        ) : !fechaSeleccionada ? (
          <div className="mensaje-inicial">
            <i className="fas fa-calendar-check"></i>
            <h3>Selecciona una fecha</h3>
            <p>Por favor, selecciona una fecha para visualizar los reclamos</p>
          </div>
        ) : datosOrdenados.length === 0 ? (
          <div className="mensaje-vacio">
            <i className="fas fa-inbox"></i>
            <h3>No hay reclamos registrados</h3>
            <p>No se encontraron reclamos para los filtros seleccionados</p>
          </div>
        ) : (
          <div className="tabla-responsive">
            <table className="tabla-reclamos">
              <thead>
                <tr>
                  {columnas.map((col) => (
                    <th key={col.id}>
                      <div className="th-content">
                        {col.ordenable ? (
                          <span
                            onClick={() =>
                              handleOrden(
                                col.id,
                                ordenColumna.columna === col.id && ordenColumna.direccion === "asc" ? "desc" : "asc",
                              )
                            }
                          >
                            {col.label}
                            {ordenColumna.columna === col.id && (
                              <i className={`fas fa-sort-${ordenColumna.direccion === "asc" ? "up" : "down"}`}></i>
                            )}
                          </span>
                        ) : (
                          <span>{col.label}</span>
                        )}

                        {col.filtrable && (
                          <button
                            className={`btn-filtro-th ${filtrosColumnas[col.id]?.length ? "filtro-activo" : ""}`}
                            onClick={() => toggleMenuFiltro(col.id)}
                            title={`Filtrar ${col.label}`}
                          >
                            <i className="fas fa-filter"></i>
                          </button>
                        )}

                        {col.filtrable && menuFiltroAbierto === col.id && (
                          <div className="menu-filtro" onClick={(event) => event.stopPropagation()}>
                            <div className="menu-filtro-header">Filtrar {col.label}</div>

                            {col.ordenable && (
                              <div className="orden-btns">
                                <button
                                  className={`btn-orden ${
                                    ordenColumna.columna === col.id && ordenColumna.direccion === "asc" ? "activo" : ""
                                  }`}
                                  onClick={() => handleOrden(col.id, "asc")}
                                >
                                  <i className="fas fa-sort-up"></i>
                                  A-Z
                                </button>
                                <button
                                  className={`btn-orden ${
                                    ordenColumna.columna === col.id && ordenColumna.direccion === "desc" ? "activo" : ""
                                  }`}
                                  onClick={() => handleOrden(col.id, "desc")}
                                >
                                  <i className="fas fa-sort-down"></i>
                                  Z-A
                                </button>
                              </div>
                            )}

                            <div className="input-con-icono">
                              <i className="fas fa-search icono-busqueda"></i>
                              <input
                                type="text"
                                className="input-busqueda-filtro"
                                placeholder="Buscar..."
                                value={busquedaFiltro[col.id] || ""}
                                onChange={(event) =>
                                  setBusquedaFiltro((prev) => ({ ...prev, [col.id]: event.target.value }))
                                }
                              />
                            </div>

                            <div className="checkbox-todos">
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={filtrosColumnas[col.id]?.length === obtenerValoresUnicos(col.id as keyof SpeechReclamo).length}
                                  onChange={() => seleccionarTodosFiltro(col.id)}
                                />
                                Seleccionar todos
                              </label>
                            </div>

                            <div className="valores-checkbox">
                              {obtenerValoresUnicos(col.id as keyof SpeechReclamo).map((valor) => (
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

                            <div className="menu-filtro-acciones">
                              <button className="btn-filtro-accion btn-limpiar-filtro" onClick={() => limpiarFiltroColumna(col.id)}>
                                Limpiar
                              </button>
                              <button className="btn-filtro-accion btn-aplicar-filtro" onClick={() => aplicarFiltroColumna(col.id)}>
                                Aplicar
                              </button>
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
                  <tr key={`${fila.documento || "fila"}-${idx}`}>
                    <td>{fila.documento}</td>
                    <td>{fila.cartera}</td>
                    <td>{fila.fecha}</td>
                    <td>{fila.horaInicio}</td>
                    <td>{fila.tiempoHablado}</td>
                    <td>{fila.agencia}</td>
                    <td>{fila.supervisor}</td>
                    <td>{fila.tipoReclamo}</td>
                    <td>{fila.tipificacion}</td>
                    <td>
                      {fila.grabacion ? (
                        <a href={fila.grabacion} target="_blank" rel="noopener noreferrer" className="btn-grabacion">
                          <i className="fas fa-play-circle"></i>
                          Escuchar
                        </a>
                      ) : (
                        <span style={{ color: "#999" }}>No disponible</span>
                      )}
                    </td>
                    <td>
                      <div className="acciones-btns">
                        <button className="btn-accion btn-transcripcion" onClick={() => abrirModal(fila.transcripcion || "", "Transcripción")} title="Ver transcripción">
                          <i className="fas fa-file-alt"></i>
                        </button>
                        <button className="btn-accion btn-observacion" onClick={() => abrirModal(fila.observacion || "", "Observación")} title="Ver observación">
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
                Mostrando <strong>{datosPaginados.length}</strong> de <strong>{datosPaginacion.total}</strong> registros
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
                <i className={`fas fa-${tituloModal === "Transcripción" ? "file-alt" : "comment-dots"}`}></i>
                {tituloModal}
              </h2>
              <button className="btn-cerrar-modal" onClick={cerrarModal} title="Cerrar">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>{contenidoModal || "No disponible"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reclamos
