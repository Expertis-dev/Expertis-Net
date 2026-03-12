import { FilterHistorialAsesor } from "@/components/feedback/historialAsesor/FilterHistorialAsesor";
import { HistorialAsesorFila } from "@/components/feedback/historialAsesor/HistorialAsesorFila";
import { HistorialHeaders } from "@/components/feedback/historialAsesor/HistorialAsesorHeaders";
import { Table } from "@/components/feedback/Table";
import Link from "next/link";

export default function HistorialSupervisoresPage() {
    return (
        <>
            <h1 className="font-semibold text-[20px] pl-2 pb-1">Registros históricos</h1>
            <FilterHistorialAsesor />


            <Table>
                <HistorialHeaders 
                    esSupervisor
                />
                {/* //* Fila con boton */}
                <div className="grid grid-cols-1 md:grid-cols-3 px-3 py-0.5 items-center border-b hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors justify-items-center">
                    <div className="flex justify-between md:block">
                        <span>2026-1</span>
                    </div>
                    <div className="flex justify-between md:block">
                        <span className="text-green-600 font-medium text-sm">Publicada</span>
                    </div>
                    <div className="flex justify-between md:block">
                        <Link href={`/dashboard/feedback/historialSupervisores/compromiso/1`} >
                            <button className="hover:bg-blue-800 dark:hover:bg-blue-800 bg-blue-500 text-white cursor-pointer dark:bg-blue-950 px-3 my-0.5 rounded-2xl">
                                Redactar Compromiso
                            </button>
                        </Link>
                    </div>
                </div>
                <HistorialAsesorFila esSupervisor/>
            </Table>
        </>
    );
}
