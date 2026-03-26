'use client'

import { Empleado } from '@/types/feedback/interfaces'
import { Button } from '@/components/ui/button'
import { useCombobox } from '@/hooks/feedback/combobox'
import { useUser } from '@/Provider/UserProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRef } from 'react'


interface Props {
    asesores: Array<Empleado>
    defaultValues?: Values
}

interface Values {
    asesor?: string,
    filtroMes?: string,
    tipoEvaluacion?: string,
}

export const FilterAsesor = ({ asesores, defaultValues }: Props) => {
    const toMonthValue = (value?: string) => {
        if (!value) return ""
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return ""
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, "0")
        return `${year}-${month}`
    }

    const {
        filteredOptions: filteredAsesores,
        isOpen: isAsesorOpen,
        setIsOpen: setIsAsesorOpen,
        setQuery: setAsesorQuery,
        query: asesorQuery,
        containerRef: asesorRef,
        selectOption
    } = useCombobox<Empleado>({
        options: asesores,
        getLabel: (asesor) => asesor.alias,
        filterOption: (asesor, query) =>
            asesor.alias.toLowerCase().includes(query),
        initialQuery: defaultValues?.asesor
    })
    const { user } = useUser()
    const router = useRouter()
    const monthRef = useRef<HTMLInputElement>(null)
    const tipoRef = useRef<HTMLSelectElement>(null)
    const searchParams = useSearchParams()
    const params = searchParams.entries()

    const onClickSearch = async () => {
        const urlParams = new URLSearchParams()
        if (!!monthRef.current?.value) {
            const codMes = (new Date(monthRef.current?.value)).toISOString()
            urlParams.set("filtroMes", codMes)
        }
        if (!!tipoRef.current?.selectedOptions[0].value && tipoRef.current?.selectedOptions[0].value !== "todos") urlParams.set("tipoEvaluacion", tipoRef.current?.selectedOptions[0].value );
        if (filteredAsesores.length === 1) urlParams.set("asesor", String(filteredAsesores[0].alias));
        urlParams.set("usuario", user?.usuario || "");
        router.push(`/dashboard/feedback/asesores?${urlParams.toString()}`)
    }

    const onChangePeriodo = () => {
        const urlParams = new URLSearchParams(params.toArray())
        if (!!monthRef.current?.value) {
            const codMes = (new Date(monthRef.current?.value)).toISOString()
            urlParams.set("filtroMes", codMes)
        }else {
            urlParams.set("filtroMes", "")
        }
        router.push(`/dashboard/feedback/asesores?${urlParams.toString()}`)
    }

    const onChangeAsesor = (value: string) => {
        const urlParams = new URLSearchParams(params.toArray())
        if (!!value) {
            urlParams.set("asesor", String(value))
        } else {
            urlParams.set("asesor", "")
        }
        router.push(`/dashboard/feedback/asesores?${urlParams.toString()}`)
    }

    const onChangeTipoEvaluacion = () => {
        const urlParams = new URLSearchParams(params.toArray())
        if (tipoRef.current?.selectedOptions[0].value !== "todos") {
            urlParams.set("tipoEvaluacion", String(tipoRef.current?.selectedOptions[0].value))
        } else {
            urlParams.set("tipoEvaluacion", "")
        }
        router.push(`/dashboard/feedback/asesores?${urlParams.toString()}`)
    }

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 border border-gray-200 dark:border-zinc-700 px-2 py-2 bg-white shadow-sm dark:bg-zinc-800 mx-2 rounded-sm">
            <div className="">
                <input
                    type="month"
                    id="mes-anio"
                    className={`rounded-sm w-full md:w-max bg-gray-50 border dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-500 border-gray-200 text-gray-700 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-1.5 outline-none transition-all h-8.5`}
                    ref={monthRef}
                    onChange={() => {
                        onChangePeriodo()
                    }}
                    defaultValue={toMonthValue(defaultValues?.filtroMes)}
                />
            </div>

            <div className="flex-2 w-full" ref={asesorRef}>
                <div className="relative">
                    <input
                        value={asesorQuery}
                        onChange={(e) => {
                            setAsesorQuery(e.target.value)
                            setIsAsesorOpen(true)
                            onChangeAsesor(e.target.value)
                        }}
                        onFocus={() => setIsAsesorOpen(true)}
                        className="rounded-sm w-full border border-gray-200 bg-gray-50 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200 h-8.5 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="TODOS LOS ASESORES"
                    />

                    {isAsesorOpen && (
                        <div className="absolute z-20 mt-1 w-full max-h-44 overflow-y-auto rounded-sm border border-gray-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900">
                            {filteredAsesores.length > 0 ? (
                                filteredAsesores.map((asesor) => (
                                    <button
                                        key={asesor.idEmpleado}
                                        type="button"
                                        onClick={() => {
                                            selectOption(asesor)
                                            onChangeAsesor(asesor.alias)
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-gray-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                                    >
                                        {asesor.alias}
                                    </button>
                                ))
                            ) : (
                                <p className="px-3 py-2 text-sm text-gray-500 dark:text-zinc-400">Sin resultados</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="w-full flex-1">
                <div className="relative">
                    <select
                        className={`rounded-sm dark:border-zinc-500 dark:bg-zinc-800 dark:text-gray-200 w-full bg-gray-50 text-slate-700 text-sm border border-gray-200 pl-4 pr-10 leading-normal transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none hover:bg-gray-100 h-8.5`}
                        ref={tipoRef}
                        onChange={onChangeTipoEvaluacion}
                        value={defaultValues?.tipoEvaluacion}
                    >
                        <option value="todos">Todos</option>
                        <option value="rutina">Rutina</option>
                        <option value="negativo">Negativo</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
            <div className="w-full md:w-auto">
                <Button className={`w-full rounded-sm h-8.5 bg-blue-500 hover:bg-blue-600`}
                    onClick={onClickSearch}
                >
                    Buscar
                </Button>
            </div>
        </div>
    )
}
