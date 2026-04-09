export interface ReporteAsistencia {
    fecha:                string;
    alias:                string;
    documento:            string;
    grupo:                string;
    agencia:              Agencia;
    horaIngreso:          null | string;
    horaSalida:           null | string;
    esFalta:              number;
    esDiaLaborable:       number;
    esVacaciones:         number;
    esAusenciaLaborable:  number;
    tipoAusencia:         null | string;
    tipo:                 null | string;
    tipoSubsidio:         null | string;
    tipoGoce:             null;
    hayJustificacion:     number;
    tipoJustificacion:    null | string;
    minutos_permiso:      number;
    descuento:            number;
    fechaInicioGestion:   string;
    fechaFinGestion:      null;
    horario:              string;
    esTardanza:           number;
    minutosTardanza:      number;
    esUltimoSabadoDelMes: number;
}

export enum Agencia {
    Expertis = "EXPERTIS",
    ExpertisBpo = "EXPERTIS BPO",
}
