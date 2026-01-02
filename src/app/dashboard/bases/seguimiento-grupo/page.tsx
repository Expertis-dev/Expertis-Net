"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BaseHeader, FileStatus, ProcessFilters, ViewSelector } from "@/components/BaseComponents";
import { useBaseLogic } from "@/hooks/useBaseLogic";
import TablaDinamica from "@/components/base-Table";
import DownloadExcel from "@/components/DownloadExcel";
import { Upload, ArrowLeft } from "lucide-react";
import type { VistaActiva, GrupoResponse, FilaCompatible } from "@/types/Bases";
import { useUser } from "@/Provider/UserProvider";
import { CargarActividad } from "@/services/CargarActividad";

const columnasNvl1 = ["Nombre", "Total clientes", "Total gestionados", "Total no gestionados", "Porcentaje gestionados", "Contacto efectivo", "No contacto", "Contacto no efectivo"];
const columnasNvl2 = ["Nombre", "VLL", "CAN", "PAR", "PPC", "PPM", "REN", "RPP", "TAT", "FAL", "MCT", "DES", "GRB", "HOM", "ILC", "NOC", "NTT"];
const columnasHoras = ["Nombre", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

export default function Grupos() {
  const logic = useBaseLogic("bases_grupos", 2);
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>("nvl1");
  const [datosBackend, setDatosBackend] = useState<GrupoResponse | null>(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const { user } = useUser();

  useEffect(() => {
    const datosGuardados = localStorage.getItem("datos_backend_grupos");
    if (datosGuardados) {
      try { setDatosBackend(JSON.parse(datosGuardados)); } catch (err) { console.error(err); }
    }
  }, []);

  const ProcesarInformacion = async () => {
    if (logic.bloqueado) return logic.setError(`Límite diario alcanzado.`);
    if (!logic.archivoSeleccionado) return logic.setError("Seleccione un archivo");
    
    logic.setError(null);
    setCargando(true);
    setGrupoSeleccionado(null);

    const fd = new FormData();
    fd.append("end_date", logic.date);
    fd.append("file", logic.archivoSeleccionado);
    fd.append("start_date", logic.dateY);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL_ANDERSON}/api/procesar-grupos`;
      const response = await fetch(url, { method: "POST", body: fd });
      const data: GrupoResponse = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Error al procesar");

      setDatosBackend(data);
      CargarActividad({ usuario: user?.usuario || "Desconocido", titulo: "Proceso Grupos", descripcion: "Procesamiento exitoso", estado: "completed" });
      localStorage.setItem("datos_backend_grupos", JSON.stringify(data));
      
      logic.registrarProcesoExitoso();

    } catch (err) {
      logic.setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  };

  const obtenerDatosTabla = (): { nvl1: FilaCompatible[]; nvl2: FilaCompatible[]; horas: FilaCompatible[] } => {
    if (!datosBackend) return { nvl1: [], nvl2: [], horas: [] };

    if (grupoSeleccionado && datosBackend.detalle_asesores_por_grupo) {
      const rawDetalle = datosBackend.detalle_asesores_por_grupo[grupoSeleccionado] || [];
      const detalle = rawDetalle.filter(d => d.asesor !== "TOTAL");

      return {
        nvl1: detalle.map(d => ({
          ...d,
          Nombre: d.asesor,
          "Total clientes": d.total_clientes,
          "Total gestionados": d.total_gestionados,
          "Total no gestionados": d.total_no_gestionados,
          "Porcentaje gestionados": typeof d.porcentaje_gestion === 'number' ? `${d.porcentaje_gestion.toFixed(2)}%` : `${d.porcentaje_gestion}`,
          "Contacto efectivo": d.contactos_efectivos || 0,
          "No contacto": d.no_contacto || 0,
          "Contacto no efectivo": d.contacto_no_efectivo || 0,
          esTotal: 0
        })),
        nvl2: detalle.map(d => ({ ...d, Nombre: d.asesor, esTotal: 0 })),
        horas: detalle.map(d => ({ ...d, Nombre: d.asesor, esTotal: 0 }))
      };
    }

    const supervisores = datosBackend.supervisores || [];
    return {
      nvl1: supervisores.map((sup) => ({
        Nombre: sup,
        "Total clientes": datosBackend.nvl1.conteo_total?.[sup] || 0,
        "Total gestionados": datosBackend.nvl1.conteo_gestionados?.[sup] || 0,
        "Total no gestionados": datosBackend.nvl1.conteo_no_gestionados?.[sup] || 0,
        "Porcentaje gestionados": `${(datosBackend.nvl1.porcentaje_gestion?.[sup] || 0).toFixed(2)}%`,
        "Contacto efectivo": datosBackend.nvl1["CONTACTO EFECTIVO"]?.[sup] || 0,
        "No contacto": datosBackend.nvl1["NO CONTACTO"]?.[sup] || 0,
        "Contacto no efectivo": datosBackend.nvl1["CONTACTO NO EFECTIVO"]?.[sup] || 0,
        esGrupo: 1
      })),
      nvl2: supervisores.map((sup) => ({
        Nombre: sup,
        VLL: datosBackend.nvl2.VLL?.[sup] || 0,
        CAN: datosBackend.nvl2.CAN?.[sup] || 0,
        PAR: datosBackend.nvl2.PAR?.[sup] || 0,
        PPC: datosBackend.nvl2.PPC?.[sup] || 0,
        PPM: datosBackend.nvl2.PPM?.[sup] || 0,
        REN: datosBackend.nvl2.REN?.[sup] || 0,
        RPP: datosBackend.nvl2.RPP?.[sup] || 0,
        TAT: datosBackend.nvl2.TAT?.[sup] || 0,
        FAL: datosBackend.nvl2.FAL?.[sup] || 0,
        MCT: datosBackend.nvl2.MCT?.[sup] || 0,
        DES: datosBackend.nvl2.DES?.[sup] || 0,
        GRB: datosBackend.nvl2.GRP?.[sup] || 0,
        HOM: datosBackend.nvl2.HOM?.[sup] || 0,
        ILC: datosBackend.nvl2.ILC?.[sup] || 0,
        NOC: datosBackend.nvl2.NOC?.[sup] || 0,
        NTT: datosBackend.nvl2.NTT?.[sup] || 0,
        esGrupo: 1
      })),
      horas: supervisores.map((sup) => ({
        Nombre: sup,
        "07:00": datosBackend.horas["07:00"]?.[sup] || 0,
        "08:00": datosBackend.horas["08:00"]?.[sup] || 0,
        "09:00": datosBackend.horas["09:00"]?.[sup] || 0,
        "10:00": datosBackend.horas["10:00"]?.[sup] || 0,
        "11:00": datosBackend.horas["11:00"]?.[sup] || 0,
        "12:00": datosBackend.horas["12:00"]?.[sup] || 0,
        "13:00": datosBackend.horas["13:00"]?.[sup] || 0,
        "14:00": datosBackend.horas["14:00"]?.[sup] || 0,
        "15:00": datosBackend.horas["15:00"]?.[sup] || 0,
        "16:00": datosBackend.horas["16:00"]?.[sup] || 0,
        "17:00": datosBackend.horas["17:00"]?.[sup] || 0,
        "18:00": datosBackend.horas["18:00"]?.[sup] || 0,
        "19:00": datosBackend.horas["19:00"]?.[sup] || 0,
        esGrupo: 1
      }))
    };
  };

  const datosTabla = obtenerDatosTabla();

  const handleRowClick = (fila: FilaCompatible) => {
    if (!grupoSeleccionado && fila.esGrupo) {
      setGrupoSeleccionado(fila.Nombre as string);
      setVistaActiva("nvl1");
    }
  };

  return (
    <div className="container mx-auto space-y-4">
      <BaseHeader 
        title={grupoSeleccionado ? `Grupo: ${grupoSeleccionado}` : "Gestión de Grupos"}
        subtitle={grupoSeleccionado ? "Vista detallada de asesores" : "Vista general por Supervisores"}
        onUploadClick={logic.handleFileSelect}
        extraActions={grupoSeleccionado ? (
          <Button variant="outline" onClick={() => setGrupoSeleccionado(null)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Volver a Grupos
          </Button>
        ) : (!grupoSeleccionado && (
          <Button variant="default" onClick={() => document.getElementById("fileInput")?.click()} className="gap-2 shadow-sm">
             <Upload className="w-4 h-4" /> Cargar Archivo
          </Button>
        ))}
      />

      {!grupoSeleccionado && (
        <>
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
            requirementsText="Requisito: Columnas Documento, Cartera, Supervisor y Asesor."
          />
        </>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ViewSelector activeView={vistaActiva} onViewChange={setVistaActiva} />
          {datosBackend && (
            <DownloadExcel hojas={[
                { nombre: "Gestiones Detalladas", datos: datosBackend.gestiones_detalladas_por_asesor },
                { nombre: "No Gestionados", datos: datosBackend.no_gestionados_por_asesor }
            ]} />
          )}
        </div>

        <div className="border rounded-lg overflow-hidden">
          {vistaActiva === "nvl1" && <TablaDinamica datosGlobales={datosBackend} columnas={columnasNvl1} datos={datosTabla.nvl1} onRowClick={!grupoSeleccionado ? handleRowClick : undefined} rowClassName={!grupoSeleccionado ? "cursor-pointer hover:bg-slate-50" : ""} />}
          {vistaActiva === "nvl2" && <TablaDinamica datosGlobales={datosBackend} columnas={columnasNvl2} datos={datosTabla.nvl2} onRowClick={!grupoSeleccionado ? handleRowClick : undefined} rowClassName={!grupoSeleccionado ? "cursor-pointer hover:bg-slate-50" : ""} />}
          {vistaActiva === "horas" && <TablaDinamica datosGlobales={datosBackend} columnas={columnasHoras} datos={datosTabla.horas} onRowClick={!grupoSeleccionado ? handleRowClick : undefined} rowClassName={!grupoSeleccionado ? "cursor-pointer hover:bg-slate-50" : ""} />}
        </div>
      </section>
    </div>
  );
}