import { TableAlertaIncidencias } from "@/components/amonestaciones/alertaIncidencias/TableAlertaIncidencias";
import { CasosTable } from "@/components/amonestaciones/casos/CasosTable";

export interface Incidencia {
    fecha:                string;
    alias:                string;
    agencia:              Agencia;
    horaIngreso:          null | string;
    horaSalida:           null | string;
    esFalta:              number;
    esDiaLaborable:       number;
    esVacaciones:         number;
    esAusenciaLaborable:  number;
    tipoAusencia:         TipoAusencia | null;
    tipo:                 null | string;
    tipoSubsidio:         TipoSubsidio | null;
    tipoGoce:             null;
    hayJustificacion:     number;
    tipoJustificacion:    TipoJustificacion | null;
    minutos_permiso:      number;
    descuento:            number;
    fechaInicioGestion:   string;
    fechaFinGestion:      string | null;
    horario:              Horario;
    esTardanza:           number;
    minutosTardanza:      number;
    esUltimoSabadoDelMes: number;
}

export enum Agencia {
    Expertis = "EXPERTIS",
    ExpertisBpo = "EXPERTIS BPO",
}

export enum Horario {
    The7Am12Pm = "7am-12pm",
    The7Am5Pm = "7am-5pm",
    The8Am6Pm = "8am-6pm",
    The9Am1Pm = "9am-1pm",
}

export enum TipoAusencia {
    DescansoMedico = "DESCANSO MEDICO",
    Subsidio = "SUBSIDIO",
}

export enum TipoJustificacion {
    FaltaInjustificada = "FALTA_INJUSTIFICADA",
    FaltaJustificada = "FALTA_JUSTIFICADA",
    PermisoInjustificado = "PERMISO_INJUSTIFICADO",
    PermisoJustificado = "PERMISO_JUSTIFICADO",
    TardanzaJustificada = "TARDANZA_JUSTIFICADA",
}

export enum TipoSubsidio {
    Maternidad = "Maternidad",
}



export const getIncidenciasMes = async (): Promise<Incidencia[]> => {
    const now = new Date()
    const month = now.getMonth() + 1
    const apiBase = process.env.NEXT_PUBLIC_API_URL
    const url = `${apiBase}/api/reporteCruzado/${month}`

    try {
        const res = await fetch(url, { cache: "no-store" })
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
