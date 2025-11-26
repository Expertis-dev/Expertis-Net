export type Empleado = {
    Id: number;
    usuario: string;
    idEmpleado: number | null;
    dni: string;
}

export interface Jefe extends Empleado {
    idJefe: number;
    area: string;
}

export type ArrayEmpleado = Empleado[];
export type ArrayJefe = Jefe[];
