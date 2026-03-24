"use client"
import { Incidencia } from '@/types/Incidencias'
import { DetailIncidenciaModal } from '@/components/amonestaciones/alertaIncidencias/detail-modal'
import { Button } from '@/components/ui/button'
import { useUser } from '@/Provider/UserProvider'
import Link from 'next/link'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'

interface Props { }

export interface Colaborador {
    Id: number;
    usuario: string;
    idEmpleado: number;
    dni: string;
}

enum TipoIncidencia {
    TODOS = "TODOS",
    DETECTADA = "DETECTADA",
    JUSTIFICADO = "JUSTIFICADO",
    CERRADO = "CERRADO"
}

export const TableAlertaIncidencias = () => {
    const user = useUser()
    const [incidencias, setIncidencias] = useState<Incidencia[]>([])
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        nombreAsesor: "",
        tipoIncidencia: "TODOS"
    })
    const [pagination, setPagination] = useState({
        starts: 0,
        end: 10,
    })
    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setForm({
            ...form,
            [e.target.name]: e.target.value.toLocaleUpperCase()
        })
    }

    const incidenciasGrupo = useMemo(() =>
        incidencias
            .map(v => ({ ...v, tipoIncidencia: v.hayJustificacion === 1 ? "JUSTIFICADO" : "DETECTADA" }))
            .filter((v) => v.alias.includes(form.nombreAsesor))
            .filter((v) => form.tipoIncidencia === "TODOS" || v.tipoIncidencia === form.tipoIncidencia)
        ,
        [incidencias, form])

    const [selectedRow, setSelectedRow] = useState<Incidencia | null>(null)


    useEffect(() => {
        const usuario = user.user?.usuario
        if (!usuario) return

        const fetchData = async () => {
            setLoading(true)
            try {
                // 1. Obtener lista de colaboradores del usuario
                const colabs: Colaborador[] = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/obtenerListaColaboradores`,
                    {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ usuario })
                    }
                ).then(res => res.json())

                const losAlias = colabs.map(c => c.usuario)

                // 2. Traer incidencias del grupo usando el nuevo endpoint
                const now = new Date()
                const year = now.getFullYear()
                const month = String(now.getMonth() + 1).padStart(2, '0')
                const fechaCorte = `${year}-${month}-01`

                const data: Incidencia[] = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/incidencias/corte/${fechaCorte}/grupo`,
                    {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ losAlias })
                    }
                ).then(res => res.json())

                setIncidencias(data.filter(j => j.esFalta === 1 || j.esTardanza === 1))
            } catch (err) {
                console.error("Error al cargar incidencias:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user.user?.usuario])


    const onClickNext = () => {
        let aument = 10;
        if (incidenciasGrupo.length - pagination.end <= 0) aument = 0;
        setPagination({
            ...pagination,
            starts: pagination.starts + aument,
            end: pagination.end + aument
        })
    }

    const onClickPrev = () => {
        let decrent = 10;
        if (pagination.starts === 0) decrent = 0;
        setPagination({
            ...pagination,
            starts: pagination.starts - decrent,
            end: pagination.end - decrent
        })
    }

    const [modal, setModal] = useState<{ isOpen: boolean; incidencia: Incidencia | null }>({
        isOpen: false,
        incidencia: null,
    })

    const transFormFecha = (fecha: string) => {
        const [dia, mes, ano] = fecha.split("-");
        return `${mes}-${dia}-${ano}`
    }

    // Cálculo de ocurrencias por empleado+tipo sobre lista ordenada por fecha ascendente
    const incidenciasConOcurrencia = useMemo(() => {
        const sortedAsc = [...incidenciasGrupo]
            .sort((a, b) => new Date(transFormFecha(a.fecha)).getTime() - new Date(transFormFecha(b.fecha)).getTime());

        const counter: Record<string, number> = {};
        return sortedAsc.map((j) => {
            const tipo = j.esTardanza === 1 ? "TARDANZA" : j.esFalta === 1 ? "FALTA" : "OTRO";
            const key = `${j.alias}__${tipo}`;
            counter[key] = (counter[key] ?? 0) + 1;
            return { ...j, _occurrenceNum: counter[key], _tipo: tipo };
        });
    }, [incidenciasGrupo]);

    return (
        <>
            {loading && (
                <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                    <svg className="animate-spin h-6 w-6 mr-3 text-blue-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Cargando incidencias...
                </div>
            )}
            {!loading && (
                <>
                    <div className="flex flex-col gap-4 sm:flex-row lg:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Incidencias encontradas en el mes</h1>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                Gestione y supervise los procedimientos disciplinarios en curso y su historial
                            </p>
                        </div>
                        {
                            (selectedRow) ?
                                <Link href={`/dashboard/amonestaciones/registroAmonestacion/${selectedRow.alias}`}>
                                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm text-white">+ Registrar amonestacion</Button>
                                </Link>
                                :
                                <></>
                        }
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-zinc-900">
                        <div className="flex flex-col gap-1 border-b border-gray-200 px-6 py-5 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Lista incidencias</h2>
                            <div className="flex flex-row">
                                <input
                                    placeholder='Buscar por nombre asesor'
                                    onChange={onChange}
                                    type="text"
                                    name="nombreAsesor"
                                    value={form.nombreAsesor}
                                    className='w-[25%] border border-neutral-300 py-1 px-3 rounded-xl'
                                />
                                <span className='flex-1' />
                                <div className='flex flex-row flex-wrap gap-2 ml-4 rounded-2xl bg-gray-100 p-1 dark:bg-zinc-800'>
                                    {
                                        Object.keys(TipoIncidencia).map((v) => (
                                            <button
                                                key={v}
                                                name={v}
                                                type="button"
                                                aria-pressed={form.tipoIncidencia === v}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60
                                    ${form.tipoIncidencia === v
                                                        ? "bg-white text-gray-900 border-gray-200 shadow-sm dark:bg-zinc-900 dark:text-gray-100 dark:border-zinc-700"
                                                        : "bg-transparent text-gray-600 border-transparent hover:text-gray-900 hover:bg-white/70 dark:text-gray-300 dark:hover:text-white dark:hover:bg-zinc-700"
                                                    }`}
                                                onClick={(e) => {
                                                    setPagination({ starts: 0, end: 10 })
                                                    setForm({ ...form, tipoIncidencia: e.currentTarget.name })
                                                }}
                                            >
                                                {v}
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-6 gap-2 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 justify-items-center dark:bg-zinc-950 dark:text-gray-400">
                            <p>Empleado</p>
                            <p>Fecha</p>
                            <p>Tipo</p>
                            <p>Ocurrencia</p>
                            <p>Estado</p>
                            <p className="text-right">Acciones</p>
                        </div>

                        {
                            incidenciasConOcurrencia
                                .filter((v) => v.alias.includes(form.nombreAsesor))
                                .sort((a, b) => new Date(transFormFecha(b.fecha)).getTime() - new Date(transFormFecha(a.fecha)).getTime())
                                .filter((_j, i) => pagination.starts <= i && i < pagination.end)
                                .map((j, i) => {
                                    const fecha = new Date();
                                    const [dia, mes, anio] = j.fecha.split("-")
                                    fecha.setDate(+dia)
                                    fecha.setMonth(+mes - 1)
                                    fecha.setFullYear(+anio)

                                    // Etiqueta de ocurrencia con sufijo ordinal en español
                                    const n = j._occurrenceNum;
                                    const suffix = n === 1 ? "ra" : n === 2 ? "da" : n === 3 ? "ra" : "ta";
                                    const tipoLabel = j._tipo === "TARDANZA" ? "Tardanza" : j._tipo === "FALTA" ? "Falta" : "";
                                    const occurrenceLabel = `${n}${suffix} ${tipoLabel}`;

                                    // Verde 1-3 | Ámbar 4-6 | Rojo 7+
                                    const occurrenceColor =
                                        n <= 3
                                            ? "bg-green-100 text-green-700 dark:bg-green-400/20 dark:text-green-300"
                                            : n <= 6
                                                ? "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300"
                                                : "bg-red-100 text-red-700 dark:bg-red-400/20 dark:text-red-300";

                                    return (
                                        <div
                                            key={`${j.alias}_${j.agencia}_${j.fecha}_${i}`}
                                            className={`grid grid-cols-6 px-6 py-2 text-sm text-gray-500 dark:text-gray-300 border-b ${selectedRow !== j ? "hover:dark:bg-neutral-800 hover:bg-gray-300" : ""} ${selectedRow === j ? "dark:bg-slate-900 bg-blue-200" : ""}`}
                                            onClick={() => {
                                                if (j.hayJustificacion === 1) return;
                                                setSelectedRow(j)
                                            }}
                                        >
                                            <div className="flex flex-col text-black dark:text-gray-100">
                                                <p className="font-bold">
                                                    {j.alias}
                                                </p>
                                                <p>{user.user?.usuario || "null"}</p>
                                            </div>
                                            <p className="self-center justify-self-center text-black dark:text-gray-100">{fecha.toLocaleDateString("es-ES")}</p>
                                            {
                                                j.esTardanza === 1 ? (
                                                    <div className='justify-self-center self-center text-center'>
                                                        <p className='font-medium'>TARDANZA</p>
                                                        <p className='text-xs text-orange-500 dark:text-orange-400 font-semibold'>
                                                            {j.minutosTardanza >= 60
                                                                ? `${Math.floor(j.minutosTardanza / 60)}h ${String(j.minutosTardanza % 60).padStart(2, '0')}min`
                                                                : `${j.minutosTardanza} min`}
                                                        </p>
                                                    </div>
                                                ) : j.esFalta === 1 ? (
                                                    <p className='justify-self-center self-center font-bold'>FALTA</p>
                                                ) : <></>
                                            }
                                            <div className="self-center justify-self-center">
                                                <span className={`py-1 px-2 rounded-xl text-xs font-semibold whitespace-nowrap ${occurrenceColor}`}>
                                                    {occurrenceLabel}
                                                </span>
                                            </div>
                                            <div className="px-1 self-center justify-self-center">
                                                <p className={`py-1 px-2 
                                    ${(j.hayJustificacion === 1) ?
                                                        "bg-green-200 text-green-700 dark:bg-green-400/20 dark:text-green-200" : "bg-orange-200 text-orange-700 dark:bg-orange-400/20 dark:text-orange-200"}
                                    rounded-xl`
                                                }>{(j.hayJustificacion === 1) ? "JUSTIFICADO" : "DETECTADA"}</p>
                                            </div>
                                            <Button
                                                className="bg-transparent hover:bg-transparent dark:bg-zinc-900 shadow-none text-blue-500 hover:underline self-center dark:text-blue-300 justify-self-center"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setModal({ isOpen: true, incidencia: j })
                                                    if (j.hayJustificacion === 1) return;
                                                    setSelectedRow(j)
                                                }}
                                            >
                                                Ver Detalle
                                            </Button>
                                        </div>
                                    )
                                })
                        }
                        <div className="flex flex-row px-6 py-4 text-sm text-gray-500 bg-gray-100 justify-items-center dark:bg-zinc-950 dark:text-gray-400">
                            <p className="flex-5/6 self-center">Mostrando {pagination.starts + 1}-{pagination.end} de {incidenciasGrupo.length} casos</p>
                            <div className="flex flex-1/6 justify-between gap-4">
                                <Button className="border border-blue-500 bg-white text-black hover:bg-blue-500 hover:text-white h-7 dark:bg-zinc-900 dark:text-gray-100 dark:border-blue-400 dark:hover:bg-blue-600"
                                    onClick={onClickPrev}
                                >
                                    Anterior
                                </Button>
                                <Button className="bg-blue-500 h-7 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
                                    onClick={onClickNext}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DetailIncidenciaModal
                        isOpen={modal.isOpen}
                        onClose={() => setModal({ isOpen: false, incidencia: null })}
                        incidencia={modal.incidencia}
                    />
                </>
            )}
        </>
    )
}
