export interface FetchNumeroSombrasRealizadas {
  id_acom:                   number;
  supervisor:                string;
  numeroDeSombrasRealizadas: number;
  numeroDeSombrasFaltantes:  number;
  agencia:                   string;
}


export interface FetchDetalleAcompanamiento {
  id_acom:   string;
  fecha:     string;
  registros: number;
  num_realizado: number;
  num_esperado: number;
  observacion: string;
  sombra:    Sombra[];
}

export interface Sombra {
  id_sombra:  number;
  name:       string;
  startTime:  string;
  endTime:    string;
  turno:      string;
  formulario: Formulario;
}

export interface Formulario {
  [key: string]: ResponseForm
}

export interface ResponseForm {
  check:    string;
  detalle?: string;
}

export interface LogDetail {
  id:         number;
  name:       string;
  startTime:  string;
  endTime:    string;
  turno:      string;
  status:     string;
  color:      string;
  formulario: Formulario;
  time?: string;
}

export interface MappedLogs {
  id:        string;
  date:      string;
  registros: number;
  color:     string;
  bgColor:   string;
  icon:      React.ReactNode;
  status:    string;
  observacion: string;
  details:   Detail[];
}

export interface Detail {
  id:         number;
  name:       string;
  startTime:  string;
  endTime:    string;
  turno:      string;
  status:     string;
  color:      string;
  formulario: Formulario;
}

export interface Props {
  className: string;
}

export interface FetchValidarAccesoTurno {
  permitido:         boolean;
  razon:             string;
  hora:              string;
  dia:               string;
  mensaje:           string;
  turnosDisponibles: TurnosDisponible[];
  turnoId?: number;
  turno: string,
  minutosRestantes: number;
  puedesLlenar: number,
}

export interface TurnosDisponible {
  id:     number;
  inicio: string;
  fin:    string;
  nombre: string;
}