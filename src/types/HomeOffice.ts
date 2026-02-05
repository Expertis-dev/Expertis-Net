export interface HomeOfficeResponse {
    sucess:  boolean;
    message: string;
    data:    Datum[];
}

export interface Datum {
    idEmpleado: number;
    nombre:     string;
    tiempos:    Tiempo[];
}

export interface Tiempo {
    fecha:       string;
    horaIngreso: null | string;
    horaSalida:  null | string;
}
