"use client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

// interfaces para los tipos
interface Registro {
  documento: string;
  cartera: string;
  fechaLlamada?: string;
  hora?: string;
  nvl1?: string;
  nvl2?: string;
  asesor?: string;
}

interface DatosPorAsesor {
  [asesor: string]: Registro[];
}

interface Hoja {
  nombre: string;
  datos: DatosPorAsesor;
}

interface DownloadExcelProps {
  hojas: Hoja[];
}

export default function DownloadExcel({ hojas }: DownloadExcelProps) {
  const handleExport = () => {
    if (!hojas || hojas.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    // Crear un nuevo libro Excel
    const workbook = XLSX.utils.book_new();

    hojas.forEach(({ nombre, datos }) => {
      // Asegurar que los datos sean válidos
      if (!datos || Object.keys(datos).length === 0) return;

      // Convertir los datos por asesor en filas planas
      const filas: Registro[] = [];
      Object.entries(datos).forEach(([asesor,registros]) => {
        registros.forEach((r: Registro) => {
          filas.push({  
            ...r,
            documento: r.documento ? String(r.documento) : "",
          });
        });
      });

      // Crear hoja
      const worksheet = XLSX.utils.json_to_sheet(filas);
      XLSX.utils.book_append_sheet(workbook, worksheet, nombre.slice(0, 31)); 
    });

    // Generar buffer Excel
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    // Descargar
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Reporte_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <Button
      onClick={handleExport}
      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
    >
      <FileDown className="w-4 h-4" />
      Descargar Excel
    </Button>
  );
}