import { AsesorFila } from "@/components/feedback/asesor/AsesorFila";
import { AsesorHeaders } from "@/components/feedback/asesor/AsesorHeaders";
import { Table } from "@/components/feedback/Table";
import { Button } from "@/components/ui/button";
import { SheetIcon } from "lucide-react";
import Link from "next/link";

export default function AsesoresPage() {
    return (
        <>
            {/*//* HEADER */}
            <div className="flex flex-row justify-between mb-4">
                <div className="flex flex-col gap-1 text-gray-900">
                    <h1 className="text-2xl font-bold leading-tight text-slate-800">
                        Historial de feedback de asesores
                    </h1>
                    <p className="text-sm text-slate-600 max-w-2xl">
                        Revise y exporte evaluaciones historicas del equipo para seguir el desempeno de cada asesor.
                    </p>
                </div>
                <div className="flex flex-auto justify-end">
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

            
            {/* Tabla */}
            <Table>
                <AsesorHeaders/>
                <AsesorFila/>
                <AsesorFila/>
                <AsesorFila/>
            </Table>
        </>
    );
}
