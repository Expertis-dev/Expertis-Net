"use client";
// @ts-nocheck

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useCalidadDetalle, useSubirFeedbackPdf } from '@/hooks/speech/useSpeechAnalytics';
import { useSpeechAuth } from '@/modules/speech/context/SpeechAuthContext';
import { useUser } from '@/Provider/UserProvider';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Calidad.css';

const LOGO_PATH = '/icono-logo.png';

const ACTITUDES_OPCIONES = [
  'Muestra disposición al cambio y mejora continua.',
  'Evita distracciones (uso de celular, conversaciones fuera de tema, etc.).',
  'Reconoce sus errores y plantea cómo corregirlos.',
  'Se compromete a aplicar inmediatamente lo aprendido.',
  'Participa activamente (pregunta, aporta ejemplos, comparte dudas).'
];

const toISODateString = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseISODate = (value) => {
  if (!value) return null;
  const [year, month = 1, day = 1] = value.split('-').map(Number);
  if (!year) return null;
  return new Date(year, (month || 1) - 1, day || 1);
};

const startOfISOWeek = (date) => {
  const base = new Date(date);
  const day = (base.getDay() + 6) % 7;
  base.setDate(base.getDate() - day);
  base.setHours(0, 0, 0, 0);
  return base;
};

const getISOWeekNumber = (date) => {
  if (!date) return 0;
  const tempDate = new Date(date.valueOf());
  const dayNumber = (tempDate.getDay() + 6) % 7;
  tempDate.setDate(tempDate.getDate() - dayNumber + 3);
  const firstThursday = new Date(tempDate.getFullYear(), 0, 4);
  const diff = tempDate - firstThursday;
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
};

const getWeekRangeFromDate = (isoDate) => {
  const base = parseISODate(isoDate) || new Date();
  const monday = startOfISOWeek(base);
  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);
  return {
    desde: toISODateString(monday),
    hasta: toISODateString(friday)
  };
};

const promedioValores = (valores) => {
  const numeros = valores
    .map((valor) => Number(valor))
    .filter((valor) => Number.isFinite(valor));
  if (!numeros.length) return 0;
  return Number((numeros.reduce((acc, val) => acc + val, 0) / numeros.length).toFixed(1));
};

const calcularEvolutivoSemanal = (rows, baseIso, totalWeeks = 4) => {
  if (!rows.length || !baseIso) {
    return { labels: [], valores: [], promedio: 0 };
  }

  const baseDate = parseISODate(baseIso) || new Date();
  const baseYearMonth = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, '0')}`;
  const acumulado = new Map();

  rows
    .filter((row) => {
      const fecha = row.fecha || row.fechaLlamada;
      return fecha && fecha.startsWith(baseYearMonth);
    })
    .forEach((row) => {
      const fecha = row.fecha || row.fechaLlamada;
      if (!fecha) return;
      const fechaDate = parseISODate(fecha);
      if (!fechaDate) return;
      const week = getISOWeekNumber(fechaDate);
      const current = acumulado.get(week) || { sum: 0, count: 0 };
      current.sum += Number(row.promedio ?? row.calificacionCalidad ?? 0) || 0;
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

const safeFileName = (texto) => (texto ?? '').replace(/[^\w-]+/g, '_') || 'feedback';

const etiquetaFirmaPorCuartil = (quartil) =>
  String(quartil ?? '').toUpperCase() === 'Q4' ? 'Analista de formación' : 'Supervisor';

// Importar utilidades
import {
  agruparPorAsesor,
  agruparPorAsesorYSemana,
  calcularKPIsGenerales,
  distribuirPorCuartiles,
  formatearSemana
} from './utils/CalidadCalculos';

const getValue = (obj, ...keys) => {
  if (!obj) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] != null) {
      return obj[key];
    }
  }
  return undefined;
};

// const FILAS_POR_PAGINA = 10;

const Calidad = () => {
  const { hasPermiso } = useSpeechAuth();

  const { user } = useUser();

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
  const [filtrosColumnas, setFiltrosColumnas] = useState({});
  const [menuFiltroAbierto, setMenuFiltroAbierto] = useState(null);
  const [busquedaFiltro, setBusquedaFiltro] = useState({});
  const [paginaActual, setPaginaActual] = useState(1);

  // Ordenamiento
  const [ordenColumna, setOrdenColumna] = useState({ columna: '', direccion: 'asc' });
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  // Modal
  const [modalFeedback, setModalFeedback] = useState(false);
  const [asesorSeleccionadoFeedback, setAsesorSeleccionadoFeedback] = useState(null);
  const [feedbackTexto, setFeedbackTexto] = useState('');
  const [actitudesSeleccionadas, setActitudesSeleccionadas] = useState([]);
  const [feedbackMetadata, setFeedbackMetadata] = useState(null);
  const [feedbackSugerencia, setFeedbackSugerencia] = useState('');
  const [feedbackCompromiso, setFeedbackCompromiso] = useState('');
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const logoDataUrlRef = useRef(null);
  const loadLogo = useCallback(async () => {
    if (logoDataUrlRef.current) {
      return logoDataUrlRef.current;
    }
    try {
      const response = await fetch(LOGO_PATH);
      if (!response.ok) {
        throw new Error('No se pudo obtener el logo');
      }
      const blob = await response.blob();
      const dataUrl = await new Promise((resolve, reject) => {
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
    async ({ metadata, retroalimentacion, sugerencia, compromiso, actitudes }) => {
      if (!metadata) {
        throw new Error('No hay información para generar el PDF');
      }

      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
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

      const drawHeader = () => {
        const top = 10;
        const logoW = 26;
        const logoH = 26;
        if (logoDataUrl) {
          try {
            doc.addImage(logoDataUrl, 'PNG', margin, top, logoW, logoH, undefined, 'FAST');
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

      const section = (titulo) => {
        doc.setTextColor(azul.r, azul.g, azul.b);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(titulo, margin, y);
        y += 6;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      };

      const paragraph = (texto, minHeight = 14) => {
        const contenido = (texto ?? '—').toString().trim() || '—';
        const lines = doc.splitTextToSize(contenido, textWidth);
        doc.text(lines, margin, y);
        y += Math.max(minHeight, lines.length * 5.2) + 2;
      };

      const drawCheck = (x, yBase, label, checked) => {
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
        y = doc.lastAutoTable.finalY + 10;
      }

      autoTable(doc, {
        startY: y,
        head: [['Criterio', 'Promedio']],
        body: [
          ['Apertura', `${metadata.califs?.apertura ?? 0}`],
          ['Negociación', `${metadata.califs?.negociacion ?? 0}`],
          ['Comunicación efectiva', `${metadata.califs?.comunicacionefectiva ?? 0}`],
          ['Cumplimiento normativo', `${metadata.califs?.cumplimientonormativo ?? 0}`],
          ['Cierre', `${metadata.califs?.cierre ?? 0}`],
          ['Actitud', `${metadata.califs?.actitud ?? 0}`],
          ['Promedio total', `${metadata.califs?.total ?? 0}`]
        ],
        theme: 'grid',
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 3, lineWidth: 0.1 },
        headStyles: { fillColor: [azul.r, azul.g, azul.b], textColor: 255 }
      });
      y = doc.lastAutoTable.finalY + 10;

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
      const ensureSpaceFor = (need) => {
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
      doc.text(etiquetaFirmaPorCuartil(metadata.quartil), x1 + firmaWidth / 2, yLine + gapLabel, {
        align: 'center'
      });
      doc.text('Asesor', x2 + firmaWidth / 2, yLine + gapLabel, { align: 'center' });

      const nombre = `feedback_${safeFileName(metadata.asesor)}_${fechaPDF}.pdf`;
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

  // Permisos
  const tienePermisoInterno = hasPermiso('PERMISO_CalidadInterno-ver');
  const tienePermisoExterno = hasPermiso('PERMISO_CalidadExterno-ver');
  const tienePermisoJudicial = hasPermiso('PERMISO_CalidadJudicial-ver');

  // ============ DATOS PROCESADOS ============
  const datosCompletos = useMemo(() => {
    if (!dataCalidad || !Array.isArray(dataCalidad)) return [];
    
    return dataCalidad
      .map(item => ({
        documento: getValue(item, 'idGestion', 'IdGestion'),
        cartera: getValue(item, 'cartera', 'Cartera'),
        fecha: getValue(item, 'fechaLlamada', 'FechaLlamada', 'fecha', 'Fecha'),
        asesor: getValue(item, 'asesor', 'Asesor'),
        agencia: getValue(item, 'agencia', 'Agencia'),
        supervisor: getValue(item, 'supervisor', 'Supervisor'),
        promedio: getValue(item, 'calificacionCalidad', 'calificacion_calidad'),
        actitud: getValue(item, 'calificacionActitud', 'calificacion_actitud'),
        apertura: getValue(item, 'calificacionApertura', 'calificacion_apertura'),
        desarrollo: getValue(item, 'calificacionNegociacion', 'calificacion_negociacion'),
        negociacion: getValue(item, 'calificacionNegociacion', 'calificacion_negociacion'),
        comunicacionefectiva: getValue(
          item,
          'calificacionComunicacionefectiva',
          'calificacion_comunicacionefectiva'
        ),
        cumplimientonormativo: getValue(
          item,
          'calificacionCumplimientoNormativo',
          'calificacion_cumplimiento_normativo'
        ),
        cierre: getValue(item, 'calificacionCierre', 'calificacion_cierre'),
        calificaciontotal: getValue(item, 'calificacionCalidad', 'calificacion_calidad'),
        observacionCalidad: getValue(item, 'observacionCalidad', 'observacion_calidad'),
        grabacion: getValue(item, 'grabacion', 'rutGrabacion'),
        transcripcion: getValue(item, 'transcripcion', 'Transcripcion'),
        resumen: getValue(item, 'resumen', 'Resumen'),
        tipificacion: getValue(item, 'tipificacion', 'Tipificacion', 'indLlamada'),
        codmes: getValue(item, 'codmes', 'CodMes')
      }))
      .filter(item => {
        const cartera = item.cartera?.trim().toLowerCase() || '';
        if (cartera === 'interno' && !tienePermisoInterno) return false;
        if (cartera === 'externo' && !tienePermisoExterno) return false;
        if (cartera === 'judicial' && !tienePermisoJudicial) return false;
        return true;
      });
  }, [dataCalidad, tienePermisoInterno, tienePermisoExterno, tienePermisoJudicial]);

  // Opciones de filtros
  const agenciasUnicas = useMemo(() => 
    [...new Set(datosCompletos.map(item => item.agencia).filter(Boolean))].sort(),
    [datosCompletos]
  );

  const supervisoresUnicos = useMemo(() => {
    let datos = datosCompletos;
    if (agenciaSeleccionada) {
      datos = datos.filter(item => item.agencia === agenciaSeleccionada);
    }
    return [...new Set(datos.map(item => item.supervisor).filter(Boolean))].sort();
  }, [datosCompletos, agenciaSeleccionada]);

  const asesoresUnicos = useMemo(() => {
    let datos = datosCompletos;
    if (agenciaSeleccionada) {
      datos = datos.filter(item => item.agencia === agenciaSeleccionada);
    }
    if (supervisorSeleccionado) {
      datos = datos.filter(item => item.supervisor === supervisorSeleccionado);
    }
    return [...new Set(datos.map(item => item.asesor).filter(Boolean))].sort();
  }, [datosCompletos, agenciaSeleccionada, supervisorSeleccionado]);

  // Resetear filtros dependientes
  useEffect(() => {
    setSupervisorSeleccionado('');
    setAsesorSeleccionado('');
  }, [agenciaSeleccionada]);

  useEffect(() => {
    setAsesorSeleccionado('');
  }, [supervisorSeleccionado]);

  // Aplicar filtros principales
  const datosFiltradosPrincipales = useMemo(() => {
    let datos = [...datosCompletos];

    if (agenciaSeleccionada) {
      datos = datos.filter(item => item.agencia === agenciaSeleccionada);
    }
    if (supervisorSeleccionado) {
      datos = datos.filter(item => item.supervisor === supervisorSeleccionado);
    }
    if (asesorSeleccionado) {
      datos = datos.filter(item => item.asesor === asesorSeleccionado);
    }

    return datos;
  }, [datosCompletos, agenciaSeleccionada, supervisorSeleccionado, asesorSeleccionado]);

  const buildFeedbackPayload = useCallback(
    (asesor) => {
      if (!asesor) return null;
      const rows = datosFiltradosPrincipales.filter(item => item.asesor === asesor.asesor);
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
            total: 0
          },
          observacion: '',
          fecha: toISODateString(new Date()),
          evolutivoLabels: [],
          evolutivoValores: [],
          evolutivoPromedio: 0
        };
      }

      const periodoRef = fechaDesde || rows[0]?.fecha || toISODateString(new Date());
      const evolutivo = calcularEvolutivoSemanal(rows, fechaDesde || rows[0]?.fecha);
      const observacion = rows.find(row => row.observacionCalidad)?.observacionCalidad || '';

      return {
        asesor: asesor.asesor,
        supervisor: asesor.supervisor,
        agencia: asesor.agencia,
        quartil: asesor.cuartil,
        periodo: getWeekRangeFromDate(periodoRef),
        totalAudios: rows.length,
        nroSemana: rows[0]?.fecha ? getISOWeekNumber(parseISODate(rows[0].fecha)) : undefined,
        califs: {
          apertura: promedioValores(rows.map(row => row.apertura)),
          negociacion: promedioValores(rows.map(row => row.negociacion ?? row.desarrollo)),
          comunicacionefectiva: promedioValores(rows.map(row => row.comunicacionefectiva)),
          cumplimientonormativo: promedioValores(rows.map(row => row.cumplimientonormativo)),
          cierre: promedioValores(rows.map(row => row.cierre)),
          actitud: promedioValores(rows.map(row => row.actitud)),
          total: promedioValores(rows.map(row => row.promedio))
        },
        observacion,
        fecha: toISODateString(new Date()),
        evolutivoLabels: evolutivo.labels,
        evolutivoValores: evolutivo.valores,
        evolutivoPromedio: evolutivo.promedio
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
  const datosVista = useMemo(() => {
    if (modoVista === 'detalle') {
      return datosFiltradosPrincipales;
    } else {
      return agruparPorAsesor(datosFiltradosPrincipales);
    }
  }, [modoVista, datosFiltradosPrincipales]);

  // Aplicar filtros de columnas
  const datosFiltradosColumnas = useMemo(() => {
    let datos = [...datosVista];

    Object.entries(filtrosColumnas).forEach(([columna, valores]) => {
      if (valores?.length > 0) {
        datos = datos.filter(item => valores.includes(String(item[columna])));
      }
    });

    return datos;
  }, [datosVista, filtrosColumnas]);

  // Aplicar ordenamiento
  const filtrosColumnasKey = useMemo(() => JSON.stringify(filtrosColumnas), [filtrosColumnas]);

  const datosOrdenados = useMemo(() => {
    if (!ordenColumna.columna) return datosFiltradosColumnas;

    return [...datosFiltradosColumnas].sort((a, b) => {
      const valorA = a[ordenColumna.columna];
      const valorB = b[ordenColumna.columna];

      if (valorA == null) return 1;
      if (valorB == null) return -1;

      const comparacion = valorA < valorB ? -1 : valorA > valorB ? 1 : 0;
      return ordenColumna.direccion === 'asc' ? comparacion : -comparacion;
    });
  }, [datosFiltradosColumnas, ordenColumna]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((!fechaDesde || !fechaHasta) || datosOrdenados.length === 0) {
      setFilasPorPagina(prev => (prev === 10 ? prev : 10));
      return;
    }

    const calcularFilas = () => {
      const contentEl = document.querySelector('.calidad-content');
      if (!contentEl) return;

      const filtrosAltura = contentEl.querySelector('.filtros-principales')?.offsetHeight || 0;
      const tabsAltura = contentEl.querySelector('.tabs-vistas')?.offsetHeight || 0;
      const kpisAltura = modoVista === 'general' ? contentEl.querySelector('.kpis-grid')?.offsetHeight || 0 : 0;
      const cuartilesAltura = modoVista === 'general' ? contentEl.querySelector('.cuartiles-section')?.offsetHeight || 0 : 0;
      const paginacionAltura = contentEl.querySelector('.tabla-paginacion')?.offsetHeight || 72;
      const espacioDisponible = contentEl.clientHeight - filtrosAltura - tabsAltura - kpisAltura - cuartilesAltura - paginacionAltura - 48;
      const filaAltura = document.querySelector('.tabla-calidad tbody tr')?.offsetHeight || 48;

      if (espacioDisponible <= 0 || filaAltura <= 0) return;

      const posiblesFilas = Math.max(5, Math.floor(espacioDisponible / filaAltura) - 1);

      if (Number.isFinite(posiblesFilas) && posiblesFilas > 0) {
        setFilasPorPagina(prev => (prev === posiblesFilas ? prev : posiblesFilas));
      }
    };

    const rafId = window.requestAnimationFrame(calcularFilas);
    window.addEventListener('resize', calcularFilas);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', calcularFilas);
    };
  }, [fechaDesde, fechaHasta, datosOrdenados.length, modoVista]);

  const filasPorPaginaActivas = Math.max(1, filasPorPagina);

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

  const hayFiltrosActivos = Boolean(
    fechaDesde || fechaHasta || fechaDesdeTemp || fechaHastaTemp ||
    agenciaSeleccionada || supervisorSeleccionado || asesorSeleccionado ||
    Object.keys(filtrosColumnas).length
  );

  // KPIs generales
  const kpis = useMemo(() => 
    calcularKPIsGenerales(datosFiltradosPrincipales),
    [datosFiltradosPrincipales]
  );

  // Cuartiles
  const cuartiles = useMemo(() => 
    distribuirPorCuartiles(modoVista === 'general' ? datosVista : []),
    [modoVista, datosVista]
  );

  // ============ HANDLERS ============
  const handleBuscar = () => {
    if (!fechaDesdeTemp || !fechaHastaTemp) {
      alert('Por favor, selecciona ambas fechas');
      return;
    }

    if (new Date(fechaDesdeTemp) > new Date(fechaHastaTemp)) {
      alert('La fecha desde no puede ser mayor que la fecha hasta');
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

  const handleOrden = (columna) => {
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

  const toggleMenuFiltro = (columna) => {
    setMenuFiltroAbierto(menuFiltroAbierto === columna ? null : columna);
    setBusquedaFiltro(prev => ({ ...prev, [columna]: '' }));
  };

  const obtenerValoresUnicos = (columna) => {
    const valores = datosVista.map(item => String(item[columna])).filter(Boolean);
    const unicos = [...new Set(valores)].sort();

    const busqueda = busquedaFiltro[columna]?.toLowerCase() || '';
    if (busqueda) {
      return unicos.filter(val => val.toLowerCase().includes(busqueda));
    }
    return unicos;
  };

  const handleFiltroColumnaChange = (columna, valor) => {
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

  const seleccionarTodosFiltro = (columna) => {
    const todosValores = obtenerValoresUnicos(columna);
    setFiltrosColumnas(prev => ({
      ...prev,
      [columna]: todosValores
    }));
  };

  const limpiarFiltroColumna = (columna) => {
    setFiltrosColumnas(prev => {
      const nuevo = { ...prev };
      delete nuevo[columna];
      return nuevo;
    });
  };

  const aplicarFiltroColumna = (columna) => {
    setMenuFiltroAbierto(null);
  };

  // Exportar Excel
  const exportarExcel = () => {
    if (datosOrdenados.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const datosExcel = datosOrdenados.map(item => {
      if (modoVista === 'detalle') {
        return {
          'Documento': item.documento,
          'Cartera': item.cartera,
          'Fecha': item.fecha,
          'Asesor': item.asesor,
          'Agencia': item.agencia,
          'Supervisor': item.supervisor,
          'Promedio': item.promedio,
          'Actitud': item.actitud,
          'Apertura': item.apertura,
          'Desarrollo': item.desarrollo,
          'Cierre': item.cierre
        };
      } else {
        return {
          'Asesor': item.asesor,
          'Agencia': item.agencia,
          'Supervisor': item.supervisor,
          'Cantidad': item.cantidad,
          'Promedio': item.promedio,
          'Cuartil': item.cuartil
        };
      }
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
  const abrirModalFeedback = (asesor) => {
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

  const handleActitudChange = (actitud) => {
    setActitudesSeleccionadas(prev =>
      prev.includes(actitud)
        ? prev.filter(a => a !== actitud)
        : [...prev, actitud]
    );
  };

  const generarPDF = async () => {
    if (!asesorSeleccionadoFeedback || !feedbackTexto.trim()) {
      alert('Por favor, completa el feedback antes de generar el PDF');
      return;
    }
    if (!feedbackMetadata) {
      alert('No hay datos suficientes para generar el PDF');
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
      const supervisor = (feedbackMetadata.supervisor || user?.usuario || 'DESCONOCIDO').toUpperCase();
      const fechaCarpeta = toISODateString(new Date());

      subirFeedbackPdfMutation.mutate({
        supervisor,
        fechaCarpeta,
        nombreArchivo: nombre,
        archivo
      });

      doc.save(nombre);
      cerrarModalFeedback();
    } catch (error) {
      console.error('[Calidad] Error al generar el PDF', error);
      alert('Ocurrió un error al generar el PDF. Intenta nuevamente.');
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

  const obtenerClaseCuartil = (cuartil) => {
    return `badge-cuartil-tabla cuartil-${cuartil.toLowerCase()}`;
  };

  return (
    <div className="calidad-container">
      {/* Header */}
      <div className="calidad-header">
        <div className="header-content">
          <h1 className="calidad-title">
            <i className="fas fa-award"></i>
            Análisis de Calidad
          </h1>
        </div>
      </div>

      {/* Contenido */}
      <div className="calidad-content">
        {/* Filtros principales */}
        <div className="filtros-principales">
          <div className="filtro-grupo">
            <label htmlFor="fechaDesde">
              <i className="fas fa-calendar-alt"></i> Fecha Desde
            </label>
            <input
              id="fechaDesde"
              type="date"
              value={fechaDesdeTemp}
              onChange={(e) => setFechaDesdeTemp(e.target.value)}
              className="input-fecha"
            />  
          </div>

          <div className="filtro-grupo">
            <label htmlFor="fechaHasta">
              <i className="fas fa-calendar-alt"></i> Fecha Hasta
            </label>
            <input
              id="fechaHasta"
              type="date"
              value={fechaHastaTemp}
              onChange={(e) => setFechaHastaTemp(e.target.value)}
              className="input-fecha"
            />
          </div>

          <div className="filtro-grupo">
            <label htmlFor="agencia">
              <i className="fas fa-building"></i> Agencia
            </label>
            <select
              id="agencia"
              className="select-filtro"
              value={agenciaSeleccionada}
              onChange={(e) => setAgenciaSeleccionada(e.target.value)}
              disabled={datosCompletos.length === 0}
            >
              <option value="">Todas</option>
              {agenciasUnicas.map(agencia => (
                <option key={agencia} value={agencia}>{agencia}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label htmlFor="supervisor">
              <i className="fas fa-user-tie"></i> Supervisor
            </label>
            <select
              id="supervisor"
              className="select-filtro"
              value={supervisorSeleccionado}
              onChange={(e) => setSupervisorSeleccionado(e.target.value)}
              disabled={!agenciaSeleccionada || supervisoresUnicos.length === 0}
            >
              <option value="">Todos</option>
              {supervisoresUnicos.map(supervisor => (
                <option key={supervisor} value={supervisor}>{supervisor}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label htmlFor="asesor">
              <i className="fas fa-user"></i> Asesor
            </label>
            <select
              id="asesor"
              className="select-filtro"
              value={asesorSeleccionado}
              onChange={(e) => setAsesorSeleccionado(e.target.value)}
              disabled={!supervisorSeleccionado || asesoresUnicos.length === 0}
            >
              <option value="">Todos</option>
              {asesoresUnicos.map(asesor => (
                <option key={asesor} value={asesor}>{asesor}</option>
              ))}
            </select>
          </div>

          <div className="acciones-filtros">
            <button
              className="btn-icono btn-icono-buscar"
              onClick={handleBuscar}
              disabled={!fechaDesdeTemp || !fechaHastaTemp || isLoading}
            >
              <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-search'}`}></i>
            </button>
            <button
              className="btn-icono btn-icono-limpiar"
              onClick={handleLimpiarFiltros}
              disabled={!hayFiltrosActivos}
            >
              <i className="fas fa-eraser"></i>
            </button>
            <button
              className="btn-icono btn-icono-exportar"
              onClick={exportarExcel}
              disabled={datosOrdenados.length === 0}
            >
              <i className="fas fa-file-excel"></i>
            </button>
          </div>
        </div>

        {/* Tabs de vista */}
        <div className="tabs-vistas">
          <button
            className={`tab-vista-btn ${modoVista === 'detalle' ? 'activo' : ''}`}
            onClick={() => setModoVista('detalle')}
          >
            <i className="fas fa-list"></i>
            Vista Detalle
          </button>

          <button
            className={`tab-vista-btn ${modoVista === 'general' ? 'activo' : ''}`}
            onClick={() => setModoVista('general')}
          >
            <i className="fas fa-chart-bar"></i>
            Vista General
          </button>
        </div>

        {/* KPIs - Solo en vista general */}
        {modoVista === 'general' && datosVista.length > 0 && (
          <>
            <div className="kpis-grid">
              <div className="kpi-card">
                <div className="kpi-label">
                  <i className="fas fa-users"></i>
                  Total Asesores
                </div>
                <div className="kpi-value">{kpis.totalAsesores}</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-label">
                  <i className="fas fa-phone"></i>
                  Total Llamadas
                </div>
                <div className="kpi-value">{kpis.totalLlamadas}</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-label">
                  <i className="fas fa-chart-line"></i>
                  Promedio General
                </div>
                <div className="kpi-value">{kpis.promedioGeneral}</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-label">
                  <i className="fas fa-star"></i>
                  Mejor Promedio
                </div>
                <div className="kpi-value">{kpis.mejorPromedio}</div>
              </div>
            </div>

            {/* Cuartiles */}
            <div className="cuartiles-section">
              <h3>
                <i className="fas fa-chart-pie"></i>
                Distribución por Cuartiles
              </h3>
              <div className="cuartiles-grid">
                <div className="cuartil-badge cuartil-q1">
                  <span className="cuartil-nombre">Q1</span>
                  <span className="cuartil-cantidad">{cuartiles.Q1}</span>
                </div>
                <div className="cuartil-badge cuartil-q2">
                  <span className="cuartil-nombre">Q2</span>
                  <span className="cuartil-cantidad">{cuartiles.Q2}</span>
                </div>
                <div className="cuartil-badge cuartil-q3">
                  <span className="cuartil-nombre">Q3</span>
                  <span className="cuartil-cantidad">{cuartiles.Q3}</span>
                </div>
                <div className="cuartil-badge cuartil-q4">
                  <span className="cuartil-nombre">Q4</span>
                  <span className="cuartil-cantidad">{cuartiles.Q4}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tabla */}
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Cargando datos...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <i className="fas fa-exclamation-circle"></i>
            <h3>Error al cargar datos</h3>
            <p>{error.message || 'Ocurrió un error inesperado'}</p>
          </div>
        ) : !fechaDesde || !fechaHasta ? (
          <div className="mensaje-inicial">
            <i className="fas fa-calendar-check"></i>
            <h3>Selecciona un rango de fechas</h3>
            <p>Por favor, selecciona las fechas desde y hasta para visualizar los datos</p>
          </div>
        ) : datosOrdenados.length === 0 ? (
          <div className="mensaje-vacio">
            <i className="fas fa-inbox"></i>
            <h3>No hay datos disponibles</h3>
            <p>No se encontraron registros para los filtros seleccionados</p>
          </div>
        ) : (
          <div className="tabla-responsive">
            <table className="tabla-calidad">
              <thead>
                <tr>
                  {columnas.map(col => (
                    <th key={col.id}>
                      <div className="th-content">
                        <span
                          onClick={() => col.id !== 'acciones' && handleOrden(col.id)}
                          style={{ cursor: col.id !== 'acciones' ? 'pointer' : 'default' }}
                        >
                          {col.label}
                          {ordenColumna.columna === col.id && (
                            <i className={`fas fa-sort-${ordenColumna.direccion === 'asc' ? 'up' : 'down'}`}></i>
                          )}
                        </span>

                        {col.filtrable && (
                          <button
                            className={`btn-filtro-th ${filtrosColumnas[col.id]?.length > 0 ? 'filtro-activo' : ''}`}
                            onClick={() => toggleMenuFiltro(col.id)}
                            title={`Filtrar ${col.label}`}
                          >
                            <i className="fas fa-filter"></i>
                          </button>
                        )}

                        {col.filtrable && menuFiltroAbierto === col.id && (
                          <div className="menu-filtro" onClick={(e) => e.stopPropagation()}>
                            <div className="menu-filtro-header">
                              Filtrar {col.label}
                            </div>

                            <input
                              type="text"
                              className="input-busqueda-filtro"
                              placeholder="Buscar..."
                              value={busquedaFiltro[col.id] || ''}
                              onChange={(e) => setBusquedaFiltro(prev => ({ ...prev, [col.id]: e.target.value }))}
                            />

                            <div className="checkbox-todos">
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={filtrosColumnas[col.id]?.length === obtenerValoresUnicos(col.id).length}
                                  onChange={() => seleccionarTodosFiltro(col.id)}
                                />
                                Seleccionar todos
                              </label>
                            </div>

                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                              {obtenerValoresUnicos(col.id).map(valor => (
                                <label key={valor} className="checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={(filtrosColumnas[col.id] || []).includes(valor)}
                                    onChange={() => handleFiltroColumnaChange(col.id, valor)}
                                  />
                                  {valor}
                                </label>
                              ))}
                            </div>

                            <div className="menu-filtro-acciones">
                              <button
                                className="btn-filtro-accion btn-limpiar-filtro"
                                onClick={() => limpiarFiltroColumna(col.id)}
                              >
                                Limpiar
                              </button>
                              <button
                                className="btn-filtro-accion btn-aplicar-filtro"
                                onClick={() => aplicarFiltroColumna(col.id)}
                              >
                                Aplicar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datosPaginados.map((fila, idx) => (
                  <tr key={idx}>
                    {modoVista === 'detalle' ? (
                      <>
                        <td>{fila.documento}</td>
                        <td>{fila.cartera}</td>
                        <td>{fila.fecha}</td>
                        <td>{fila.asesor}</td>
                        <td>{fila.agencia}</td>
                        <td>{fila.supervisor}</td>
                        <td>{fila.promedio}</td>
                        <td>{fila.actitud}</td>
                        <td>{fila.apertura}</td>
                        <td>{fila.desarrollo}</td>
                        <td>{fila.cierre}</td>
                      </>
                    ) : (
                      <>
                        <td>{fila.asesor}</td>
                        <td>{fila.agencia}</td>
                        <td>{fila.supervisor}</td>
                        <td>{fila.cantidad}</td>
                        <td>{fila.promedio}</td>
                        <td>
                          <span className={obtenerClaseCuartil(fila.cuartil)}>
                            {fila.cuartil}
                          </span>
                        </td>
                        <td>
                          <div className="acciones-btns">
                            <button
                              className="btn-accion btn-pdf"
                              onClick={() => abrirModalFeedback(fila)}
                              title="Generar feedback PDF"
                            >
                              <i className="fas fa-file-pdf"></i>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="tabla-paginacion">
              <div className="info-paginacion">
                Mostrando <strong>{datosPaginados.length}</strong> de <strong>{datosOrdenados.length}</strong> registros
              </div>
              <div className="paginacion-controles">
                <button
                  className="btn-paginacion"
                  onClick={irPaginaAnterior}
                  disabled={paginaActual === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                  Anterior
                </button>
                <span className="paginacion-estado">
                  Página {paginaActual} de {totalPaginas}
                </span>
                <button
                  className="btn-paginacion"
                  onClick={irPaginaSiguiente}
                  disabled={paginaActual === totalPaginas || datosOrdenados.length === 0}
                >
                  Siguiente
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Feedback */}
      {modalFeedback && asesorSeleccionadoFeedback && (
        <div className="modal-overlay" onClick={cerrarModalFeedback}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-file-pdf"></i>
                Generar Feedback
              </h2>
              <button className="btn-cerrar-modal" onClick={cerrarModalFeedback}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="feedback-info">
                <div className="feedback-info-grid">
                  <div className="feedback-info-item">
                    <strong>Asesor:</strong>
                    <span>{asesorSeleccionadoFeedback.asesor}</span>
                  </div>
                  <div className="feedback-info-item">
                    <strong>Agencia:</strong>
                    <span>{asesorSeleccionadoFeedback.agencia}</span>
                  </div>
                  <div className="feedback-info-item">
                    <strong>Supervisor:</strong>
                    <span>{asesorSeleccionadoFeedback.supervisor}</span>
                  </div>
                  <div className="feedback-info-item">
                    <strong>Promedio:</strong>
                    <span>{asesorSeleccionadoFeedback.promedio}</span>
                  </div>
                  <div className="feedback-info-item">
                    <strong>Total audios:</strong>
                    <span>{feedbackMetadata?.totalAudios ?? asesorSeleccionadoFeedback.cantidad ?? 0}</span>
                  </div>
                  <div className="feedback-info-item">
                    <strong>Periodo:</strong>
                    <span>
                      {feedbackMetadata
                        ? `${feedbackMetadata.periodo?.desde ?? '—'} al ${feedbackMetadata.periodo?.hasta ?? '—'}`
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Actitudes a Reforzar (Opcional)
                </label>
                <div className="checkboxes-grid">
                  {ACTITUDES_OPCIONES.map(actitud => (
                    <label key={actitud} className="checkbox-actitud">
                      <input
                        type="checkbox"
                        checked={actitudesSeleccionadas.includes(actitud)}
                        onChange={() => handleActitudChange(actitud)}
                      />
                      {actitud}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>
                  Sugerencia principal de mejora (Opcional)
                </label>
                <textarea
                  className="feedback-textarea"
                  placeholder="Describe la sugerencia principal..."
                  value={feedbackSugerencia}
                  onChange={(e) => setFeedbackSugerencia(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>
                  Feedback <span className="required">*</span>
                </label>
                <textarea
                  className="feedback-textarea"
                  placeholder="Escribe aquí el feedback para el asesor..."
                  value={feedbackTexto}
                  onChange={(e) => setFeedbackTexto(e.target.value)}
                  rows={8}
                />
              </div>

              <div className="form-group">
                <label>
                  Compromiso del asesor (Opcional)
                </label>
                <textarea
                  className="feedback-textarea"
                  placeholder="Describe el compromiso acordado..."
                  value={feedbackCompromiso}
                  onChange={(e) => setFeedbackCompromiso(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-generar-pdf"
                onClick={generarPDF}
                disabled={!feedbackTexto.trim() || generandoPdf}
              >
                <i className={`fas ${generandoPdf ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
                {generandoPdf ? 'Generando...' : 'Generar PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calidad;
