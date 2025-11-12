"use client"
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import TablaDinamica from "@/components/base-Table";
import DownloadExcel from "@/components/DownloadExcel";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import type {
  ResponseData,
  FilaNvl1,
  FilaNvl2,
  FilaHoras,
  VistaActiva
} from "@/types/Bases";

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

    setCargando(true);
    setError(null);

    const fd = new FormData();
    fd.append("end_date", date);
    fd.append("file", archivoSeleccionado);
    fd.append("start_date", dateY);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_ANDERSON}/api/procesar-datos`, {
        method: "POST",
        body: fd,
      });

      const data: ResponseData = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al procesar el archivo");

      setDatosBackend(data);
      localStorage.setItem("datos_backend", JSON.stringify(data));


      const nuevoContador = contadorProcesos + 1;
      setContadorProcesos(nuevoContador);
      localStorage.setItem("procesos_realizados", nuevoContador.toString());
      localStorage.setItem("fecha_procesos", new Date().toISOString().split("T")[0]);

      if (nuevoContador >= LIMITE_PROCESOS) setBloqueado(true);
    } catch (err) {
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
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Gestor de Bases</h1>
          <div className="flex gap-2">
            <input
              type="file"
              id="fileInput"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                const input = document.getElementById("fileInput");
                if (input) input.click();
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Cargar Archivo
            </Button>
          </div>
        </div>

        {/* File Selection Status */}
        <div className="bg-muted/50 p-4 rounded-lg">
          {archivoSeleccionado ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">{archivoSeleccionado.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(archivoSeleccionado.size / 1024).toFixed(2)} KB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Ningún archivo seleccionado</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Filter Section */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Rango de fecha:
            <span className="text-muted-foreground"> Tener en cuenta que es necesario que el archivo tenga las columnas Documento, Cartera y Asesor </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Fecha inicio:</label>
              <input
                type="date"
                value={dateY}
                onChange={(e) => handleChangeStartDate(e.target.value)}
                className="px-2 py-2 border rounded-md text-sm w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Fecha fin:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => handleChangeEndDate(e.target.value)}
                className="px-2 py-2 border rounded-md text-sm w-full"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4 mt-4">
              <Button
                variant={vistaActiva === "nvl1" ? "default" : "secondary"}
                size="sm"
                onClick={() => setVistaActiva("nvl1")}
              >
                nvl1
              </Button>
              <Button
                variant={vistaActiva === "nvl2" ? "default" : "secondary"}
                size="sm"
                onClick={() => setVistaActiva("nvl2")}
              >
                nvl2
              </Button>
              <Button
                variant={vistaActiva === "horas" ? "default" : "secondary"}
                size="sm"
                onClick={() => setVistaActiva("horas")}
              >
                horas
              </Button>
              <Button
                onClick={ProcesarInformacion}
                disabled={cargando || bloqueado}
                className="bg-teal-500 hover:bg-teal-600 text-white disabled:bg-gray-400"
              >
                {cargando ? "Procesando..." : "Procesar"}
              </Button>

              {datosBackend && (
                <DownloadExcel
                  hojas={[
                    { nombre: "Gestiones Detalladas", datos: datosBackend.gestiones_detalladas_por_asesor },
                    { nombre: "No Gestionados", datos: datosBackend.no_gestionados_por_asesor },
                  ]}
                />
              )}
            </div>
          </div>
        </div>

        {/* Tablas */}
        {vistaActiva === "nvl1" && <TablaDinamica datosGlobales={datosBackend} columnas={columnasNvl1} datos={datosNvl1} />}
        {vistaActiva === "nvl2" && <TablaDinamica datosGlobales={datosBackend} columnas={columnasNvl2} datos={datosNvl2} />}
        {vistaActiva === "horas" && <TablaDinamica datosGlobales={datosBackend} columnas={columnasHoras} datos={datosHoras} />}
      </div>
    </DashboardLayout>
  )
}