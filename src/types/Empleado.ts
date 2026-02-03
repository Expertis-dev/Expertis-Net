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



export interface EmpleadoStaff {
    EMPLEADO:         string;
    CARGO:            string;
    idPuestoTrabajo:  number;
    idEmpleado:       number[];
    idCargo:          number[];
    mesInicio:        Date;
    mesFin:           null;
    estado:           Array<Estado | null>;
    fecInsert:        Array<Date | null>;
    fecUpdate:        null[];
    fecDelete:        null[];
    usrInsert:        Array<USRInsert | null>;
    usrUpdate:        null[];
    usrDelete:        null[];
    idArea:           Array<number | null>;
    idJefe:           number | null;
    idPersona:        number[];
    idTelefono:       number;
    idDireccion:      number;
    fecIngreso:       Date;
    grupo:            Grupo;
    estadoLaboral:    EstadoLaboral;
    modalidad:        Modalidad;
    fecInicioGestion: Date;
    fecRegistro:      Date;
    ingresoBruto:     number | null;
    impuestoRetenido: number | null;
    sumaGraciosa:     null;
    nombres:          string;
    apellidos:        string;
    alias:            string;
    documento:        string;
    fecNacimiento:    Date;
    lugarNacimiento:  null | string;
    sexo:             Sexo;
    estadoCivil:      EstadoCivil;
    nroHijos:         number | null;
    correo:           string;
    RUC:              null | string;
    nombreCompleto:   string;
    descripcion:      string;
    nombreArea:       NombreArea | null;
}

export enum Estado {
    I = "I",
}

export enum EstadoCivil {
    C = "C",
    Casado = "CASADO",
    Conviviente = "CONVIVIENTE",
    Divorciado = "DIVORCIADO",
    NoEspecificado = "NO ESPECIFICADO",
    S = "S",
    Soltero = "SOLTERO",
}

export enum EstadoLaboral {
    Vigente = "VIGENTE",
}

export enum Grupo {
    Asesor = "ASESOR",
    Staff = "STAFF",
}

export enum Modalidad {
    Presencial = "PRESENCIAL",
}

export enum NombreArea {
    Call = "CALL",
    Finanzas = "FINANZAS",
    GerenciaDeEstrategiaProyectosYConsultoria = "GERENCIA DE\nESTRATEGIA, PROYECTOS\nY CONSULTORIA",
    InnovacionYDesarrollo = "INNOVACION Y DESARROLLO",
    Judicial = "JUDICIAL",
    Operaciones = "OPERACIONES",
    Rrhh = "RRHH",
    Sistemas = "SISTEMAS",
}

export enum Sexo {
    Femenino = "FEMENINO",
    M = "M",
    Masculino = "MASCULINO",
}

export enum USRInsert {
    Admin = "ADMIN",
    AlesyMendivil = "ALESY MENDIVIL",
    LuisCastillo = "LUIS CASTILLO",
}
