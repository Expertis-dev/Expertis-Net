"use client";

import React from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { saveAs } from "file-saver";

type FilaDatos = object;

type DatosHoja = FilaDatos[] | Record<string, FilaDatos[]>;

export interface HojaExcel {
  nombre: string;

  datos: DatosHoja | null | undefined;
}

interface DownloadExcelProps {
  hojas: HojaExcel[];
  nombreArchivo?: string;
  className?: string;
}

export default function DownloadExcel({
  hojas,
  nombreArchivo = "Reporte_Gestion",
  className,
}: DownloadExcelProps) {

  const handleExport = () => {
    try {
      if (!Array.isArray(hojas)) {
        console.error("Error: 'hojas' debe ser un array.");
        return;
      }

      const wb = XLSX.utils.book_new();
      let hayDatos = false;

      hojas.forEach((hoja) => {
        let datosParaExcel: FilaDatos[] = [];

        // Normalización de datos
        if (!hoja.datos) {
          datosParaExcel = [];
        } else if (Array.isArray(hoja.datos)) {
          datosParaExcel = hoja.datos;
        } else {

          datosParaExcel = Object.values(hoja.datos).flat();
        }

        //  Generación de hoja
        if (datosParaExcel.length > 0) {
          hayDatos = true;
          const ws = XLSX.utils.json_to_sheet(datosParaExcel);
          const nombreSeguro = (hoja.nombre || "Datos").substring(0, 31);
          XLSX.utils.book_append_sheet(wb, ws, nombreSeguro);
        }
      });

      if (!hayDatos) {
        alert("No hay datos para exportar.");
        return;
      }

      // Descarga
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fecha = new Date().toISOString().slice(0, 10);
      saveAs(blob, `${nombreArchivo}_${fecha}.xlsx`);

    } catch (error) {
      console.error("Error al exportar Excel:", error);
      alert("Error al generar el archivo. Revise la consola.");
    }
  };

  return (
    <Button
      onClick={handleExport}
      className={`bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 ${className || ""}`}
    >
      <FileDown className="w-4 h-4" />
      Descargar Excel
    </Button>
  );
}