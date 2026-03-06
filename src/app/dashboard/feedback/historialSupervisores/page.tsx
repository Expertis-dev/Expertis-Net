import { FilterHistorialAsesor } from "@/components/feedback/historialAsesor/FilterHistorialAsesor";
import { HistorialAsesorFila } from "@/components/feedback/historialAsesor/HistorialAsesorFila";
import { HistorialAsesorHeaders } from "@/components/feedback/historialAsesor/HistorialAsesorHeaders";
import { Table } from "@/components/feedback/Table";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, Edit2Icon } from "lucide-react";
import Link from "next/link";

export default function HistorialSupervisoresPage() {
    return (
        <>
            {/* //* NOTIFICACION */}
            <h1 className="font-semibold text-x ml-2"><span className="text-orange-700 font-semibold">!</span> Acción Pendiente</h1>
            <div className="flex flex-row border dark:border-zinc-700 p-3 my-1 mx-2">
                <AlertCircleIcon className="mr-2 flex-initial text-blue-400" />
                <div className="flex-2/3">
                    <h2 className="text-base font-semibold dark:text-zinc-200 text-black ">
                        Enero 2026
                        <span className="ml-2 rounded-full border border-blue-200 bg-blue-50 dark:bg-blue-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-500">
                            Publicado
                        </span>
                    </h2>
                    <p className="text-xs mt-2">Evaluacion disponible. Se requiere compromiso de mejora basado en el feedback de jefatura de operaciones</p>
                </div>
                <Link href={'/dashboard/feedback/historialSupervisores/compromiso/1'} >
                    <Button className="flex-1 dark:bg-zinc-600 dark:text-zinc-200 bg-blue-500 mt-1">
                        Redactar compromiso
                        <Edit2Icon />
                    </Button>
                </Link>
            </div>

            <h1 className="font-semibold text-[20px] pl-2 pb-1">Registros históricos</h1>
            <FilterHistorialAsesor />


            <Table>
                <HistorialAsesorHeaders />
                {/* //* Fila con boton */}
                <div className="grid grid-cols-1 md:grid-cols-4 px-3 py-0.5 items-center border-b hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors justify-items-center">
                    <div className="flex justify-between md:block">
                        <span>Rutina</span>
                    </div>
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
                <HistorialAsesorFila />
            </Table>
        </>
    );
}
