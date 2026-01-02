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

// RESPUESTA DEL BACKEND - ASESORES

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

export interface ErrorResponse {
  error?: string;
}

// TIPOS PARA TABLAS - ASESORES

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

// TIPOS PARA GRUPOS

/**
 * Gestión detallada con información del supervisor
 */
export interface DetalleLlamadaGrupo extends GestionDetallada {
  supervisor?: string;
}

/**
 * Resumen por asesor dentro de un grupo
 */
export interface FilaResumenGrupo {
  asesor: string;
  total_clientes: number;
  total_gestionados: number;
  total_no_gestionados: number;
  porcentaje_gestion: number;
  contactos_efectivos?: number;
  no_contacto?: number;
  contacto_no_efectivo?: number;
  otros?: number;
  [key: string]: string | number | undefined;
}

/**
 * Respuesta del backend para vista de grupos
 */
export interface GrupoResponse extends Omit<ResponseData, 'nvl1' | 'gestiones_detalladas_por_asesor' | 'no_gestionados_por_asesor'> {
  supervisores?: string[];
  detalle_asesores_por_grupo?: Record<string, FilaResumenGrupo[]>;
  
  // Propiedades obligatorias para Excel y Modales
  gestiones_detalladas_por_asesor: Record<string, DetalleLlamadaGrupo[]>;
  no_gestionados_por_asesor: Record<string, ClienteNoGestionado[]>;
  
  // Redefinición de métricas NVL1 para grupos
  nvl1: ResponseData['nvl1'] & {
    conteo_total?: Record<string, number>;
    conteo_gestionados?: Record<string, number>;
    conteo_no_gestionados?: Record<string, number>;
    porcentaje_gestion?: Record<string, number>;
  };
}

/**
 * Filas para tablas de grupos - Nivel 1
 */
export interface FilaGrupoNvl1 {
  Nombre: string;
  "Total clientes": number;
  "Total gestionados": number;
  "Total no gestionados": number;
  "Porcentaje gestionados": string;
  "Contacto efectivo": number;
  "No contacto": number;
  "Contacto no efectivo": number;
  esGrupo?: number;
  esTotal?: number;
  [key: string]: string | number | undefined;
}

/**
 * Filas para tablas de grupos - Nivel 2
 */
export interface FilaGrupoNvl2 {
  Nombre: string;
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
  esGrupo?: number;
  esTotal?: number;
  [key: string]: string | number | undefined;
}

/**
 * Filas para tablas de grupos - Horas
 */
export interface FilaGrupoHoras {
  Nombre: string;
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
  esGrupo?: number;
  esTotal?: number;
  [key: string]: string | number | undefined;
}

// TIPOS COMPARTIDOS

/**
 * Tipo compatible con TablaDinamica
 */
export type FilaCompatible = Record<string, string | number>;

// PROPS DE COMPONENTES

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

export interface GruposTableProps {
  columnas: string[];
  datos?: FilaCompatible[];
  datosGlobales?: GrupoResponse | null;
  onRowClick?: (fila: FilaCompatible) => void;
  rowClassName?: string;
}

// TIPOS AUXILIARES

export type SortDirection = 'asc' | 'desc' | null;

export type VistaActiva = 'nvl1' | 'nvl2' | 'horas';