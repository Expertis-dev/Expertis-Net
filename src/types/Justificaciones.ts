// Example usage of the Justificaciones type
export type Justificaciones = {
    id: number;
    id_empleado: number;
    fecha: string;
    asesor: string;
    grupo: string;
    nivel1: string;
    nivel2: string;
    nivel3: string;
    observacion: string;
    descripcion: string;
    descuento: string;
    penalidad: string;
    minutos_permiso: number;
    user_create: string | null;
    user_update: string | null;
    fec_update: string | null;
    idJefe: string;
    idEmpleado: string;
    codigoEmpleado: string;
    id_grupo: number;
}
export type ArrayJustificaciones = Array<Justificaciones>;