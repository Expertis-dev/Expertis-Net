import { ObtenerInfo } from "./apiVacacionesInfo";
import { User } from "@/Context/UserContext";
import { calcularSaldosVacaciones } from "./saldosVacaciones";

export type DateRange = { from: string; to: string }; // "YYYY-MM-DD"
export type DayStats = {
    laborables: number;
    noLaborables: number;
    fechas?: string[]; // opcional, para depurar/mostrar
};
export type OpcionVacaciones = {
    dateRange: DateRange;
    fechas: string[];
    dayStats: DayStats;
    // recalculado con tus funciones para este dateRange
    saldoH: number;
    saldoNH: number;
    // saldo después de descontar el objetivo targetH/targetNH
    saldoAfterH: number;
    saldoAfterNH: number;
    ratioAfter: number;
    // similitud con lo que el usuario escogió
    overlapCount: number;
    overlapPct: number;
    ok: boolean;
    uiLevel: "success" | "warning" | "error";
    message: string;
    porcentaje: number | string;
};
function toDateUTC(iso: string): Date {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
}
function toISODateUTC(dt: Date): string {
    return dt.toISOString().slice(0, 10);
}
function addDaysUTC(iso: string, days: number): string {
    const dt = toDateUTC(iso);
    dt.setUTCDate(dt.getUTCDate() + days);
    return toISODateUTC(dt);
}
function listDaysInclusive(from: string, to: string): string[] {
    const out: string[] = [];
    let cur = from;
    while (cur <= to) {
        out.push(cur);
        cur = addDaysUTC(cur, 1);
    }
    return out;
}
function construirRangoDesdeInicio(params: {
    start: string;
    targetH: number;
    targetNH: number;
    isLaborable: (iso: string) => boolean;
    maxDias?: number;
}) {
    const { start, targetH, targetNH, isLaborable, maxDias = 500 } = params;

    let h = 0;
    let nh = 0;
    const fechas: string[] = [];
    let cur = start;

    for (let i = 0; i < maxDias; i++) {
        fechas.push(cur);
        if (isLaborable(cur)) h++;
        else nh++;

        if (h === targetH && nh === targetNH) {
            return {
                from: start,
                to: cur,
                fechas,
                dayStats: { laborables: h, noLaborables: nh, fechas },
            };
        }

        // si te pasaste en cualquiera, este inicio no sirve
        if (h > targetH || nh > targetNH) return null;

        cur = addDaysUTC(cur, 1);
    }

    return null;
}
function ratioEnRango(H: number, NH: number, LOW: number, HIGH: number) {
    if (NH <= 0) return { ok: false, ratio: Infinity };
    const r = H / NH;
    return { ok: r >= LOW && r <= HIGH, ratio: r };
}
export async function listarOpcionesVacaciones(params: {
    user: User;
    selectedRange: DateRange;
    targetH: number;
    targetNH: number;
    LOW?: number;
    HIGH?: number;
    searchRadiusDays?: number; // cuánto mover el inicio para buscar
    maxOptions?: number;       // cuántas opciones devolver
    maxDiasConstruccion?: number; // límite de días al construir rangos
    isLaborable: (iso: string) => boolean;
    mesesYDiasUTC: (fecIngreso: string, fechaCorte: string) => { meses: number; dias: number };
    saldoYaIncluyeDescuento?: boolean;
}): Promise<OpcionVacaciones[]> {
    const {
        user,
        selectedRange,
        targetH,
        targetNH,
        isLaborable,
        mesesYDiasUTC,
        LOW = 2.65,
        HIGH = 2.85,
        searchRadiusDays = 45,
        maxOptions = 5,
        maxDiasConstruccion = 500,
        saldoYaIncluyeDescuento = false,
    } = params;

    const originalFechas = listDaysInclusive(selectedRange.from, selectedRange.to);
    const originalSet = new Set(originalFechas);
    const originalLen = originalFechas.length;

    const candidatos: OpcionVacaciones[] = [];

    // Generamos inicios cerca del inicio original:
    for (let shift = -searchRadiusDays; shift <= searchRadiusDays; shift++) {
        const start = addDaysUTC(selectedRange.from, shift);

        // Construye rango consecutivo que cumple EXACTO targetH/targetNH
        const built = construirRangoDesdeInicio({
            start,
            targetH,
            targetNH,
            isLaborable,
            maxDias: maxDiasConstruccion,
        });
        if (!built) continue;

        const dateRange: DateRange = { from: built.from, to: built.to };
        const fechas = built.fechas;
        const dayStats = built.dayStats;

        // 1) Recalcular info y saldos PARA ESTA OPCIÓN
        const dateRangeForInfo = { 
            from: toDateUTC(built.from), 
            to: toDateUTC(built.to) 
        };
        const info = await ObtenerInfo({ dateRange: dateRangeForInfo, user });

        // Nota: en tu código usas info.fecIngreso e info.FECHA_CORTE (respeto eso)
        const { meses, dias } = mesesYDiasUTC(info.fecIngreso, info.FECHA_CORTE);

        // En tu diseño, calcularSaldosVacaciones recibe dayStats (lo mantenemos)
        const { saldoH, saldoNH } = calcularSaldosVacaciones({ meses, dias, info, dayStats });

        // 2) Calcular saldo resultante (según cómo funcione tu calcularSaldosVacaciones)
        const saldoAfterH = saldoYaIncluyeDescuento ? saldoH : saldoH - targetH;
        const saldoAfterNH = saldoYaIncluyeDescuento ? saldoNH : saldoNH - targetNH;

        // 3) Validaciones duras
        if (saldoAfterH < 0 || saldoAfterNH < 0) continue; // excede saldo para este dateRange

        const ro = ratioEnRango(saldoAfterH, saldoAfterNH, LOW, HIGH);
        if (!ro.ok) continue;

        // 4) Overlap con lo que el usuario ya eligió (conservar la mayoría)
        const overlapCount = fechas.reduce((acc, f) => acc + (originalSet.has(f) ? 1 : 0), 0);
        const overlapPct = originalLen ? overlapCount / originalLen : 0;

        // Mensaje entendible para el usuario
        const message =
            `Opción válida ✅ Mantiene ${(overlapPct * 100).toFixed(0)}% de tus fechas ` +
            `y cumple el equilibrio de saldos.`;

        candidatos.push({
            dateRange,
            fechas,
            dayStats,
            saldoH,
            saldoNH,
            saldoAfterH,
            saldoAfterNH,
            ratioAfter: ro.ratio,
            overlapCount,
            overlapPct,
            ok: true,
            uiLevel: "warning", // normalmente lo muestras como "opción sugerida"
            message,
            porcentaje: (overlapPct * 100).toFixed(0),
        });
    }

    // Ranking: 1) más overlap, 2) más cercano al inicio original, 3) rangos más parecidos en tamaño
    candidatos.sort((a, b) => {
        const byOverlap = b.overlapPct - a.overlapPct;
        if (byOverlap !== 0) return byOverlap;

        const da = Math.abs(daysDiff(selectedRange.from, a.dateRange.from));
        const db = Math.abs(daysDiff(selectedRange.from, b.dateRange.from));
        if (da !== db) return da - db;

        const la = a.fechas.length;
        const lb = b.fechas.length;
        const dLenA = Math.abs(la - originalLen);
        const dLenB = Math.abs(lb - originalLen);
        if (dLenA !== dLenB) return dLenA - dLenB;

        return a.dateRange.from.localeCompare(b.dateRange.from);
    });

    // Unicidad por from-to y límite maxOptions
    const uniq: OpcionVacaciones[] = [];
    const seen = new Set<string>();
    for (const c of candidatos) {
        const key = `${c.dateRange.from}__${c.dateRange.to}`;
        if (seen.has(key)) continue;
        seen.add(key);
        uniq.push(c);
        if (uniq.length >= maxOptions) break;
    }

    return uniq;
}

// helper para ranking (diff en días, UTC)
function daysDiff(aISO: string, bISO: string) {
    const a = toDateUTC(aISO).getTime();
    const b = toDateUTC(bISO).getTime();
    return Math.round((b - a) / (24 * 60 * 60 * 1000));
}
