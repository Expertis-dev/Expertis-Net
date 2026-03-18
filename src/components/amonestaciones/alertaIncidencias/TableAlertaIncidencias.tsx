"use client"
import { Incidencia } from '@/types/Incidencias'
import { DetailIncidenciaModal } from '@/components/amonestaciones/alertaIncidencias/detail-modal'
import { Button } from '@/components/ui/button'
import { useUser } from '@/Provider/UserProvider'
import Link from 'next/link'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'

interface Props {
    incidencias: Incidencia[]
}

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

export const TableAlertaIncidencias = ({ incidencias }: Props) => {
    const user = useUser()
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
    const [form, setForm] = useState({
        nombreAsesor: "",
        tipoIncidencia: "TODOS"
    })
    const [pagination, setPagination] = useState({
        starts: 0,
        end: 10,
    })
    const onChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
        e.preventDefault()
        setForm({
            ...form,
            [e.target.name]: e.target.value.toLocaleUpperCase()
        })
    }

    const incidenciasGrupo = useMemo(() =>
        incidencias
            .filter(i => colaboradores.some((c) => c.usuario === i.alias))
            .map(v => ({ ...v, tipoIncidencia: v.hayJustificacion === 1 ? "JUSTIFICADO" : "DETECTADA" }))
            .filter((v) => v.alias.includes(form.nombreAsesor))
            .filter((v) => form.tipoIncidencia === "TODOS" || v.tipoIncidencia === form.tipoIncidencia)
            ,
        [incidencias, colaboradores, form])

    const [selectedRow, setSelectedRow] = useState<Incidencia | null>(null)


    useEffect(() => {
        const usuario = user.user?.usuario
        if (!usuario) return

        const fetchColab = async (aliasAsesor: string): Promise<Colaborador[]> => {
            const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerListaColaboradores`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ usuario: aliasAsesor })
            }).then(res => res.json())
            return data
        }

        fetchColab(usuario).then(setColaboradores)
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

    return (
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
                        <Link href={"/dashboard/amonestaciones/registroAmonestacion"}>
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
                            className='w-[20%] border border-neutral-300 py-1 px-3 rounded-xl'
                        />
                        <div className='flex flex-row gap-5 ml-5'>
                            {
                            Object.keys(TipoIncidencia).map((v) => (
                            <button
                                key={v}
                                name={v}
                                className={`px-2 border rounded-xl ${form.tipoIncidencia === v ? "bg-zinc-300 dark:bg-zinc-500" : "dark:bg-zinc-800"} dark:hover:bg-zinc-500 cursor-pointer `}
                                onClick={(e) => {
                                        setPagination({starts: 0, end: 10})
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
                <div className="grid grid-cols-5 gap-2 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 justify-items-center dark:bg-zinc-950 dark:text-gray-400">
                    <p>Empleado</p>
                    <p>Fecha</p>
                    <p>tipo</p>
                    <p>Tipo incidencia</p>
                    <p className="text-right">Acciones</p>
                </div>

                {
                    incidenciasGrupo.filter((v) => v.alias.includes(form.nombreAsesor)).filter((j, i) => pagination.starts <= i && i < pagination.end).map((j, i) => {
                        const fecha = new Date();
                        const [dia, mes, anio] = j.fecha.split("-")
                        fecha.setDate(+dia)
                        fecha.setMonth(+mes - 1)
                        fecha.setFullYear(+anio)
                        return (
                            <div
                                key={`${j.alias}_${j.agencia}_${j.fecha}_${i}`}
                                className={`grid grid-cols-5 px-6 py-2 text-sm text-gray-500 dark:text-gray-300 border-b ${selectedRow !== j ? "hover:dark:bg-neutral-800 hover:bg-gray-300" : ""} ${selectedRow === j ? "dark:bg-slate-900 bg-blue-200" : ""}`}
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
                                    j.esTardanza === 1 ?
                                        <p className='justify-self-center self-center'>TARDANZA</p> : j.esFalta === 1 ? <p className='justify-self-center self-center font-bold'>FALTA</p> : <></>
                                }
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
    )
}
