"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import TablaDinamica from "@/components/base-Table";
import DownloadExcel from "@/components/DownloadExcel";
import { Upload, FileSpreadsheet, X, AlertCircle, Calendar, Loader2 } from "lucide-react";
import type {
  ResponseData,
  FilaNvl1,
  FilaNvl2,
  FilaHoras,
  VistaActiva
} from "@/types/Bases";
import { useUser } from "@/Provider/UserProvider";
import { Empleado } from "@/types/Empleado";
import { getColaboradores } from "@/services/asesoresService";
import { CargarActividad } from "@/services/CargarActividad";

const columnasNvl1 = [
  "Asesor",
  "Total clientes",
  "Total gestionados",
  "Total no gestionados",
  "Porcentaje gestionados",
  "Contacto efectivo",
  "No contacto",
  "Contacto no efectivo",
];

const columnasNvl2 = [
  "Asesor", "VLL", "CAN", "PAR", "PPC", "PPM", "REN", "RPP", "TAT",
  "FAL", "MCT", "DES", "GRB", "HOM", "ILC", "NOC", "NTT"
];

const columnasHoras = [
  "Asesor",
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

export default function Bases() {
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>("nvl1");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [datosBackend, setDatosBackend] = useState<ResponseData | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const { user } = useUser()
  // Fechas por defecto
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const [date, setDate] = useState<string>(today);
  const [dateY, setDateY] = useState<string>(yesterday);

  // Límite y control diario
  const LIMITE_PROCESOS = 2;
  const [contadorProcesos, setContadorProcesos] = useState<number>(0);
  const [bloqueado, setBloqueado] = useState<boolean>(false);

  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];
    const contadorGuardado = localStorage.getItem("procesos_realizados");
    const fechaGuardada = localStorage.getItem("fecha_procesos");

    if (!fechaGuardada || fechaGuardada !== hoy) {
      localStorage.setItem("procesos_realizados", "0");
      localStorage.setItem("fecha_procesos", hoy);
      setContadorProcesos(0);
      setBloqueado(false);
    } else {
      const num = parseInt(contadorGuardado || "0");
      setContadorProcesos(num);
      if (num >= LIMITE_PROCESOS) setBloqueado(true);
    }
  }, []);

  useEffect(() => {
    const datosGuardados = localStorage.getItem("datos_backend");
    if (datosGuardados) {
      try {
        setDatosBackend(JSON.parse(datosGuardados));
      } catch (err) {
        console.error("Error al leer datos:", err);
      }
    }
  }, []);

  const handleChangeStartDate = (value: string) => {
    setDateY(value);
    const nuevaFin = new Date(value);
    nuevaFin.setDate(nuevaFin.getDate() + 1);
    setDate(nuevaFin.toISOString().split("T")[0]);
  };

  const handleChangeEndDate = (value: string) => {
    setDate(value);
    const nuevaInicio = new Date(value);
    nuevaInicio.setDate(nuevaInicio.getDate() - 1);
    setDateY(nuevaInicio.toISOString().split("T")[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArchivoSeleccionado(file);
    setError(null);
    e.target.value = "";
  };

  const handleClearFile = () => {
    setArchivoSeleccionado(null);
    setError(null);
  };

  const ProcesarInformacion = async () => {
    if (bloqueado) {
      setError(`Has alcanzado el límite de ${LIMITE_PROCESOS} procesos por día.`);
      return;
    }

    if (!archivoSeleccionado) {
      setError("Debe seleccionar un archivo antes de procesar");
      return;
    }
    setError(null);
    setCargando(true);
    const data1 = await getColaboradores(user?.usuario);
    const ArrayAsesores = data1.map((asesor: Empleado) => {
      return asesor.usuario
    })
    const fd = new FormData();
    fd.append("end_date", date);
    fd.append("file", archivoSeleccionado);
    fd.append("start_date", dateY);
    fd.append("ArrayAsesores", JSON.stringify(ArrayAsesores))
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_ANDERSON}/api/procesar-datos`, {
        method: "POST",
        body: fd,
      });
      const data: ResponseData = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al procesar el archivo");
      setDatosBackend(data);
      CargarActividad({
        usuario: user?.usuario || "Desconocido",
        titulo: "Proceso de datos en Base Manuales",
        descripcion: `Se proceso los datos de las bases manuales`,
        estado: "completed",
      })
      localStorage.setItem("datos_backend", JSON.stringify(data));
      const nuevoContador = contadorProcesos + 1;
      setContadorProcesos(nuevoContador);
      localStorage.setItem("procesos_realizados", nuevoContador.toString());
      localStorage.setItem("fecha_procesos", new Date().toISOString().split("T")[0]);
      if (nuevoContador >= LIMITE_PROCESOS) setBloqueado(true);
    } catch (err) {
      CargarActividad({
        usuario: user?.usuario || "Desconocido",
        titulo: "Se intento procesar de datos en Base Manuales",
        descripcion: `No se logro procesar los datos de las bases manuales`,
        estado: "error",
      })
      setError(err instanceof Error ? err.message : "Error al procesar el archivo");
    } finally {
      setCargando(false);
    }
  };

  // Mapear datos para NVL1
  const datosNvl1: FilaNvl1[] = datosBackend?.asesores.map(asesor => ({
    Asesor: asesor,
    "Total clientes": datosBackend.nvl1.conteo_cliente_por_asesor[asesor] || 0,
    "Total gestionados": datosBackend.nvl1.conteo_clientes_gestionados[asesor] || 0,
    "Total no gestionados": datosBackend.nvl1.conteo_clientes_no_gestionados[asesor] || 0,
    "Porcentaje gestionados": `${(datosBackend.nvl1.porcentaje_clientes_gestionados[asesor] || 0).toFixed(2)}%`,
    "Contacto efectivo": datosBackend.nvl1["CONTACTO EFECTIVO"][asesor] || 0,
    "No contacto": datosBackend.nvl1["NO CONTACTO"][asesor] || 0,
    "Contacto no efectivo": datosBackend.nvl1["CONTACTO NO EFECTIVO"][asesor] || 0,
  })) || [];

  // Mapear datos para NVL2
  const datosNvl2: FilaNvl2[] = datosBackend?.asesores.map(asesor => ({
    Asesor: asesor,
    VLL: datosBackend.nvl2.VLL?.[asesor] || 0,
    CAN: datosBackend.nvl2.CAN?.[asesor] || 0,
    PAR: datosBackend.nvl2.PAR?.[asesor] || 0,
    PPC: datosBackend.nvl2.PPC?.[asesor] || 0,
    PPM: datosBackend.nvl2.PPM?.[asesor] || 0,
    REN: datosBackend.nvl2.REN?.[asesor] || 0,
    RPP: datosBackend.nvl2.RPP?.[asesor] || 0,
    TAT: datosBackend.nvl2.TAT?.[asesor] || 0,
    FAL: datosBackend.nvl2.FAL?.[asesor] || 0,
    MCT: datosBackend.nvl2.MCT?.[asesor] || 0,
    DES: datosBackend.nvl2.DES?.[asesor] || 0,
    GRB: datosBackend.nvl2.GRP?.[asesor] || 0,
    HOM: datosBackend.nvl2.HOM?.[asesor] || 0,
    ILC: datosBackend.nvl2.ILC?.[asesor] || 0,
    NOC: datosBackend.nvl2.NOC?.[asesor] || 0,
    NTT: datosBackend.nvl2.NTT?.[asesor] || 0,
  })) || [];

  // Mapear datos para Horas
  const datosHoras: FilaHoras[] = datosBackend?.asesores.map(asesor => ({
    Asesor: asesor,
    "07:00": datosBackend.horas["07:00"]?.[asesor] || 0,
    "08:00": datosBackend.horas["08:00"]?.[asesor] || 0,
    "09:00": datosBackend.horas["09:00"]?.[asesor] || 0,
    "10:00": datosBackend.horas["10:00"]?.[asesor] || 0,
    "11:00": datosBackend.horas["11:00"]?.[asesor] || 0,
    "12:00": datosBackend.horas["12:00"]?.[asesor] || 0,
    "13:00": datosBackend.horas["13:00"]?.[asesor] || 0,
    "14:00": datosBackend.horas["14:00"]?.[asesor] || 0,
    "15:00": datosBackend.horas["15:00"]?.[asesor] || 0,
    "16:00": datosBackend.horas["16:00"]?.[asesor] || 0,
    "17:00": datosBackend.horas["17:00"]?.[asesor] || 0,
    "18:00": datosBackend.horas["18:00"]?.[asesor] || 0,
    "19:00": datosBackend.horas["19:00"]?.[asesor] || 0,
  })) || [];
  return (
    <div className="container mx-auto space-y-4">
      {/* Header Principal */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestor de Bases</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Carga y procesa archivos de Excel para análisis de datos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            id="fileInput"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="default"
            size="default"
            onClick={() => document.getElementById("fileInput")?.click()}
            className="gap-2 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Cargar Archivo
          </Button>
        </div>
      </header>

      {/* Estado del Archivo */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Archivo Cargado</h2>
        <div className="bg-card border rounded-lg">
          {archivoSeleccionado ? (
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className=" bg-green-50 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {archivoSeleccionado.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(archivoSeleccionado.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearFile}
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Eliminar archivo</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-muted-foreground p-4">
              <div className="bg-muted rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <p className="text-sm">Ningún archivo seleccionado</p>
            </div>
          )}
        </div>
      </section>

      {/* Mensaje de Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Filtros y Controles */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Configuración de Filtros</h2>
          <p className="text-sm text-muted-foreground">
            Tener en cuenta que es necesario que el archivo tenga las columnas Documento, Cartera y Asesor
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rango de Fechas */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Fecha inicio
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={dateY}
                    onChange={(e) => handleChangeStartDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Fecha fin
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => handleChangeEndDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botón de Procesar */}
          <div className="flex items-end">
            <Button
              onClick={ProcesarInformacion}
              disabled={cargando || bloqueado}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {cargando ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </div>
              ) : (
                "Procesar Información"
              )}
            </Button>
          </div>
        </div>
      </section>
      {/* Navegación entre Vistas */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={vistaActiva === "nvl1" ? "default" : "outline"}
              size="sm"
              onClick={() => setVistaActiva("nvl1")}
              className="px-4"
            >
              Vista Nivel 1
            </Button>
            <Button
              variant={vistaActiva === "nvl2" ? "default" : "outline"}
              size="sm"
              onClick={() => setVistaActiva("nvl2")}
              className="px-4"
            >
              Vista Nivel 2
            </Button>
            <Button
              variant={vistaActiva === "horas" ? "default" : "outline"}
              size="sm"
              onClick={() => setVistaActiva("horas")}
              className="px-4"
            >
              Vista Horas
            </Button>
          </div>

          {datosBackend && (
            <DownloadExcel
              hojas={[
                {
                  nombre: "Gestiones Detalladas",
                  datos: datosBackend.gestiones_detalladas_por_asesor
                },
                {
                  nombre: "No Gestionados",
                  datos: datosBackend.no_gestionados_por_asesor
                },
              ]}
            />
          )}
        </div>

        {/* Contenido de la Vista Activa */}
        <div className="border rounded-lg overflow-hidden">
          {vistaActiva === "nvl1" && (
            <TablaDinamica
              datosGlobales={datosBackend}
              columnas={columnasNvl1}
              datos={datosNvl1}
            />
          )}
          {vistaActiva === "nvl2" && (
            <TablaDinamica
              datosGlobales={datosBackend}
              columnas={columnasNvl2}
              datos={datosNvl2}
            />
          )}
          {vistaActiva === "horas" && (
            <TablaDinamica
              datosGlobales={datosBackend}
              columnas={columnasHoras}
              datos={datosHoras}
            />
          )}
        </div>
      </section>
    </div>
  );
}