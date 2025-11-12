// TIPOS BASE

export interface GestionDetallada {
  documento: string;
  cartera: string;
  fechaLlamada: string;
  hora: string;
  nvl1: string;
  nvl2: string;
  asesor: string;
}

export interface ClienteNoGestionado {
  documento: string;
  cartera: string;
}

export interface DetalleAsesor {
  gestionesDetalladas: GestionDetallada[];
  gestionesNoGestionadas: ClienteNoGestionado[];
}

// RESPUESTA DEL BACKEND

export interface ResponseData {
  asesores: string[];
  nvl1: {
    conteo_cliente_por_asesor: Record<string, number>;
    conteo_clientes_gestionados: Record<string, number>;
    conteo_clientes_no_gestionados: Record<string, number>;
    porcentaje_clientes_gestionados: Record<string, number>;
    "CONTACTO EFECTIVO": Record<string, number>;
    "NO CONTACTO": Record<string, number>;
    "CONTACTO NO EFECTIVO": Record<string, number>;
  };
  nvl2: Record<string, Record<string, number>>;
  horas: Record<string, Record<string, number>>;
  gestiones_detalladas_por_asesor: Record<string, GestionDetallada[]>;
  no_gestionados_por_asesor: Record<string, ClienteNoGestionado[]>;
  error?: string;
}

// Respuesta de error del backend
export interface ErrorResponse {
  error?: string;
}

// TIPOS PARA LAS TABLAS

export interface FilaNvl1 {
  Asesor: string;
  "Total clientes": number;
  "Total gestionados": number;
  "Total no gestionados": number;
  "Porcentaje gestionados": string;
  "Contacto efectivo": number;
  "No contacto": number;
  "Contacto no efectivo": number;
  [key: string]: string | number;
}

export interface FilaNvl2 {
  Asesor: string;
  VLL: number;
  CAN: number;
  PAR: number;
  PPC: number;
  PPM: number;
  REN: number;
  RPP: number;
  TAT: number;
  FAL: number;
  MCT: number;
  DES: number;
  GRB: number;
  HOM: number;
  ILC: number;
  NOC: number;
  NTT: number;
  [key: string]: string | number;
}

export interface FilaHoras {
  Asesor: string;
  "07:00": number;
  "08:00": number;
  "09:00": number;
  "10:00": number;
  "11:00": number;
  "12:00": number;
  "13:00": number;
  "14:00": number;
  "15:00": number;
  "16:00": number;
  "17:00": number;
  "18:00": number;
  "19:00": number;
  [key: string]: string | number;
}

// TIPOS PARA PROPS DE COMPONENTES

export interface BaseTableProps {
  columnas: string[];
  datos?: Record<string, string | number>[];
  datosGlobales?: ResponseData | null;
}

export interface DetailModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly detalle: DetalleAsesor | null;
}

// TIPOS AUXILIARES

export type SortDirection = 'asc' | 'desc' | null;

export type VistaActiva = 'nvl1' | 'nvl2' | 'horas';