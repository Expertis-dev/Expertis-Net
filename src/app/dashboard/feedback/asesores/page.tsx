import { AsesorFila } from "@/components/feedback/asesor/AsesorFila";
import { AsesorHeaders } from "@/components/feedback/AsesorHeaders";
import { FilterAsesor } from "@/components/feedback/asesor/FilterAsesor";
import { Table } from "@/components/feedback/Table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Empleado, HistFeedback } from "@/types/feedback/interfaces";
import { DownloadExcelButton } from "@/components/feedback/asesor/DownloadExcelButton";

const fetchAsesores = async (): Promise<Empleado[]> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/asesores`).then(r => r.json())
    return res
}

const fetchFeedbacksAsesores = async (
    asesor = "",
    filtroMes = "",
    tipoEvaluacion = "",
    userName = "",
    usuario: string = "",
    tipoEmpleado = "ASESOR",
): Promise<HistFeedback[]> => {
    const urlParams = new URLSearchParams()
    if (usuario !== "") urlParams.set("asesor", asesor)
    if (filtroMes !== "") urlParams.set("filtroMes", filtroMes)
    if (tipoEvaluacion !== "") urlParams.set("tipoEvaluacion", tipoEvaluacion.toUpperCase())
    urlParams.set("tipoEmpleado", tipoEmpleado)
    urlParams.set("usuario", usuario)
    if (userName !== "") urlParams.set("usrInsert", userName)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedbacks/asesor?${urlParams.toString()}`).then(r => r.json())
    return res
}

export default async function AsesoresPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const {
        asesor,
        filtroMes,
        tipoEvaluacion,
        userName,
        usuario
    } = (await searchParams)
    const asesores = await fetchAsesores()
    const feedbacks = await fetchFeedbacksAsesores(
        asesor,
        filtroMes,
        tipoEvaluacion,
        userName,
        usuario,
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
                    <DownloadExcelButton
                        feedbacks={feedbacks}
                    />
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
                defaultValues={{
                    asesor: asesor,
                    filtroMes: filtroMes,
                    tipoEvaluacion: tipoEvaluacion
                }}
            />

            {/* Tabla */}
            <Table>
                <AsesorHeaders />
                {
                    feedbacks.map((v) => (
                        <AsesorFila key={v.idFeedBack}
                            asesor={v.USUARIO}
                            idFeedback={v.idFeedBack}
                            estadoFeedback={v.estadoFeedBack}
                            periodo={v.periodo}
                            tipoEvaluacion={v.tipoEvaluacion!}
                        />
                    ))
                }
            </Table>
        </>
    );
}
