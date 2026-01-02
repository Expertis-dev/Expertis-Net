"use client";
import React, { useState, useEffect } from "react";
import { BaseHeader, FileStatus, ProcessFilters, ViewSelector } from "@/components/BaseComponents";
import { useBaseLogic } from "@/hooks/useBaseLogic";
import TablaDinamica from "@/components/base-Table";
import DownloadExcel from "@/components/DownloadExcel";
import { getColaboradores } from "@/services/asesoresService";
import { CargarActividad } from "@/services/CargarActividad";
import { useUser } from "@/Provider/UserProvider";
import type { ResponseData, FilaNvl1, FilaNvl2, FilaHoras, VistaActiva } from "@/types/Bases";
import { Empleado } from "@/types/Empleado";

const columnasNvl1 = ["Asesor", "Total clientes", "Total gestionados", "Total no gestionados", "Porcentaje gestionados", "Contacto efectivo", "No contacto", "Contacto no efectivo"];
const columnasNvl2 = ["Asesor", "VLL", "CAN", "PAR", "PPC", "PPM", "REN", "RPP", "TAT", "FAL", "MCT", "DES", "GRB", "HOM", "ILC", "NOC", "NTT"];
const columnasHoras = ["Asesor", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

export default function Bases() {
  const logic = useBaseLogic("bases_manuales", 2);
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>("nvl1");
  const [datosBackend, setDatosBackend] = useState<ResponseData | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const { user } = useUser();

  // Recuperar datos guardados
  useEffect(() => {
    const datosGuardados = localStorage.getItem("datos_backend");
    if (datosGuardados) {
      try { setDatosBackend(JSON.parse(datosGuardados)); } catch (err) { console.error(err); }
    }
  }, []);

  const ProcesarInformacion = async () => {
    if (logic.bloqueado) return logic.setError(`Has alcanzado el límite diario.`);
    if (!logic.archivoSeleccionado) return logic.setError("Debe seleccionar un archivo");
    
    logic.setError(null);
    setCargando(true);

    try {
      const data1 = await getColaboradores(user?.usuario);
      const ArrayAsesores = data1.map((asesor: Empleado) => asesor.usuario);
      
      const fd = new FormData();
      fd.append("end_date", logic.date);
      fd.append("file", logic.archivoSeleccionado);
      fd.append("start_date", logic.dateY);
      fd.append("ArrayAsesores", JSON.stringify(ArrayAsesores));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_ANDERSON}/api/procesar-datos`, {
        method: "POST", body: fd,
      });
      
      const data: ResponseData = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al procesar el archivo");
      
      setDatosBackend(data);
      localStorage.setItem("datos_backend", JSON.stringify(data));
      
      CargarActividad({
        usuario: user?.usuario || "Desconocido",
        titulo: "Proceso de datos en Base Manuales",
        descripcion: `Se proceso los datos de las bases manuales`,
        estado: "completed",
      });
      
      logic.registrarProcesoExitoso();

    } catch (err) {
      CargarActividad({
        usuario: user?.usuario || "Desconocido",
        titulo: "Error proceso Base Manuales",
        descripcion: "Fallo al procesar",
        estado: "error",
      });
      logic.setError(err instanceof Error ? err.message : "Error al procesar el archivo");
    } finally {
      setCargando(false);
    }
  };

  // Mapeos de datos
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
      <BaseHeader title="Gestor de Bases" subtitle="Carga y procesa archivos para análisis" onUploadClick={logic.handleFileSelect} />
      <FileStatus file={logic.archivoSeleccionado} onClear={logic.handleClearFile} error={logic.error} />
      
      <ProcessFilters 
        dateStart={logic.dateY} 
        dateEnd={logic.date}
        maxDate={logic.maxDate}
        onStartChange={logic.handleChangeStartDate} 
        onEndChange={logic.handleChangeEndDate}
        onProcess={ProcesarInformacion} 
        loading={cargando} 
        blocked={logic.bloqueado}
      />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ViewSelector activeView={vistaActiva} onViewChange={setVistaActiva} />
          {datosBackend && (
            <DownloadExcel hojas={[
                { nombre: "Gestiones Detalladas", datos: datosBackend.gestiones_detalladas_por_asesor },
                { nombre: "No Gestionados", datos: datosBackend.no_gestionados_por_asesor },
            ]} />
          )}
        </div>

        <div className="border rounded-lg overflow-hidden">
           {vistaActiva === "nvl1" && <TablaDinamica datosGlobales={datosBackend} columnas={columnasNvl1} datos={datosNvl1} />}
           {vistaActiva === "nvl2" && <TablaDinamica datosGlobales={datosBackend} columnas={columnasNvl2} datos={datosNvl2} />}
           {vistaActiva === "horas" && <TablaDinamica datosGlobales={datosBackend} columnas={columnasHoras} datos={datosHoras} />}
        </div>
      </section>
    </div>
  );
}