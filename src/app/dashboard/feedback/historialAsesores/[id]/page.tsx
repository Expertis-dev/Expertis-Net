import { FilterHistorialAsesor } from "@/components/feedback/historialAsesor/FilterHistorialAsesor";
import { HistorialAsesorFila } from "@/components/feedback/historialAsesor/HistorialAsesorFila";
import { HistorialHeaders } from "@/components/feedback/historialAsesor/HistorialAsesorHeaders";
import { Table } from "@/components/feedback/Table";

interface HistorialAsesor {
    idFeedBack:          number;
    USUARIO:             string;
    periodo:             Date;
    estadoFeedBack:      string;
    analisisResultados:  null;
    resultadoEvaluacion: string;
}


const fetchHistorialAsesores = async (idEmpleado: number, filtroMes: string): Promise<HistorialAsesor[]> => {
    const searchParams = new URLSearchParams()
    if (!!filtroMes){
        searchParams.append("filtroMes", filtroMes)
    }
    const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/historialAsesor/${idEmpleado}?${searchParams.toString()}`).then((r) => r.json())
    return data
}

export default async function HistorialAsesoresPage({params, searchParams} : {
    params: Promise<{id: number}>, searchParams: Promise<{filtroMes: string}>
}) {
    const {filtroMes} = await searchParams
    const {id: idEmpleado} = await params
    const feedbacks = await fetchHistorialAsesores(idEmpleado, filtroMes)
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
                <HistorialHeaders />
                {
                    feedbacks.map(v => 
                        <HistorialAsesorFila 
                            key={v.idFeedBack}
                            estado={v.estadoFeedBack}
                            idFeedback={v.idFeedBack}
                            periodo={v.periodo}
                            tipoFeedback="asd"
                        />
                    )
                }
            </Table>
        </>
    );
}