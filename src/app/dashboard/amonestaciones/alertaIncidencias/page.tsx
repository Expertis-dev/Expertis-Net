import { TableAlertaIncidencias } from "@/components/amonestaciones/alertaIncidencias/TableAlertaIncidencias";
import { Incidencia } from "@/types/Incidencias";

const getIncidenciasMes = async (): Promise<Incidencia[]> => {
    const now = new Date()
    const month = now.getMonth() + 1
    const apiBase = process.env.NEXT_PUBLIC_API_URL
    const url = `${apiBase}/api/reporteCruzado/${month}`

    try {
        const res = await fetch(url)
        return await res.json()
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        throw new Error(`Error al hacer fetch de incidencias: ${message}`)
    }
}

export default async function AlertaIncidenciasPage() {
    const incidencias = await getIncidenciasMes()
    return (
        <div className="space-y-6">
            <TableAlertaIncidencias incidencias={incidencias.filter((j) => j.esFalta === 1 || j.esTardanza === 1)}/>
        </div>
    );
}
