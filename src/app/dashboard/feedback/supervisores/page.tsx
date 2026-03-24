import { AsesorHeaders } from "@/components/feedback/AsesorHeaders";
import { FiltersSupervisor } from "@/components/feedback/supervisor/FiltersSupervisor";
import { SupervisorFila } from "@/components/feedback/supervisor/SupervisorFila";
import { Table } from "@/components/feedback/Table";
import { Button } from "@/components/ui/button";
import { BrainIcon, SheetIcon } from "lucide-react";
import Link from "next/link";
import { Empleado, HistFeedback } from "@/types/feedback/interfaces";


const fetchSupervisores = async (): Promise<Array<Empleado>> => {
    const result = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/supervisores`).then(r => r.json())
    return result
}

const fetchFeedbacksSupervisores = async (
    usuario = "",
    filtroMes = "",
    estadoFeedback = "",
): Promise<Array<HistFeedback>> => {
    const urlParams = new URLSearchParams()
    usuario !== "" ? urlParams.set("usuario", usuario) : null
    filtroMes !== "" ? urlParams.set("filtroMes", filtroMes) : null
    urlParams.set("estadoFeedback", estadoFeedback)
    const fbSupervisores = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedbacks/supervisor?${urlParams.toString()}`).then(r => r.json())
    return fbSupervisores
}

export default async function SupervisoresPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const {
        usuario,
        filtroMes,
        estadoFeedback,
    } = await searchParams
    const supervisores = await fetchSupervisores()

    const feedbacks = await fetchFeedbacksSupervisores(
        usuario,
        filtroMes,
        estadoFeedback
    )

    return (
        <>
            <div className="flex flex-row justify-between mb-1">
                <div className="flex flex-col gap-1 text-gray-900">
                    <h1 className="text-2xl font-bold leading-tight text-zinc-800 dark:text-gray-300">
                        Feedbacks supervisores
                    </h1>
                    <h3 className="text-[13px] text-zinc-500 mt-[-4]">
                        Flujo maestro de firmas, análisis de resultados y validación operativa
                    </h3>
                </div>
                <div className="flex flex-auto justify-end">
                    <Button className="mr-2.5 bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-700 hover:bg-zinc-800 text-xs h-8 mt-3" >
                        <BrainIcon />
                        Generar Análisis de resultados
                    </Button>
                    <Button className="mr-2.5 bg-green-600 dark:text-gray-300 dark:hover:bg-green-900 hover:bg-green-500 text-xs h-8 mt-3" >
                        <SheetIcon className="text-gray-50" />
                        Exportar a Excel
                    </Button>
                    <Link
                        href={"/dashboard/feedback/supervisores/crear"}
                    >
                        <Button className="bg-blue-600 dark:text-gray-300 dark:hover:bg-blue-900 hover:bg-blue-500 text-xs h-8 mt-3">
                            <h2>+</h2>
                            <h2>Nueva Entrada</h2>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* //* CARDS */}
            {/* <div className="flex flex-row mb-2">
                <Card
                    title="Total evaluados"
                    unidad="Supervisores"
                    cantidad={12}
                    color={'gray'}
                />
                <Card
                    title="Listo para firmar"
                    unidad="Supervisores"
                    cantidad={20}
                    color="orange"
                />
                <Card
                    title="Cerrado"
                    unidad="feedbacks cerrados"
                    cantidad={20}
                    color="green"
                />
            </div> */}

            <FiltersSupervisor
                supervisores={supervisores}
            />

            <Table>
                <AsesorHeaders
                    esSupervisor
                />
                {
                    feedbacks.map((v) => (
                        <SupervisorFila
                            feedback={v}
                            key={v.idFeedBack}
                        />
                    ))
                }
            </Table>
        </>
    );
}
