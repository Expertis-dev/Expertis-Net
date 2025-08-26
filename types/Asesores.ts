export type Asesores = {
    grupo: string;
    id: number;
    id_cargo: number;
    id_grupo: number;
    dni: string;
    nombre: string;
    apellido1: string;
    apellido2: string;
    direccion: string;
    telefono: string;
    usuario: string;
    contrasenia: string | null;
    fec_ingreso: string;
    fec_cese: string | null;
    estado: number;
    fec_registro: string;
    user_create: string;
    idEmpleado: number | null;
    idArea: number | null;
    idJefe: number | null;
}
export type ArrayAsesores = Array<Asesores>