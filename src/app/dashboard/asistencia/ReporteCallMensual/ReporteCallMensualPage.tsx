"use client"

import * as XLSX from "xlsx"
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { ReporteAsistencia } from './types';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/asistencia/ReporteCallMensual/Header';
import { CrossIcon, UmbrellaIcon, XIcon } from 'lucide-react';
import { saveAs } from "file-saver";

interface Props {
    data: ReporteAsistencia[]
    defaultFechaInicio: string,
    defaultFechaFin: string
}
export type FormValues = {
    asesor: string;
    agencia: string;
    fechaInicio: string;
    fechaFin: string;
};

const intervaloFechas = (fechaInicio: string, fechaFin: string): string[] => {
    if (!fechaInicio || !fechaFin) return [];

    const parseYmd = (value: string): Date | null => {
        const [y, m, d] = value.split("-").map(Number);
        if (!y || !m || !d) return null;
        const date = new Date(Date.UTC(y, m - 1, d));
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const formatYmd = (date: Date): string => {
        const y = date.getUTCFullYear();
        const m = String(date.getUTCMonth() + 1).padStart(2, "0");
        const d = String(date.getUTCDate()).padStart(2, "0");
        return `${d}-${m}-${y}`;
    };

    const start = parseYmd(fechaInicio);
    const end = parseYmd(fechaFin);
    if (!start || !end) return [];

    let from = start;
    let to = end;
    if (from.getTime() > to.getTime()) {
        [from, to] = [to, from];
    }

    const result: string[] = [];
    const current = new Date(from);
    const maxDays = 3700; // guardrail (~10 years)
    let safety = 0;

    while (current.getTime() <= to.getTime() && safety < maxDays) {
        result.push(formatYmd(current));
        current.setUTCDate(current.getUTCDate() + 1);
        safety += 1;
    }

    return result;
}

export const ReporteCallMensual = ({ data, defaultFechaFin, defaultFechaInicio }: Props) => {
    const router = useRouter()

    const reporteData = useMemo(
        () => Object.groupBy(data, ({ alias, agencia }) => `${alias}_${agencia}`),
        [data]
    );


    const { register, watch, setValue, reset } = useForm<FormValues>({
        defaultValues: {
            asesor: '',
            agencia: 'TODOS',
            fechaInicio: defaultFechaInicio,
            fechaFin: defaultFechaFin,
        },
    });


    const fechaFinW = watch("fechaFin")
    const fechaInicioW = watch("fechaInicio")

    const asesorW = watch("asesor")
    const agenciaW = watch("agencia")

    const listaFechas = useMemo(
        () => intervaloFechas(fechaInicioW, fechaFinW),
        [fechaInicioW, fechaFinW]
    );

    useEffect(() => {
        console.log(asesorW)
    }, [asesorW, agenciaW]);

    useEffect(() => {

    }, [reporteData])

    useEffect(() => {
        if (fechaFinW !== '' && fechaInicioW === '') {
            setValue("fechaInicio", fechaFinW)
        }

        const params = new URLSearchParams()
        params.append("fechaInicio", fechaInicioW)
        params.append("fechaFin", fechaFinW)

        router.push(`/dashboard/asistencia/ReporteCallMensual?${params.toString()}`)

    }, [fechaFinW, fechaInicioW, router, setValue])

    const limpiarFiltros = () => {
        reset({ agencia: 'TODOS', asesor: '', fechaFin: defaultFechaFin, fechaInicio: defaultFechaInicio })
    }

    const getAoaData = (): { aoaData: string[][]; merges: XLSX.Range[] } => {
        const columns: string[] = ["ASESOR"];
        const fechas = intervaloFechas(fechaInicioW, fechaFinW);
        columns.push(...fechas.map((f) => f.slice(0, 5)));

        const normalizeFecha = (value: string): string => {
            if (!value) return "";
            const datePart = value.split("T")[0];
            const parts = datePart.split("-");
            if (parts.length !== 3) return value;
            if (parts[0].length === 4) {
                const [y, m, d] = parts;
                return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
            }
            const [d, m, y] = parts;
            return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
        };

        const buildIngresoSalida = (item?: ReporteAsistencia): { ingreso: string; salida: string; merge: boolean } => {
            let ingreso = "";
            let salida = "";
            let merge = false;

            if (!item) {
                return { ingreso, salida, merge: true };
            }

            if (item.esFalta === 1) {
                ingreso = "F";
                merge = true;
            } else if (item.esAusenciaLaborable === 1) {
                ingreso = item.tipoAusencia === "DESCANSO MEDICO" || item.tipoAusencia === "SUBSIDIO" ? "DM" : "L";
                merge = true;
            } else if (item.esVacaciones === 1) {
                ingreso = "VAC";
                merge = true;
            } else if (item.esDiaLaborable === 0) {
                ingreso = "N/L";
                merge = true;
            } else {
                ingreso = item.horaIngreso?.slice(0, 5) || "";
                salida = item.horaSalida?.slice(0, 5) || "";
                const tags: string[] = [];
                if (item.esTardanza === 1) tags.push("T");
                if (item.hayJustificacion === 1) tags.push("J");
                const tagText = tags.length > 0 ? ` (${tags.join(",")})` : "";
                if (ingreso) ingreso = `${ingreso}${tagText}`;
            }

            if (item.hayJustificacion === 1 && ingreso && !ingreso.includes("J")) {
                ingreso = `${ingreso} (J)`;
            }

            if (!ingreso && !salida) merge = true;

            return { ingreso, salida, merge };
        };

        const rows: string[][] = [];
        const merges: XLSX.Range[] = [];

        Object.entries(reporteData)
            .filter(v => agenciaW === "TODOS" ? true : v[0].split("_")[1] === agenciaW)
            .filter(v => asesorW === "" ? true : v[0].split("_")[0].includes(asesorW))
            .forEach(([key, values]) => {
                const asesor = key.split("_")[0];
                const dateMap = new Map<string, ReporteAsistencia>();
                (values || []).forEach((item) => {
                    const normalized = normalizeFecha(item.fecha);
                    if (!dateMap.has(normalized)) {
                        dateMap.set(normalized, item);
                    }
                });

                const ingresoRow: string[] = [asesor];
                const salidaRow: string[] = [""];
                const startRowIndex = rows.length + 1; // +1 because header is row 0
                fechas.forEach((fecha, idx) => {
                    const item = dateMap.get(fecha);
                    const { ingreso, salida, merge } = buildIngresoSalida(item);
                    ingresoRow.push(ingreso);
                    salidaRow.push(salida);
                    if (merge) {
                        merges.push({
                            s: { r: startRowIndex, c: idx + 1 },
                            e: { r: startRowIndex + 1, c: idx + 1 }
                        });
                    }
                });

                rows.push(ingresoRow, salidaRow);
                merges.push({ s: { r: startRowIndex, c: 0 }, e: { r: startRowIndex + 1, c: 0 } });
            });

        return { aoaData: [columns, ...rows], merges };
    }

    const downloadExcel = () => {
        const { aoaData, merges } = getAoaData()


        const worksheetNegativo = XLSX.utils.aoa_to_sheet(aoaData);
        worksheetNegativo["!merges"] = merges;
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheetNegativo, "feedbacksSupervisores");

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataExcel = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(dataExcel, `reporte_asistencia.xlsx`);
    }

    return (
        <>
            <Header
                limpiarFiltros={limpiarFiltros}
                register={register}
                downloadExcel={downloadExcel}
            />
            {/* Tabla */}
            <div className='rounded-2xl bg-white dark:bg-slate-800'>
                <div className='overflow-auto max-h-[80vh]'>
                    <table className='w-max table-auto border-separate border-spacing-0 text-xs text-slate-900 dark:text-slate-100'>
                        <thead>
                            <tr className='text-[12px]'>
                                <th className='sticky left-0 top-0 z-30 bg-blue-100 text-blue-600 dark:text-white border border-slate-200 px-2 py-1 text-left font-semibold whitespace-nowrap dark:bg-blue-950 dark:border-slate-700'>
                                    Nombre Asesor
                                </th>
                                {
                                    listaFechas.map((v) => (
                                        <th key={v} className='sticky top-0 z-20 bg-blue-100 text-blue-600 dark:text-white font-bold border border-slate-200 px-2 py-1 text-center whitespace-nowrap dark:bg-blue-950 dark:border-slate-700'>
                                            {v.slice(0, 5)}
                                        </th>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody className='text-[11px]'>
                            {
                                Object.entries(reporteData)
                                    .filter(v => agenciaW === "TODOS" ? true : v[0].split("_")[1] === agenciaW)
                                    .filter(v => asesorW === "" ? true : (v[0].split("_")[0]).toLowerCase().includes(asesorW.toLowerCase()))
                                    .map((v) => (
                                        <tr className='odd:bg-slate-50 dark:odd:bg-slate-900/40' key={v[0]}>
                                            <th
                                                scope='row'
                                                className='sticky text-[11px] left-0 z-10 bg-white border border-slate-200 px-2 py-1 text-left font-medium whitespace-nowrap dark:bg-slate-900 dark:border-slate-700'
                                            >
                                                {v[0].split("_")[0]}
                                            </th>
                                            {
                                                v[1]?.map((v, ir) => {
                                                    const [dia, mes, year] = v.fecha.split("-")
                                                    const vfecha = new Date(+year, +mes - 1, +dia, 0, 0, 0, 0)
                                                    const fechaInicio = vfecha.toISOString().split("T")[0]
                                                    if (ir === 0 && listaFechas.slice(1).includes(`${dia}-${mes}-${year}`)) {
                                                        const cantDias = intervaloFechas(fechaInicio, fechaInicioW).slice(0, -1).length
                                                        return (
                                                            <td colSpan={cantDias} key={ir} className="relative bg-zinc-50 border-b border-zinc-200 space-y-2 dark:bg-slate-900/40 dark:border-slate-700">
                                                                <div
                                                                    className="absolute h-full inset-0 w-full rounded-sm border border-zinc-200 bg-[repeating-linear-gradient(135deg,#e5e7eb_0px,#e5e7eb_6px,#f9fafb_6px,#f9fafb_12px)] dark:border-slate-700 dark:bg-[repeating-linear-gradient(135deg,#334155_0px,#334155_6px,#0f172a_6px,#0f172a_12px)]"
                                                                />
                                                            </td>
                                                        )
                                                    } 
                                                })
                                            }
                                            {
                                                v[1]?.map((v) => {
                                                    return (
                                                        <td
                                                            className='relative border border-slate-200 px-2 py-1 whitespace-nowrap dark:border-slate-700'
                                                            key={v.alias + " " + v.fecha}
                                                        >
                                                            {
                                                                v.hayJustificacion === 1 ?
                                                                    <div className='absolute right-0 mr-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sky-600 px-1.5 text-[10px] font-extrabold leading-none text-white shadow-md dark:bg-sky-400'>
                                                                        J
                                                                    </div>
                                                                    :
                                                                    <></>
                                                            }
                                                            {
                                                                v.esFalta === 1 ?
                                                                    <XIcon className={`text-red-500 mx-auto ${v.hayJustificacion === 1 ? "ml-3" : ""}`} />
                                                                    :
                                                                    v.esAusenciaLaborable === 1 ?
                                                                        <div>
                                                                            <CrossIcon className='text-blue-400 mx-auto' />
                                                                            <p className='text-center text-blue-800 dark:text-blue-400'>{v.tipoAusencia === "DESCANSO MEDICO" || v.tipoAusencia === "SUBSIDIO" ? "DM" : "L"}</p>
                                                                        </div>
                                                                        :
                                                                        v.esVacaciones === 1 ?
                                                                            <UmbrellaIcon className='mx-auto text-sky-600' />
                                                                            :
                                                                            v.esDiaLaborable === 0 ?
                                                                                <div className='absolute inset-0 bg-zinc-100 dark:bg-zinc-600'>
                                                                                    <p className='text-center mt-[25%]'>N/L</p>
                                                                                </div>
                                                                                :
                                                                                <>
                                                                                    <div className={`text-center mr-1 ${v.hayJustificacion === 1 ? "mr-4 mt-1" : ""}`}>
                                                                                        <div className={`${v.esTardanza === 1 ? "bg-orange-200 rounded-2xl text-orange-800" : ""} px-1`}>
                                                                                            <p className=''>
                                                                                                {v.horaIngreso?.slice(0, 5)}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div>
                                                                                            <p>
                                                                                                {v.horaSalida?.slice(0, 5)}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                </>
                                                            }
                                                        </td>
                                                    )
                                                }
                                                )
                                            }
                                            {
                                                v[1]?.map((v, ir, arr) => {
                                                    const [dia, mes, year] = v.fecha.split("-")
                                                    const vfecha = new Date(+year, +mes - 1, +dia, 0, 0, 0, 0)
                                                    const fechaInicio = vfecha.toISOString().split("T")[0]
                                                    if (ir === arr.length - 1 && listaFechas.slice(1).includes(`${dia}-${mes}-${year}`)) {
                                                        const cantDias = intervaloFechas(fechaFinW, fechaInicio).slice(0, -1).length
                                                        return (
                                                            <td colSpan={cantDias} key={ir} className="relative bg-zinc-50 border-b border-zinc-200 space-y-2 dark:bg-slate-900/40 dark:border-slate-700">
                                                                <div
                                                                    className="absolute h-full inset-0 w-full rounded-sm border border-zinc-200 bg-[repeating-linear-gradient(135deg,#e5e7eb_0px,#e5e7eb_6px,#f9fafb_6px,#f9fafb_12px)] dark:border-slate-700 dark:bg-[repeating-linear-gradient(135deg,#334155_0px,#334155_6px,#0f172a_6px,#0f172a_12px)]"
                                                                />
                                                            </td>
                                                        )
                                                    } 
                                                })
                                            }
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
