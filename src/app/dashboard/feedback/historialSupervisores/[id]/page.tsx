import { FilterHistorialAsesor } from "@/components/feedback/historialAsesor/FilterHistorialAsesor";
import { HistorialAsesorFila } from "@/components/feedback/historialAsesor/HistorialAsesorFila";
import { HistorialHeaders } from "@/components/feedback/historialAsesor/HistorialAsesorHeaders";
import { Table } from "@/components/feedback/Table";
import Link from "next/link";


interface HistorialSupervisor {
    idFeedBack:          number;
    USUARIO:             string;
    periodo:             Date;
    estadoFeedBack:      string;
    analisisResultados:  string;
    compromisoMejora:    null;
    resultadoEvaluacion: string;
}

const fetchHistorialSupervisores = async (idEmpleado: number, filtroMes: string = ""): Promise<HistorialSupervisor[]> => {
    const urlParams = new URLSearchParams()
    filtroMes !== "" ? urlParams.set("filtroMes", filtroMes) : null
    const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/historialSupervisor/${idEmpleado}?${urlParams.toString()}`).then(r => r.json())
    return data
}



export default async function HistorialSupervisoresPage({params, searchParams}: {
    params: Promise<{id: number}>,
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const {
        filtroMes,
    } = await searchParams
    const {id: idEmpleado} = await params
    const data = await fetchHistorialSupervisores(idEmpleado, filtroMes)
    return (
        <>
            <h1 className="font-semibold text-[20px] pl-2 pb-1">Registros históricos</h1>
            <FilterHistorialAsesor 
                esSupervisor
            />


            <Table>
                <HistorialHeaders 
                    esSupervisor
                />
                {
                    data.map((v) => 
                        <HistorialAsesorFila 
                            key={v.idFeedBack}
                            estado={v.estadoFeedBack}
                            idFeedback={v.idFeedBack}
                            periodo={v.periodo}
                            esSupervisor
                        />
                    )
                }
            </Table>
        </>
    );
}
