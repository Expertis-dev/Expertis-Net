"use client";

import { useState, useMemo, useEffect, useRef, useCallback, type ElementType } from 'react';
import { isAxiosError } from 'axios';
import { useCalidadDetalle, useFeedbackPdfUrl, useSubirFeedbackPdf } from '@/hooks/speech/useSpeechAnalytics';
import { useSpeechAccess } from '@/hooks/speech/useSpeechAccess';
import { useUser } from '@/Provider/UserProvider';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Eraser,
  FileText,
  Eye,
  Filter as FilterIcon,
  LineChart,
  List,
  Loader2,
  PhoneCall,
  Search,
  Star,
  User2,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { agruparPorAsesor, calcularKPIsGenerales, distribuirPorCuartiles } from "./utils/CalidadCalculos"
import type { SpeechCalidadDetalle } from "@/types/speech/analytics"
import type { CalidadAsesorAgrupado, CalidadRegistroAgrupable } from "./utils/CalidadCalculos"

type ColumnFilters = Record<string, string[] | undefined>
type ColumnSearch = Record<string, string>

interface PeriodoEvaluacion {
  desde?: string
  hasta?: string
}

interface FeedbackCalificaciones {
  apertura: number
  negociacion: number
  comunicacionefectiva: number
  cumplimientonormativo: number
  cierre: number
  actitud: number
  total: number
}

interface FeedbackMetadata {
  asesor: string
  supervisor: string
  agencia?: string | null
  quartil?: string
  periodo?: PeriodoEvaluacion
  totalAudios: number
  nroSemana?: number
  califs: FeedbackCalificaciones
  observacion: string
  fecha: string
  evolutivoLabels: string[]
  evolutivoValores: Array<number | null>
  evolutivoPromedio: number
}

interface BuildFeedbackPdfParams {
  metadata: FeedbackMetadata
  retroalimentacion: string
  sugerencia?: string
  compromiso?: string
  actitudes?: string[]
}

type CalidadRegistroNormalizado = CalidadRegistroAgrupable & {
  documento?: string | number | null
  cartera?: string | null
  fecha?: string | null
  fechaLlamada?: string | null
  agencia?: string | null
  supervisor?: string | null
  asesor?: string | null
  promedio?: number | string | null
  actitud?: number | string | null
  apertura?: number | string | null
  desarrollo?: number | string | null
  negociacion?: number | string | null
  comunicacionefectiva?: number | string | null
  cumplimientonormativo?: number | string | null
  cierre?: number | string | null
  calificaciontotal?: number | string | null
  observacionCalidad?: string | null
  grabacion?: string | null
  transcripcion?: string | null
  resumen?: string | null
  tipificacion?: string | null
  codmes?: string | number | null
  cantidad?: number
  cuartil?: string
  [key: string]: unknown
}

type VistaDato = CalidadRegistroNormalizado | CalidadAsesorAgrupado
type PdfWithAutoTable = jsPDF & { lastAutoTable?: { finalY: number } }

const LOGO_PATH = '/icono-logo.png';

const ACTITUDES_OPCIONES = [
  'Muestra disposición al cambio y mejora continua.',
  'Evita distracciones (uso de celular, conversaciones fuera de tema, etc.).',
  'Reconoce sus errores y plantea cómo corregirlos.',
  'Se compromete a aplicar inmediatamente lo aprendido.',
  'Participa activamente (pregunta, aporta ejemplos, comparte dudas).'
];

const toISODateString = (date: Date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseISODate = (value?: string | null) => {
  if (!value) return null;
  const [year, month = 1, day = 1] = value.split('-').map(Number);
  if (!year) return null;
  return new Date(year, (month || 1) - 1, day || 1);
};

const startOfISOWeek = (date: Date) => {
  const base = new Date(date);
  const day = (base.getDay() + 6) % 7;
  base.setDate(base.getDate() - day);
  base.setHours(0, 0, 0, 0);
  return base;
};

const getISOWeekNumber = (date: Date) => {
  if (!date) return 0;
  const tempDate = new Date(date.valueOf());
  const dayNumber = (tempDate.getDay() + 6) % 7;
  tempDate.setDate(tempDate.getDate() - dayNumber + 3);
  const firstThursday = new Date(tempDate.getFullYear(), 0, 4);
  const diff = tempDate.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
};

const getWeekRangeFromDate = (isoDate: string) => {
  const base = parseISODate(isoDate) || new Date();
  const monday = startOfISOWeek(base);
  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);
  return {
    desde: toISODateString(monday),
    hasta: toISODateString(friday)
  };
};

const promedioValores = (valores: (number | string)[]) => {
  const numeros = valores
    .map((valor) => Number(valor))
    .filter((valor) => Number.isFinite(valor));
  if (!numeros.length) return 0;
  return Number((numeros.reduce((acc, val) => acc + val, 0) / numeros.length).toFixed(1));
};

const calcularEvolutivoSemanal = (
  rows: CalidadRegistroNormalizado[],
  baseIso?: string | null,
  totalWeeks = 4
): { labels: string[]; valores: Array<number | null>; promedio: number } => {
  if (!rows.length || !baseIso) {
    return { labels: [], valores: [], promedio: 0 };
  }

  const baseDate = parseISODate(baseIso) || new Date();
  const baseYearMonth = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, '0')}`;
  const acumulado = new Map<number, { sum: number; count: number }>();

  rows
    .filter((row) => {
      const fechaRaw = typeof row.fecha === 'string' ? row.fecha : row.fechaLlamada;
      return typeof fechaRaw === 'string' && fechaRaw.startsWith(baseYearMonth);
    })
    .forEach((row) => {
      const fecha = typeof row.fecha === 'string' ? row.fecha : row.fechaLlamada;
      if (typeof fecha !== 'string') return;
      const fechaDate = parseISODate(fecha);
      if (!fechaDate) return;
      const week = getISOWeekNumber(fechaDate);
      const current = acumulado.get(week) || { sum: 0, count: 0 };
      const promedio = Number(row.promedio ?? row.calificacionCalidad ?? 0) || 0;
      current.sum += promedio;
      current.count += 1;
      acumulado.set(week, current);
    });

  const labels = [];
  const valores = [];
  for (let semana = 1; semana <= totalWeeks; semana += 1) {
    labels.push(`S${semana}`);
    const datosSemana = acumulado.get(semana);
    if (!datosSemana || datosSemana.count === 0) {
      valores.push(null);
    } else {
      valores.push(Number((datosSemana.sum / datosSemana.count).toFixed(1)));
    }
  }

  const valoresNumericos = valores.filter((valor) => typeof valor === 'number');
  const promedio =
    valoresNumericos.length > 0
      ? Number((valoresNumericos.reduce((acc, val) => acc + val, 0) / valoresNumericos.length).toFixed(1))
      : 0;

  return { labels, valores, promedio };
};

const safeFileName = (texto: string) => (texto ?? '').replace(/[^\w-]+/g, '_') || 'feedback';

const buildFeedbackFileName = (metadata?: { asesor?: string | null; fecha?: string | null }) => {
  if (!metadata) return 'feedback.pdf';
  const fechaPDF = metadata.fecha || toISODateString(new Date());
  return `feedback_${safeFileName(metadata.asesor || 'asesor')}_${fechaPDF}.pdf`;
};

const etiquetaFirmaPorCuartil = (quartil: string) =>
  String(quartil ?? '').toUpperCase() === 'Q1' ? 'Analista de formación' : 'Supervisor';

const getValue = <T = unknown>(obj: Record<string, unknown> | null | undefined, ...keys: string[]): T | undefined => {
  if (!obj) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value != null) {
        return value as T;
      }
    }
  }
  return undefined;
};

// const FILAS_POR_PAGINA = 10;

export const Calidad = () => {
  const { user } = useUser();
  const { alias: aliasActual, isAdmin: puedeUsarFiltrosAvanzados } = useSpeechAccess();

  // ============ ESTADOS PRINCIPALES ============
  const [modoVista, setModoVista] = useState('detalle'); // 'detalle' | 'general'

  // Búsqueda por fecha
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [fechaDesdeTemp, setFechaDesdeTemp] = useState('');
  const [fechaHastaTemp, setFechaHastaTemp] = useState('');

  // Filtros
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState('');
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState('');
  const [asesorSeleccionado, setAsesorSeleccionado] = useState('');

  // Filtros de tabla
  const [filtrosColumnas, setFiltrosColumnas] = useState<ColumnFilters>({});
  const [menuFiltroAbierto, setMenuFiltroAbierto] = useState<string | null>(null);
  const [busquedaFiltro, setBusquedaFiltro] = useState<ColumnSearch>({});
  const [paginaActual, setPaginaActual] = useState(1);

  // Ordenamiento
  const [ordenColumna, setOrdenColumna] = useState({ columna: '', direccion: 'asc' });
  const FILAS_POR_PAGINA = 10;

  // Modal
  const [modalFeedback, setModalFeedback] = useState(false);
  const [asesorSeleccionadoFeedback, setAsesorSeleccionadoFeedback] = useState<CalidadAsesorAgrupado | null>(null);
  const [feedbackTexto, setFeedbackTexto] = useState('');
  const [actitudesSeleccionadas, setActitudesSeleccionadas] = useState<string[]>([]);
  const [feedbackMetadata, setFeedbackMetadata] = useState<FeedbackMetadata | null>(null);
  const [feedbackSugerencia, setFeedbackSugerencia] = useState('');
  const [feedbackCompromiso, setFeedbackCompromiso] = useState('');
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [visualizandoPdf, setVisualizandoPdf] = useState<string | null>(null);
  const logoDataUrlRef = useRef<string | ArrayBuffer | null>(null);
  const loadLogo = useCallback(async (): Promise<string | ArrayBuffer | null> => {
    if (logoDataUrlRef.current) {
      return logoDataUrlRef.current;
    }
    try {
      const response = await fetch(LOGO_PATH);
      if (!response.ok) {
        throw new Error('No se pudo obtener el logo');
      }
      const blob = await response.blob();
      const dataUrl = await new Promise<string | ArrayBuffer | null>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      logoDataUrlRef.current = dataUrl;
      return dataUrl;
    } catch (error) {
      console.error('[Calidad] Error al cargar el logo para el PDF', error);
      return null;
    }
  }, []);
  const buildFeedbackPdf = useCallback(
    async ({ metadata, retroalimentacion, sugerencia, compromiso, actitudes }: BuildFeedbackPdfParams): Promise<{ doc: PdfWithAutoTable; nombre: string }> => {
      if (!metadata) {
        throw new Error('No hay información para generar el PDF');
      }

      const doc = new jsPDF({ unit: 'mm', format: 'a4' }) as PdfWithAutoTable;
      doc.setProperties({
        title: `Ficha de Retroalimentación - ${metadata.asesor ?? ''}`,
        subject: 'Gestión de Cobranzas',
        author: 'Calidad'
      });

      const logoDataUrl = await loadLogo();
      const margin = 15;
      const azul = { r: 0, g: 113, b: 164 };
      const pageWidth = doc.internal.pageSize.getWidth();
      const textWidth = pageWidth - margin * 2;

      const drawHeader = (): number => {
        const top = 10;
        const logoW = 26;
        const logoH = 26;
        const dataUrl = typeof logoDataUrl === 'string' ? logoDataUrl : null;
        if (dataUrl) {
          try {
            doc.addImage(dataUrl, 'PNG', margin, top, logoW, logoH, undefined, 'FAST');
          } catch (error) {
            console.warn('[Calidad] No fue posible insertar el logo en el PDF', error);
          }
        }
        doc.setTextColor(azul.r, azul.g, azul.b);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        const yCenter = top + logoH / 2;
        doc.text('Ficha de Retroalimentación – Gestión de Cobranzas', pageWidth / 2, yCenter, {
          align: 'center',
          baseline: 'middle'
        });
        const sepY = top + logoH + 6;
        doc.setDrawColor(azul.r, azul.g, azul.b);
        doc.setLineWidth(0.6);
        doc.line(margin, sepY, pageWidth - margin, sepY);
        return sepY;
      };

      const section = (titulo: string) => {
        doc.setTextColor(azul.r, azul.g, azul.b);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(titulo, margin, y);
        y += 6;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      };

      const paragraph = (texto: string | null | undefined, minHeight = 14) => {
        const contenido = (texto ?? '—').toString().trim() || '—';
        const lines = doc.splitTextToSize(contenido, textWidth);
        doc.text(lines, margin, y);
        y += Math.max(minHeight, lines.length * 5.2) + 2;
      };

      const drawCheck = (x: number, yBase: number, label: string, checked: boolean) => {
        const size = 3.8;
        doc.setDrawColor(0);
        doc.setLineWidth(0.2);
        doc.rect(x, yBase - 3, size, size);
        if (checked) {
          doc.setDrawColor(azul.r, azul.g, azul.b);
          doc.setLineWidth(0.6);
          doc.line(x + 0.7, yBase - 1, x + size / 2, yBase + 0.7);
          doc.line(x + size / 2, yBase + 0.7, x + size - 0.7, yBase - 2.2);
          doc.setDrawColor(0);
          doc.setLineWidth(0.2);
        }
        doc.text(label, x + size + 2, yBase);
      };

      const ensureSpace = (min = 18) => {
        const pageHeight = doc.internal.pageSize.getHeight();
        if (y + min > pageHeight - 15) {
          doc.addPage();
          y = 20;
        }
      };

      const sepY = drawHeader();
      let y = sepY + 6;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      const periodoTxt = `Periodo de evaluación: Del ${metadata.periodo?.desde ?? '—'} al ${metadata.periodo?.hasta ?? '—'}`;
      doc.text(periodoTxt, margin, y);
      y += 8;

      const fechaPDF = metadata.fecha || toISODateString(new Date());
      doc.text(`Nombre del asesor(a): ${metadata.asesor ?? '—'}`, margin, y);
      const fechaTexto = `Fecha: ${fechaPDF}`;
      doc.text(fechaTexto, pageWidth - margin - doc.getTextWidth(fechaTexto), y);
      y += 8;

      if (metadata.evolutivoValores?.length) {
        doc.setTextColor(azul.r, azul.g, azul.b);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Evolutivo (semanas):', margin, y);
        y += 6;

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const head = [...metadata.evolutivoLabels, 'Promedio'];
        const body = [[
          ...(metadata.evolutivoValores || []).map(valor => (typeof valor === 'number' ? `${valor}` : '')),
          `${metadata.evolutivoPromedio ?? 0}`
        ]];
        autoTable(doc, {
          startY: y,
          head: [head],
          body,
          theme: 'grid',
          margin: { left: margin, right: margin },
          styles: { fontSize: 9, cellPadding: 3, lineWidth: 0.1 },
          headStyles: { fillColor: [azul.r, azul.g, azul.b], textColor: 255 }
        });
        const ultimoAutoTable = doc.lastAutoTable;
        y = (ultimoAutoTable?.finalY ?? y) + 10;
      }

      autoTable(doc, {
        startY: y,
        head: [['Criterio', 'Promedio']],
        body: [
          ['Apertura', `${metadata.califs.apertura ?? 0}`],
          ['Negociación', `${metadata.califs.negociacion ?? 0}`],
          ['Comunicación efectiva', `${metadata.califs.comunicacionefectiva ?? 0}`],
          ['Cumplimiento normativo', `${metadata.califs.cumplimientonormativo ?? 0}`],
          ['Cierre', `${metadata.califs.cierre ?? 0}`],
          ['Actitud', `${metadata.califs.actitud ?? 0}`],
          ['Promedio total', `${metadata.califs.total ?? 0}`]
        ],
        theme: 'grid',
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 3, lineWidth: 0.1 },
        headStyles: { fillColor: [azul.r, azul.g, azul.b], textColor: 255 }
      });
      const ultimoCriterio = doc.lastAutoTable;
      y = (ultimoCriterio?.finalY ?? y) + 10;

      ensureSpace();
      section('Retroalimentación brindada:');
      paragraph(retroalimentacion || metadata.observacion || '—', 18);

      ensureSpace();
      section('Sugerencia principal de mejora:');
      paragraph(sugerencia || '—', 16);

      ensureSpace();
      doc.setTextColor(azul.r, azul.g, azul.b);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Aspectos de actitud y mejora continua:', margin, y);
      y += 6;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      const seleccionados = new Set(actitudes ?? []);
      ACTITUDES_OPCIONES.forEach(item => {
        ensureSpace(10);
        drawCheck(margin, y, item, seleccionados.has(item));
        y += 6.5;
      });

      ensureSpace();
      doc.setTextColor(azul.r, azul.g, azul.b);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Compromiso del asesor:', margin, y);
      y += 6;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      const compromisoTexto = (compromiso ?? '').trim();
      if (compromisoTexto) {
        const lines = doc.splitTextToSize(compromisoTexto, textWidth);
        doc.text(lines, margin, y);
        y += Math.max(18, lines.length * 5.2) + 4;
      } else {
        const underline = '_______________________________________________';
        const lineGap = 7;
        for (let i = 0; i < 3; i += 1) {
          doc.text(underline, margin, y);
          y += lineGap;
        }
        y += 4;
      }

      const firmaWidth = 70;
      const preTop = 14;
      const bottomMargin = 18;
      const gapLabel = 9;
      const x1 = margin;
      const x2 = pageWidth - margin - firmaWidth;
      const ensureSpaceFor = (need: number) => {
        const pageHeight = doc.internal.pageSize.getHeight();
        if (y + need > pageHeight - bottomMargin) {
          doc.addPage();
          y = 25;
        }
      };

      y += preTop;
      ensureSpaceFor(26);
      doc.setTextColor(azul.r, azul.g, azul.b);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Firmas:', margin, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      y += 8;

      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      const yLine = y + 8;
      doc.line(x1, yLine, x1 + firmaWidth, yLine);
      doc.line(x2, yLine, x2 + firmaWidth, yLine);
      doc.text(etiquetaFirmaPorCuartil(metadata.quartil ?? ''), x1 + firmaWidth / 2, yLine + gapLabel, {
        align: 'center'
      });
      doc.text('Asesor', x2 + firmaWidth / 2, yLine + gapLabel, { align: 'center' });

      const nombre = buildFeedbackFileName({ asesor: metadata.asesor, fecha: fechaPDF });
      return { doc, nombre };
    },
    [loadLogo]
  );
  // Cargar datos
const { data: dataCalidad, isLoading, error } = useCalidadDetalle({
  desde: fechaDesde,
  hasta: fechaHasta
});
const subirFeedbackPdfMutation = useSubirFeedbackPdf();
const feedbackPdfUrlMutation = useFeedbackPdfUrl();

  // ============ DATOS PROCESADOS ============
  const datosCompletos = useMemo<CalidadRegistroNormalizado[]>(() => {
    if (!dataCalidad || !Array.isArray(dataCalidad)) return [];

    return dataCalidad.map<CalidadRegistroNormalizado>((item: SpeechCalidadDetalle) => ({
      documento: getValue<string | number | null>(item, 'idGestion', 'IdGestion') ?? null,
      cartera: getValue<string | null>(item, 'cartera', 'Cartera') ?? null,
      fecha: getValue<string | null>(item, 'fechaLlamada', 'FechaLlamada', 'fecha', 'Fecha') ?? null,
      fechaLlamada: getValue<string | null>(item, 'fechaLlamada', 'FechaLlamada') ?? null,
      asesor: getValue<string | null>(item, 'asesor', 'Asesor') ?? null,
      agencia: getValue<string | null>(item, 'agencia', 'Agencia') ?? null,
      supervisor: getValue<string | null>(item, 'supervisor', 'Supervisor') ?? null,
      promedio: getValue<number | string | null>(item, 'calificacionCalidad', 'calificacion_calidad') ?? null,
      actitud: getValue<number | string | null>(item, 'calificacionActitud', 'calificacion_actitud') ?? null,
      apertura: getValue<number | string | null>(item, 'calificacionApertura', 'calificacion_apertura') ?? null,
      desarrollo: getValue<number | string | null>(item, 'calificacionNegociacion', 'calificacion_negociacion') ?? null,
      negociacion: getValue<number | string | null>(item, 'calificacionNegociacion', 'calificacion_negociacion') ?? null,
      comunicacionefectiva: getValue<number | string | null>(
        item,
        'calificacionComunicacionefectiva',
        'calificacion_comunicacionefectiva'
      ) ?? null,
      cumplimientonormativo: getValue<number | string | null>(
        item,
        'calificacionCumplimientoNormativo',
        'calificacion_cumplimiento_normativo'
      ) ?? null,
      cierre: getValue<number | string | null>(item, 'calificacionCierre', 'calificacion_cierre') ?? null,
      calificaciontotal: getValue<number | string | null>(item, 'calificacionCalidad', 'calificacion_calidad') ?? null,
      observacionCalidad: getValue<string | null>(item, 'observacionCalidad', 'observacion_calidad') ?? null,
      grabacion: getValue<string | null>(item, 'grabacion', 'rutGrabacion') ?? null,
      transcripcion: getValue<string | null>(item, 'transcripcion', 'Transcripcion') ?? null,
      resumen: getValue<string | null>(item, 'resumen', 'Resumen') ?? null,
      tipificacion: getValue<string | null>(item, 'tipificacion', 'Tipificacion', 'indLlamada') ?? null,
      codmes: getValue<string | number | null>(item, 'codmes', 'CodMes') ?? null,
    }));
  }, [dataCalidad]);

  // Opciones de filtros
  const agenciasUnicas = useMemo(() => {
    const agencias = datosCompletos
      .map((item) => item.agencia)
      .filter((value): value is string => typeof value === 'string' && value.length > 0);
    return [...new Set(agencias)].sort();
  }, [datosCompletos]);

  const supervisoresUnicos = useMemo(() => {
    let datos = datosCompletos;
    if (agenciaSeleccionada) {
      datos = datos.filter((item) => item.agencia === agenciaSeleccionada);
    }
    const supervisores = datos
      .map((item) => item.supervisor)
      .filter((value): value is string => typeof value === 'string' && value.length > 0);
    return [...new Set(supervisores)].sort();
  }, [datosCompletos, agenciaSeleccionada]);

  const asesoresUnicos = useMemo(() => {
    let datos = datosCompletos;
    if (agenciaSeleccionada) {
      datos = datos.filter((item) => item.agencia === agenciaSeleccionada);
    }
    if (supervisorSeleccionado) {
      datos = datos.filter((item) => item.supervisor === supervisorSeleccionado);
    }
    const asesores = datos
      .map((item) => item.asesor)
      .filter((value): value is string => typeof value === 'string' && value.length > 0);
    return [...new Set(asesores)].sort();
  }, [datosCompletos, agenciaSeleccionada, supervisorSeleccionado]);

  // Resetear filtros dependientes
  useEffect(() => {
    if (!puedeUsarFiltrosAvanzados) {
      return;
    }
    setSupervisorSeleccionado('');
    setAsesorSeleccionado('');
  }, [agenciaSeleccionada, puedeUsarFiltrosAvanzados]);

  useEffect(() => {
    if (!puedeUsarFiltrosAvanzados) {
      return;
    }
    setAsesorSeleccionado('');
  }, [supervisorSeleccionado, puedeUsarFiltrosAvanzados]);

  useEffect(() => {
    if (puedeUsarFiltrosAvanzados) {
      return;
    }
    setAgenciaSeleccionada('EXPERTIS');
    setSupervisorSeleccionado(aliasActual ?? '');
    setAsesorSeleccionado('');
    setFiltrosColumnas({});
    setBusquedaFiltro({});
    setMenuFiltroAbierto(null);
  }, [puedeUsarFiltrosAvanzados, aliasActual]);

  // Aplicar filtros principales
  const datosFiltradosPrincipales = useMemo(() => {
    let datos = [...datosCompletos];

    if (puedeUsarFiltrosAvanzados && agenciaSeleccionada) {
      datos = datos.filter(item => item.agencia === agenciaSeleccionada);
    }
    if (puedeUsarFiltrosAvanzados && supervisorSeleccionado) {
      datos = datos.filter(item => item.supervisor === supervisorSeleccionado);
    }
    if (puedeUsarFiltrosAvanzados && asesorSeleccionado) {
      datos = datos.filter(item => item.asesor === asesorSeleccionado);
    }

    return datos;
  }, [datosCompletos, agenciaSeleccionada, supervisorSeleccionado, asesorSeleccionado, puedeUsarFiltrosAvanzados]);

  const buildFeedbackPayload = useCallback(
    (asesor: CalidadAsesorAgrupado | null): FeedbackMetadata | null => {
      if (!asesor) return null;
      const rows = datosFiltradosPrincipales.filter((item) => item.asesor === asesor.asesor);
      if (!rows.length) {
        return {
          asesor: asesor.asesor,
          supervisor: asesor.supervisor,
          agencia: asesor.agencia,
          quartil: asesor.cuartil,
          periodo: getWeekRangeFromDate(fechaDesde || toISODateString(new Date())),
          nroSemana: undefined,
          totalAudios: 0,
          califs: {
            apertura: 0,
            negociacion: 0,
            comunicacionefectiva: 0,
            cumplimientonormativo: 0,
            cierre: 0,
            actitud: 0,
            total: 0,
          },
          observacion: '',
          fecha: toISODateString(new Date()),
          evolutivoLabels: [],
          evolutivoValores: [],
          evolutivoPromedio: 0,
        };
      }

      const periodoRef = fechaDesde || rows[0]?.fecha || toISODateString(new Date());
      const evolutivo = calcularEvolutivoSemanal(rows, fechaDesde || rows[0]?.fecha);
      const observacion = rows.find((row) => row.observacionCalidad)?.observacionCalidad || '';
      const fechaSemana = rows[0]?.fecha ? parseISODate(rows[0]?.fecha) : null;

      return {
        asesor: asesor.asesor,
        supervisor: asesor.supervisor,
        agencia: asesor.agencia,
        quartil: asesor.cuartil,
        periodo: getWeekRangeFromDate(periodoRef),
        totalAudios: rows.length,
        nroSemana: fechaSemana ? getISOWeekNumber(fechaSemana) : undefined,
        califs: {
          apertura: promedioValores(rows.map((row) => row.apertura ?? 0)),
          negociacion: promedioValores(rows.map((row) => row.negociacion ?? row.desarrollo ?? 0)),
          comunicacionefectiva: promedioValores(rows.map((row) => row.comunicacionefectiva ?? 0)),
          cumplimientonormativo: promedioValores(rows.map((row) => row.cumplimientonormativo ?? 0)),
          cierre: promedioValores(rows.map((row) => row.cierre ?? 0)),
          actitud: promedioValores(rows.map((row) => row.actitud ?? 0)),
          total: promedioValores(rows.map((row) => row.promedio ?? 0)),
        },
        observacion,
        fecha: toISODateString(new Date()),
        evolutivoLabels: evolutivo.labels,
        evolutivoValores: evolutivo.valores,
        evolutivoPromedio: evolutivo.promedio,
      };
    },
    [datosFiltradosPrincipales, fechaDesde]
  );

  useEffect(() => {
    if (modalFeedback && asesorSeleccionadoFeedback) {
      setFeedbackMetadata(buildFeedbackPayload(asesorSeleccionadoFeedback));
    }
  }, [modalFeedback, asesorSeleccionadoFeedback, buildFeedbackPayload]);

  // Vista detalle o general
  const datosVista = useMemo<VistaDato[]>(() => {
    if (modoVista === 'detalle') {
      return datosFiltradosPrincipales;
    } else {
      return agruparPorAsesor(datosFiltradosPrincipales);
    }
  }, [modoVista, datosFiltradosPrincipales]);

  // Aplicar filtros de columnas
  const datosFiltradosColumnas = useMemo(() => {
    let datos = [...datosVista];

    if (puedeUsarFiltrosAvanzados) {
      Object.entries(filtrosColumnas).forEach(([columna, valores]) => {
        if (Array.isArray(valores) && valores.length > 0) {
          datos = datos.filter((item) => {
            const valor = (item as Record<string, unknown>)[columna];
            return valores.includes(String(valor ?? ''));
          });
        }
      });
    }

    return datos;
  }, [datosVista, filtrosColumnas, puedeUsarFiltrosAvanzados]);

  // Aplicar ordenamiento
  const filtrosColumnasKey = useMemo(() => JSON.stringify(filtrosColumnas), [filtrosColumnas]);

  const datosOrdenados = useMemo(() => {
    if (!ordenColumna.columna) return datosFiltradosColumnas;

    return [...datosFiltradosColumnas].sort((a, b) => {
      const valorA = (a as Record<string, unknown>)[ordenColumna.columna] as unknown;
      const valorB = (b as Record<string, unknown>)[ordenColumna.columna] as unknown;

      if (valorA == null) return 1;
      if (valorB == null) return -1;

      const comparacion = valorA < valorB ? -1 : valorA > valorB ? 1 : 0;
      return ordenColumna.direccion === 'asc' ? comparacion : -comparacion;
    });
  }, [datosFiltradosColumnas, ordenColumna]);

  const filasPorPaginaActivas = FILAS_POR_PAGINA;

  const totalPaginas = Math.max(1, Math.ceil(datosOrdenados.length / filasPorPaginaActivas));

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * filasPorPaginaActivas;
    return datosOrdenados.slice(inicio, inicio + filasPorPaginaActivas);
  }, [datosOrdenados, paginaActual, filasPorPaginaActivas]);

  useEffect(() => {
    setPaginaActual(1);
  }, [
    modoVista,
    agenciaSeleccionada,
    supervisorSeleccionado,
    asesorSeleccionado,
    fechaDesde,
    fechaHasta,
    filtrosColumnasKey,
    filasPorPaginaActivas
  ]);

  useEffect(() => {
    setPaginaActual(prev => Math.min(prev, totalPaginas));
  }, [totalPaginas]);

  const filtrosInteractivosActivos =
    puedeUsarFiltrosAvanzados &&
    (
      Boolean(agenciaSeleccionada) ||
      Boolean(supervisorSeleccionado) ||
      Boolean(asesorSeleccionado) ||
      Object.keys(filtrosColumnas).length > 0
    );

  const hayFiltrosActivos = Boolean(
    fechaDesde || fechaHasta || fechaDesdeTemp || fechaHastaTemp
  ) || filtrosInteractivosActivos;

  // KPIs generales
  const kpis = useMemo(() => 
    calcularKPIsGenerales(datosFiltradosPrincipales),
    [datosFiltradosPrincipales]
  );

  // Cuartiles
  const cuartiles = useMemo(() => {
    if (modoVista !== 'general') {
      return distribuirPorCuartiles([]);
    }
    return distribuirPorCuartiles(datosVista as CalidadAsesorAgrupado[]);
  }, [modoVista, datosVista]);

  // ============ HANDLERS ============
  const handleBuscar = () => {
    if (!fechaDesdeTemp || !fechaHastaTemp) {
      toast.error('Por favor, selecciona ambas fechas');
      return;
    }

    if (new Date(fechaDesdeTemp) > new Date(fechaHastaTemp)) {
      toast.error('La fecha desde no puede ser mayor que la fecha hasta');
      return;
    }

    setFechaDesde(fechaDesdeTemp);
    setFechaHasta(fechaHastaTemp);
  };

  const handleLimpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    setFechaDesdeTemp('');
    setFechaHastaTemp('');
    setAgenciaSeleccionada('');
    setSupervisorSeleccionado('');
    setAsesorSeleccionado('');
    setFiltrosColumnas({});
    setOrdenColumna({ columna: '', direccion: 'asc' });
  };

  const handleOrden = (columna: string) => {
    setOrdenColumna(prev => ({
      columna,
      direccion: prev.columna === columna && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };

  const irPaginaAnterior = () => {
    setPaginaActual(prev => Math.max(prev - 1, 1));
  };

  const irPaginaSiguiente = () => {
    setPaginaActual(prev => Math.min(prev + 1, totalPaginas));
  };

  const obtenerValoresUnicos = (columna: string) => {
    const valores = datosVista
      .map((item) => {
        const valor = (item as Record<string, unknown>)[columna];
        return valor != null ? String(valor) : '';
      })
      .filter((valor) => valor.length > 0);
    const unicos = [...new Set(valores)].sort();

    const busqueda = busquedaFiltro[columna]?.toLowerCase() || '';
    if (busqueda) {
      return unicos.filter((val) => val.toLowerCase().includes(busqueda));
    }
    return unicos;
  };

  const handleFiltroColumnaChange = (columna: string, valor: string) => {
    if (!puedeUsarFiltrosAvanzados) {
      return;
    }
    setFiltrosColumnas(prev => {
      const valoresActuales = prev[columna] || [];
      const nuevosValores = valoresActuales.includes(valor)
        ? valoresActuales.filter(v => v !== valor)
        : [...valoresActuales, valor];

      return {
        ...prev,
        [columna]: nuevosValores.length > 0 ? nuevosValores : undefined
      };
    });
  };

  const seleccionarTodosFiltro = (columna: string) => {
    if (!puedeUsarFiltrosAvanzados) {
      return;
    }
    const todosValores = obtenerValoresUnicos(columna);
    setFiltrosColumnas(prev => ({
      ...prev,
      [columna]: todosValores
    }));
  };

  const limpiarFiltroColumna = (columna: string) => {
    if (!puedeUsarFiltrosAvanzados) {
      return;
    }
    setFiltrosColumnas(prev => {
      const nuevo = { ...prev };
      delete nuevo[columna];
      return nuevo;
    });
  };

  // Exportar Excel
  const exportarExcel = () => {
    if (datosOrdenados.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const datosExcel = datosOrdenados.map((item) => {
      if (modoVista === 'detalle') {
        const detalle = item as CalidadRegistroNormalizado;
        return {
          Documento: detalle.documento ?? '',
          Cartera: detalle.cartera ?? '',
          Fecha: detalle.fecha ?? '',
          Asesor: detalle.asesor ?? '',
          Agencia: detalle.agencia ?? '',
          Supervisor: detalle.supervisor ?? '',
          Promedio: detalle.promedio ?? '',
          Actitud: detalle.actitud ?? '',
          Apertura: detalle.apertura ?? '',
          Desarrollo: detalle.desarrollo ?? '',
          Cierre: detalle.cierre ?? '',
        };
      }
      const general = item as CalidadAsesorAgrupado;
      return {
        Asesor: general.asesor ?? '',
        Agencia: general.agencia ?? '',
        Supervisor: general.supervisor ?? '',
        Cantidad: general.cantidad ?? '',
        Promedio: general.promedio ?? '',
        Cuartil: general.cuartil ?? '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Calidad');

    const nombreArchivo = `Calidad_${modoVista}_${fechaDesde || 'todos'}.xlsx`;
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    saveAs(blob, nombreArchivo);
  };

  // Modal feedback
  const abrirModalFeedback = (asesor: CalidadAsesorAgrupado | null) => {
    if (!asesor) return;
    const mismaPersona = feedbackMetadata?.asesor === asesor.asesor;
    setAsesorSeleccionadoFeedback(asesor);
    const metadata = buildFeedbackPayload(asesor);
    setFeedbackMetadata(metadata);
    if (!mismaPersona) {
      setFeedbackTexto(metadata?.observacion ?? '');
      setActitudesSeleccionadas([]);
      setFeedbackSugerencia('');
      setFeedbackCompromiso('');
    }
    setModalFeedback(true);
  };

  const cerrarModalFeedback = () => {
    setModalFeedback(false);
    setAsesorSeleccionadoFeedback(null);
    setFeedbackTexto('');
    setActitudesSeleccionadas([]);
    setFeedbackMetadata(null);
    setFeedbackSugerencia('');
    setFeedbackCompromiso('');
    setGenerandoPdf(false);
  };

  const handleActitudChange = (actitud: string) => {
    setActitudesSeleccionadas((prev) =>
      prev.includes(actitud) ? prev.filter((a) => a !== actitud) : [...prev, actitud]
    );
  };

  const requestFeedbackPdfUrl = useCallback(
    async (metadata: FeedbackMetadata | null) => {
      if (!metadata?.asesor || !metadata?.supervisor) {
        toast.error('No hay información suficiente para abrir el PDF.');
        return null;
      }
      const nombreArchivo = buildFeedbackFileName(metadata);
      try {
        const response = await feedbackPdfUrlMutation.mutateAsync({
          supervisor: metadata.supervisor,
          asesor: metadata.asesor,
          nombreArchivo
        });
        if (response?.url) {
          window.open(response.url, '_blank', 'noopener,noreferrer');
          return response.url;
        }
        toast.error('No se pudo obtener el enlace del PDF.');
        return null;
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 404) {
          toast.error('No existe un PDF para este asesor. Genera uno primero.');
          return null;
        }
        console.error('[Calidad] Error al obtener URL del PDF', err);
        toast.error('No se pudo abrir el PDF. Intenta nuevamente.');
        return null;
      }
    },
    [feedbackPdfUrlMutation]
  );

  const handleVisualizarPdf = useCallback(
    async (asesor: CalidadAsesorAgrupado | null) => {
      if (!asesor) {
        toast.error('Selecciona un asesor para ver el PDF.');
        return;
      }
      const key = asesor.asesor || '__DESCONOCIDO__';
      setVisualizandoPdf(key);
      try {
        const metadata = buildFeedbackPayload(asesor);
        if (!metadata) {
          toast.error('No hay datos suficientes para generar el PDF.');
          return;
        }
        await requestFeedbackPdfUrl(metadata);
      } finally {
        setVisualizandoPdf(null);
      }
    },
    [buildFeedbackPayload, requestFeedbackPdfUrl]
  );

  const generarPDF = async () => {
    if (!asesorSeleccionadoFeedback || !feedbackTexto.trim()) {
      toast.error('Por favor, completa el feedback antes de generar el PDF');
      return;
    }
    if (!feedbackMetadata) {
      toast.error('No hay datos suficientes para generar el PDF');
      return;
    }
    if (!feedbackMetadata.asesor || !feedbackMetadata.supervisor) {
      toast.error('No se pudo determinar el asesor o supervisor para el PDF');
      return;
    }

    setGenerandoPdf(true);
    try {
      const { doc, nombre } = await buildFeedbackPdf({
        metadata: feedbackMetadata,
        retroalimentacion: feedbackTexto,
        sugerencia: feedbackSugerencia,
        compromiso: feedbackCompromiso,
        actitudes: actitudesSeleccionadas
      });

      const arrayBuffer = doc.output('arraybuffer');
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const archivo = new File([blob], nombre, { type: 'application/pdf' });
      const supervisor = feedbackMetadata.supervisor || user?.usuario || 'DESCONOCIDO';
      const fechaCarpeta = toISODateString(new Date());
      await subirFeedbackPdfMutation.mutateAsync({
        supervisor,
        asesor: feedbackMetadata.asesor,
        fechaCarpeta,
        nombreArchivo: nombre,
        archivo
      });
      await requestFeedbackPdfUrl(feedbackMetadata);
      toast.success('Feedback generado y almacenado correctamente.');
      cerrarModalFeedback();
    } catch (error) {
      console.error('[Calidad] Error al generar el PDF', error);
      toast.error('Ocurrió un error al generar el PDF. Intenta nuevamente.');
    } finally {
      setGenerandoPdf(false);
    }
  };

  // Columnas según vista
  const columnasDetalle = [
    { id: 'documento', label: 'Documento', filtrable: true },
    { id: 'cartera', label: 'Cartera', filtrable: true },
    { id: 'fecha', label: 'Fecha', filtrable: false },
    { id: 'asesor', label: 'Asesor', filtrable: true },
    { id: 'agencia', label: 'Agencia', filtrable: true },
    { id: 'supervisor', label: 'Supervisor', filtrable: true },
    { id: 'promedio', label: 'Promedio', filtrable: false },
    { id: 'actitud', label: 'Actitud', filtrable: false },
    { id: 'apertura', label: 'Apertura', filtrable: false },
    { id: 'desarrollo', label: 'Desarrollo', filtrable: false },
    { id: 'cierre', label: 'Cierre', filtrable: false }
  ];

  const columnasGeneral = [
    { id: 'asesor', label: 'Asesor', filtrable: true },
    { id: 'agencia', label: 'Agencia', filtrable: true },
    { id: 'supervisor', label: 'Supervisor', filtrable: true },
    { id: 'cantidad', label: 'Cantidad', filtrable: false },
    { id: 'promedio', label: 'Promedio', filtrable: false },
    { id: 'cuartil', label: 'Cuartil', filtrable: true },
    { id: 'acciones', label: 'Acciones', filtrable: false }
  ];

  const columnas = modoVista === 'detalle' ? columnasDetalle : columnasGeneral;

  const quartilBadgeStyles: Record<string, string> = {
    q1: "border-rose-200 bg-rose-50 text-rose-700",
    q2: "border-amber-200 bg-amber-50 text-amber-700",
    q3: "border-sky-200 bg-sky-50 text-sky-700",
    q4: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  const EstadoCard = ({
    icon: Icon,
    title,
    description,
  }: {
    icon: ElementType
    title: string
    description: string
  }) => (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
        <Icon className="h-10 w-10 text-primary" />
        <div className="space-y-1">
          <p className="text-lg font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Ocurrió un error al obtener la informaciÇün de calidad.';

  return (
    <div className="space-y-6" data-calidad-content>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Speech Analytics</p>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight">Calidad</h1>
        <p className="text-muted-foreground">
          Analiza la calidad de la gestión del asesor.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4" data-calidad-filtros>
          <div className="flex items-end gap-3 overflow-x-auto pb-2">
            <div className="space-y-2">
              <Label htmlFor="fechaDesde">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Fecha desde
                </span>
              </Label>
              <Input
                id="fechaDesde"
                type="date"
                value={fechaDesdeTemp}
                onChange={(event) => setFechaDesdeTemp(event.target.value)}
                className="w-[150px]"
              />
            </div>

            <div className="space-y-2 mr-6">
              <Label htmlFor="fechaHasta">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Fecha hasta
                </span>
              </Label>
              <Input
                id="fechaHasta"
                type="date"
                value={fechaHastaTemp}
                onChange={(event) => setFechaHastaTemp(event.target.value)}
                className="w-[150px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agencia">
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Agencia
                </span>
              </Label>
              <Select
                value={agenciaSeleccionada || "all"}
                onValueChange={(value) => setAgenciaSeleccionada(value === "all" ? "" : value)}
                disabled={!puedeUsarFiltrosAvanzados || datosCompletos.length === 0}
              >
                <SelectTrigger id="agencia" className="w-[210px]">
                  <SelectValue placeholder="Todas las agencias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las agencias</SelectItem>
                  {agenciasUnicas.map((agencia) => (
                    <SelectItem key={agencia} value={agencia}>
                      {agencia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supervisor">
                <span className="flex items-center gap-2">
                  <User2 className="h-4 w-4 text-primary" />
                  Supervisor
                </span>
              </Label>
              <Select
                value={supervisorSeleccionado || "all"}
                onValueChange={(value) => setSupervisorSeleccionado(value === "all" ? "" : value)}
                disabled={
                  !puedeUsarFiltrosAvanzados || !agenciaSeleccionada || supervisoresUnicos.length === 0
                }
              >
                <SelectTrigger id="supervisor" className="w-[210px]">
                  <SelectValue placeholder="Todos los supervisores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los supervisores</SelectItem>
                  {supervisoresUnicos.map((supervisor) => (
                    <SelectItem key={supervisor} value={supervisor}>
                      {supervisor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asesor">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Asesor
                </span>
              </Label>
              <Select
                value={asesorSeleccionado || "all"}
                onValueChange={(value) => setAsesorSeleccionado(value === "all" ? "" : value)}
                disabled={
                  !puedeUsarFiltrosAvanzados || !supervisorSeleccionado || asesoresUnicos.length === 0
                }
              >
                <SelectTrigger id="asesor" className="w-[210px]">
                  <SelectValue placeholder="Todos los asesores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los asesores</SelectItem>
                  {asesoresUnicos.map((asesor) => (
                    <SelectItem key={asesor} value={asesor}>
                      {asesor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex items-center gap-2" data-calidad-acciones>
              <Button
                onClick={handleBuscar}
                disabled={!fechaDesdeTemp || !fechaHastaTemp || isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Buscar
              </Button>
              <Button
                variant="outline"
                onClick={handleLimpiarFiltros}
                disabled={!hayFiltrosActivos}
                className="w-full sm:w-auto"
              >
                <Eraser className="h-4 w-4" />
              </Button>

              <div className="hidden h-6 w-px bg-muted sm:mx-1 sm:block" />

              <Button
                variant="secondary"
                onClick={exportarExcel}
                disabled={datosOrdenados.length === 0}
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {modoVista === "general" && datosVista.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-8">
            <CardHeader className="pb-2">
              <CardTitle>Indicadores clave</CardTitle>
              <CardDescription>Resumen de asesores, llamadas y promedio global.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/40 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    Total asesores
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{kpis.totalAsesores}</p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PhoneCall className="h-4 w-4 text-primary" />
                    Total llamadas
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{kpis.totalLlamadas}</p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LineChart className="h-4 w-4 text-primary" />
                    Promedio general
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{kpis.promedioGeneral}</p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-primary" />
                    Mejor promedio
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{kpis.mejorPromedio}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-4">
            <CardHeader className="pb-2">
              <CardTitle>Distribucion por cuartiles</CardTitle>
              <CardDescription>Identifica donde se concentra el desempeno.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(["Q1", "Q2", "Q3", "Q4"] as const).map((quartil) => {
                const styleKey = quartil.toLowerCase();
                return (
                  <div
                    key={quartil}
                    className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2"
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-3 py-1 text-sm font-semibold uppercase",
                        quartilBadgeStyles[styleKey] ?? "border-muted text-muted-foreground",
                      )}
                    >
                      {quartil}
                    </Badge>
                    <span className="text-lg font-semibold text-foreground">{cuartiles[quartil]}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-4 pb-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>{modoVista === "detalle" ? "Detalle de llamadas auditadas" : "Resumen por asesor"}</CardTitle>
            <CardDescription>
              {modoVista === "detalle"
                ? "Revisa cada llamada con sus criterios de evaluacion."
                : "Agrupa por asesor para generar feedback y medir cuartiles."}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={modoVista === "detalle" ? "default" : "outline"}
              className="gap-2"
              onClick={() => setModoVista("detalle")}
              disabled={isLoading}
            >
              <List className="h-4 w-4" />
              Vista detalle
            </Button>
            <Button
              variant={modoVista === "general" ? "default" : "outline"}
              className="gap-2"
              onClick={() => setModoVista("general")}
              disabled={isLoading}
            >
              <BarChart3 className="h-4 w-4" />
              Vista general
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <EstadoCard icon={Loader2} title="Cargando datos" description="Estamos consultando las evaluaciones." />
          ) : error ? (
            <EstadoCard icon={AlertTriangle} title="Error al cargar" description={errorMessage} />
          ) : !fechaDesde || !fechaHasta ? (
            <EstadoCard
              icon={CalendarDays}
              title="Selecciona un periodo"
              description="Define fechas desde y hasta para ver la informacion."
            />
          ) : datosOrdenados.length === 0 ? (
            <EstadoCard
              icon={ClipboardList}
              title="Sin resultados"
              description="No encontramos registros para los filtros actuales."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      {columnas.map((col) => {
                        const valoresDisponibles = obtenerValoresUnicos(col.id);
                        const isSorted = ordenColumna.columna === col.id;
                        return (
                          <TableHead key={col.id} className="whitespace-nowrap text-xs uppercase tracking-wide">
                            <div className="flex items-center justify-between gap-2">
                              <button
                                type="button"
                                className={cn(
                                  "flex flex-1 items-center gap-1 text-left font-semibold",
                                  col.id !== "acciones" ? "cursor-pointer" : "cursor-default",
                                )}
                                onClick={() => col.id !== "acciones" && handleOrden(col.id)}
                              >
                                {col.label}
                                {isSorted && (
                                  <span className="text-muted-foreground">
                                    {ordenColumna.direccion === "asc" ? "?" : "?"}
                                  </span>
                                )}
                              </button>
                              {col.filtrable && puedeUsarFiltrosAvanzados && (
                                <Popover
                                  open={menuFiltroAbierto === col.id}
                                  onOpenChange={(open) => setMenuFiltroAbierto(open ? col.id : null)}
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={cn(
                                        "h-8 w-8",
                                        filtrosColumnas[col.id]?.length ? "text-primary" : "text-muted-foreground",
                                      )}
                                    >
                                      <FilterIcon className="h-4 w-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-64 space-y-3" align="end">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-semibold">Filtrar {col.label}</p>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto px-2 text-xs"
                                        onClick={() => seleccionarTodosFiltro(col.id)}
                                      >
                                        Todos
                                      </Button>
                                    </div>
                                    <Input
                                      placeholder="Buscar valor"
                                      value={busquedaFiltro[col.id] || ""}
                                      onChange={(event) =>
                                        setBusquedaFiltro((prev) => ({
                                          ...prev,
                                          [col.id]: event.target.value,
                                        }))
                                      }
                                    />
                                    <label className="flex items-center gap-2 text-sm font-medium">
                                      <Checkbox
                                        checked={
                                          valoresDisponibles.length > 0 &&
                                          (filtrosColumnas[col.id]?.length ?? 0) === valoresDisponibles.length
                                        }
                                        onCheckedChange={() => seleccionarTodosFiltro(col.id)}
                                      />
                                      Seleccionar todos
                                    </label>
                                    <div className="max-h-48 space-y-2 overflow-y-auto">
                                      {valoresDisponibles.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">Sin coincidencias</p>
                                      ) : (
                                        valoresDisponibles.map((valor) => (
                                          <label key={valor} className="flex items-center gap-2 text-sm">
                                            <Checkbox
                                              checked={(filtrosColumnas[col.id] || []).includes(valor)}
                                              onCheckedChange={() => handleFiltroColumnaChange(col.id, valor)}
                                            />
                                            <span className="truncate">{valor}</span>
                                          </label>
                                        ))
                                      )}
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto px-2 text-xs"
                                        onClick={() => limpiarFiltroColumna(col.id)}
                                      >
                                        Limpiar
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="h-auto px-3 text-xs"
                                        onClick={() => setMenuFiltroAbierto(null)}
                                      >
                                        Aplicar
                                      </Button>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datosPaginados.map((fila, idx) => {
                      if (modoVista === "detalle") {
                        const detalle = fila as CalidadRegistroNormalizado
                        return (
                          <TableRow key={`${detalle.documento ?? detalle.asesor}-${idx}`}>
                            <TableCell>{detalle.documento}</TableCell>
                            <TableCell>{detalle.cartera}</TableCell>
                            <TableCell>{detalle.fecha}</TableCell>
                            <TableCell>{detalle.asesor}</TableCell>
                            <TableCell>{detalle.agencia}</TableCell>
                            <TableCell>{detalle.supervisor}</TableCell>
                            <TableCell>{detalle.promedio}</TableCell>
                            <TableCell>{detalle.actitud}</TableCell>
                            <TableCell>{detalle.apertura}</TableCell>
                            <TableCell>{detalle.desarrollo}</TableCell>
                            <TableCell>{detalle.cierre}</TableCell>
                          </TableRow>
                        )
                      }
                      const general = fila as CalidadAsesorAgrupado
                      const isViewingPdf =
                        visualizandoPdf !== null && visualizandoPdf === (general.asesor || "__DESCONOCIDO__")
                      return (
                        <TableRow key={`${general.asesor ?? "general"}-${idx}`}>
                          <TableCell>{general.asesor}</TableCell>
                          <TableCell>{general.agencia}</TableCell>
                          <TableCell>{general.supervisor}</TableCell>
                          <TableCell>{general.cantidad}</TableCell>
                          <TableCell>{general.promedio}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "px-3 py-1 font-semibold uppercase",
                                quartilBadgeStyles[(general.cuartil ?? "").toLowerCase()] ??
                                  "border-muted bg-muted/40 text-muted-foreground",
                              )}
                            >
                              {general.cuartil || "N/D"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                title="Generar feedback"
                                onClick={() => abrirModalFeedback(general)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                title="Ver PDF"
                                onClick={() => handleVisualizarPdf(general)}
                                disabled={isViewingPdf}
                              >
                                {isViewingPdf ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-3 border-t px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground">
                  Mostrando{" "}
                  <span className="font-semibold text-foreground">{datosPaginados.length}</span> de{" "}
                  <span className="font-semibold text-foreground">{datosOrdenados.length}</span> registros
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={irPaginaAnterior} disabled={paginaActual === 1}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Anterior
                  </Button>
                  <span className="text-sm font-semibold">
                    Pagina {paginaActual} de {totalPaginas}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={irPaginaSiguiente}
                    disabled={paginaActual === totalPaginas || datosOrdenados.length === 0}
                  >
                    Siguiente
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalFeedback} onOpenChange={(open) => (open ? setModalFeedback(true) : cerrarModalFeedback())}>
        <DialogContent className="max-h-[85vh] overflow-y-auto space-y-6 sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Generar feedback</DialogTitle>
          </DialogHeader>

          {asesorSeleccionadoFeedback && (
            <div className="grid gap-4 rounded-lg border bg-muted/40 p-4 text-sm md:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Asesor</p>
                <p className="font-semibold text-foreground">{asesorSeleccionadoFeedback.asesor}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Agencia</p>
                <p className="font-semibold text-foreground">{asesorSeleccionadoFeedback.agencia}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Supervisor</p>
                <p className="font-semibold text-foreground">{asesorSeleccionadoFeedback.supervisor}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Promedio</p>
                <p className="font-semibold text-foreground">{asesorSeleccionadoFeedback.promedio}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Total audios</p>
                <p className="font-semibold text-foreground">
                  {feedbackMetadata?.totalAudios ?? asesorSeleccionadoFeedback.cantidad ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Periodo</p>
                <p className="font-semibold text-foreground">
                  {feedbackMetadata
                    ? `${feedbackMetadata.periodo?.desde ?? "--"} al ${feedbackMetadata.periodo?.hasta ?? "--"}`
                    : "--"}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label>Actitudes a reforzar (opcional)</Label>
            <div className="grid gap-2 md:grid-cols-2">
              {ACTITUDES_OPCIONES.map((actitud) => (
                <label
                  key={actitud}
                  className="flex items-start gap-2 rounded-lg border bg-background/80 p-3 text-sm shadow-sm"
                >
                  <Checkbox
                    checked={actitudesSeleccionadas.includes(actitud)}
                    onCheckedChange={() => handleActitudChange(actitud)}
                  />
                  <span className="leading-tight">{actitud}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Sugerencia principal (opcional)</Label>
            <Textarea
              placeholder="Describe la sugerencia principal..."
              value={feedbackSugerencia}
              onChange={(event) => setFeedbackSugerencia(event.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>
              Feedback <span className="text-destructive">*</span>
            </Label>
            <Textarea
              placeholder="Escribe el feedback para el asesor..."
              value={feedbackTexto}
              onChange={(event) => setFeedbackTexto(event.target.value)}
              rows={6}
            />
          </div>

          <div className="space-y-3">
            <Label>Compromiso del asesor (opcional)</Label>
            <Textarea
              placeholder="Describe el compromiso acordado..."
              value={feedbackCompromiso}
              onChange={(event) => setFeedbackCompromiso(event.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={cerrarModalFeedback}>
              Cancelar
            </Button>
            <Button
              onClick={generarPDF}
              disabled={!feedbackTexto.trim() || generandoPdf}
              className="gap-2"
            >
              {generandoPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {generandoPdf ? "Generando..." : "Generar PDF"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
