export interface Empleado {
    alias: string;
    idEmpleado: number;
}

export interface HistFeedback {
    idFeedBack: string;
    USUARIO: string;
    tipoEvaluacion?: string;
    periodo: string;
    estadoFeedBack: string;
    resultadoEvaluacion: string
}