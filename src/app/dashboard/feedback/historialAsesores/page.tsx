import { FilterHistorialAsesor } from "@/components/feedback/historialAsesor/FilterHistorialAsesor";
import { HistorialAsesorFila } from "@/components/feedback/historialAsesor/HistorialAsesorFila";
import { HistorialAsesorHeaders } from "@/components/feedback/historialAsesor/HistorialAsesorHeaders";
import { Table } from "@/components/feedback/Table";

export default function HistorialAsesoresPage() {
    return (
        <>
            <div className="flex flex-row justify-between mb-1">
                <div className="flex flex-col gap-1 text-gray-900 ml-2">
                    <h1 className="text-2xl font-bold leading-tight text-slate-800 dark:text-zinc-200">
                        Historial de feedbacks
                    </h1>
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