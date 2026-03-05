import { FilterHistorialAsesor } from "@/components/feedback/historialAsesor/FilterHistorialAsesor";
import { HistorialAsesorFila } from "@/components/feedback/historialAsesor/HistorialAsesorFila";
import { HistorialAsesorHeaders } from "@/components/feedback/historialAsesor/HistorialAsesorHeaders";
import { Table } from "@/components/feedback/Table";
import { Button } from "@/components/ui/button";
import { ComputerIcon, DownloadIcon, SheetIcon } from "lucide-react";
import Link from "next/link";

export default function HistorialAsesoresPage() {
    return (
        <>
            <div className="flex flex-row justify-between mb-1">
                <div className="flex flex-col gap-1 text-gray-900">
                    <h1 className="text-2xl font-bold leading-tight text-slate-800">
                        Historial de feedbacks
                    </h1>
                </div>
                <div className="flex flex-auto justify-end">
                    <Button className="mr-2.5 bg-green-600 mt-1" >
                        <ComputerIcon />
                        Generar Análisis de resultados
                    </Button>
                    <Button className="mr-2.5 bg-green-600 mt-1" >
                        <SheetIcon />
                        Exportar a Excel
                    </Button>
                    <Link
                        href={"/dashboard/"}
                    >
                        <Button className="bg-blue-600 mt-1">
                            <h2>+</h2>
                            <h2>Nueva Entrada</h2>
                        </Button>
                    </Link>
                </div>
            </div>
            {/* // Filtro */}
            <FilterHistorialAsesor />
            {/* Tabla */}
            <Table>
                <HistorialAsesorHeaders />
                <HistorialAsesorFila />
                <HistorialAsesorFila />
            </Table>
        </>
    );
}