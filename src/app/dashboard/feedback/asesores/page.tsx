import { AsesorFila } from "@/components/feedback/asesor/AsesorFila";
import { AsesorHeaders } from "@/components/feedback/AsesorHeaders";
import { FilterAsesor } from "@/components/feedback/asesor/FilterAsesor";
import { Table } from "@/components/feedback/Table";
import { Button } from "@/components/ui/button";
import { SheetIcon } from "lucide-react";
import Link from "next/link";

export interface Empleado {
    alias: string;
    idEmpleado: number;
}

export interface HistFeedback {
    idFeedback: string;
    tipoEvaluacion: string;
    periodo: string;
    estadoFeedback: string;
}


const fetchAsesores = async (): Promise<Empleado[]> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/asesores`).then(r => r.json())
    return res
}

const fetchFeedbacksAsesores = async (
    idAsesor = "",
    filtroMes = "",
    tipoEvaluacion = "",
    userName = "",
    usrInsert: string = "",
    tipoEmpleado = "ASESOR",
): Promise<HistFeedback[]> => {
    const urlParams = new URLSearchParams()
    idAsesor !== "" ? urlParams.set("idAsesor", idAsesor) : null
    filtroMes !== "" ? urlParams.set("filtroMes", filtroMes) : null
    tipoEvaluacion !== "" ? urlParams.set("tipoEvaluacion", tipoEvaluacion.toUpperCase()) : null
    urlParams.set("tipoEmpleado", tipoEmpleado)
    urlParams.set("usrInsert", usrInsert)
    userName !== "" ? urlParams.set("usrInsert", userName) : null
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedbacks?${urlParams.toString()}`).then(r => r.json())
    return res
}

export default async function AsesoresPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const {
        idAsesor,
        filtroMes,
        tipoEvaluacion,
        userName,
        usrInsert
    } = (await searchParams)
    const asesores = await fetchAsesores()
    const feedbacks = await fetchFeedbacksAsesores(
        idAsesor,
        filtroMes,
        tipoEvaluacion,
        userName,
        usrInsert,
    )
    return (
        <>
            {/*//* HEADER */}
            <div className="flex flex-row justify-between mb-4 mx-2">
                <div className="flex flex-col gap-1 text-gray-900">
                    <h1 className="text-2xl font-bold leading-tight text-slate-800 dark:text-zinc-200">
                        Historial de feedback de asesores
                    </h1>
                    <p className="text-sm text-slate-600 max-w-2xl dark:text-zinc-400">
                        Revise y exporte evaluaciones historicas del equipo para seguir el desempeno de cada asesor.
                    </p>
                </div>
                <div className="flex flex-auto justify-end">
                    <Button className="mr-2.5 dark:bg-green-700 bg-green-500 mt-1 dark:text-gray-200 dark:hover:bg-green-900 hover:bg-green-600" >
                        <SheetIcon />
                        Exportar a Excel
                    </Button>
                    <Link
                        href={"/dashboard/feedback/asesores/crear"}
                    >
                        <Button className="dark:bg-blue-800 bg-blue-500 hover:bg-blue-600  mt-1 dark:text-gray-200 dark:hover:bg-blue-900">
                            <h2>+</h2>
                            <h2>Nueva Entrada</h2>
                        </Button>
                    </Link>
                </div>
            </div>

            <FilterAsesor
                asesores={asesores}
            />

            {/* Tabla */}
            <Table>
                <AsesorHeaders />
                {
                    feedbacks.map((v) => (
                        <AsesorFila key={v.idFeedback}
                            idFeedback={v.idFeedback}
                            estadoFeedback={v.estadoFeedback}
                            periodo={v.periodo}
                            tipoEvaluacion={v.tipoEvaluacion}
                        />
                    ))
                }
            </Table>
        </>
    );
}
