/**
 * Listado de feriados oficiales para el año 2026 (Perú)
 * Se puede expandir para otros años si es necesario.
 */
export const FERIADOS_2026: Record<string, string> = {
    '2026-01-01': 'Año Nuevo',
    '2026-04-02': 'Jueves Santo',
    '2026-04-03': 'Viernes Santo',
    '2026-05-01': 'Día del Trabajo',
    '2026-06-07': 'Batalla de Arica',
    '2026-06-29': 'San Pedro y San Pablo',
    '2026-07-23': 'Día de la Fuerza Aérea del Perú',
    '2026-07-28': 'Fiestas Patrias',
    '2026-07-29': 'Fiestas Patrias',
    '2026-08-06': 'Batalla de Junín',
    '2026-08-30': 'Santa Rosa de Lima',
    '2026-10-08': 'Combate de Angamos',
    '2026-11-01': 'Día de Todos los Santos',
    '2026-12-08': 'Inmaculada Concepción',
    '2026-12-09': 'Batalla de Ayacucho',
    '2026-12-25': 'Navidad',
};

/**
 * Función para verificar si una fecha es feriado
 * @param fecha string en formato YYYY-MM-DD
 * @returns nombre del feriado o null si no es feriado
 */
export const getFeriado = (fecha: string): string | null => {
    // Si la fecha viene con T00:00:00.000Z o similar, limpiamos para quedarnos con YYYY-MM-DD
    const dateKey = fecha.split('T')[0];
    return FERIADOS_2026[dateKey] || null;
};
