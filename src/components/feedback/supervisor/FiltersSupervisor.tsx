'use client'

import { Empleado } from '@/types/feedback/interfaces'
import { Button } from '@/components/ui/button'
import { useCombobox } from '@/hooks/feedback/combobox'
import { SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useRef } from 'react'

interface Props {
    supervisores: Array<Empleado>
}

export const FiltersSupervisor = ({supervisores}: Props) => {
    const {
        filteredOptions,
        isOpen,
        setIsOpen,
        setQuery,
        query,
        containerRef,
        selectOption
    } = useCombobox<Empleado>({ 
        options: supervisores,
        getLabel: (asesor) => asesor.alias,
        filterOption: (asesor, query) =>
            asesor.alias.toLowerCase().includes(query)
    });
    const monthRef = useRef<HTMLInputElement>(null);
    const estadoRef = useRef<HTMLSelectElement>(null)
    const router = useRouter()

    const onClickSearch = () => {
        console.log(monthRef.current?.value)
        console.log(estadoRef.current?.selectedOptions[0].value)
        console.log(filteredOptions[0].alias)
        router.refresh()
    }
    return (
        <div className="rounded-sm flex flex-row md:flex-row items-center gap-2 border border-gray-200 px-2 mx-2 py-2 bg-white shadow dark:bg-zinc-800 dark:border-zinc-600">
            <div className="w-full md:w-auto flex flex-row flex-initial">
                <h2 className="self-center mr-2 font-light text-[14px]">Mes - Año: </h2>
                <input
                    type="month"
                    id="mes-anio"
                    className="rounded-sm dark:text-zinc-300 dark:bg-zinc-700 dark:border-zinc-600 md:w-max bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-2.5 outline-none transition-all h-8"
                    ref={monthRef}
                />
            </div>
            <hr className="border-gray-200 border h-10 w-0.5 dark:border-zinc-500" />
            <div className="flex flex-row flex-initial">
                <h4 className="self-center mr-2 font-light text-[14px]">Estado:</h4>
                <div className="relative">
                    <select
                        className="rounded-sm w-44 h-10 border dark:bg-zinc-600 dark:text-gray-200 dark:border-zinc-600 border-slate-200 bg-gray-50 pl-3 pr-9 text-sm text-slate-700 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:bg-gray-50 appearance-none cursor-pointer"
                        ref={estadoRef}
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="BORRADOR">Borrador</option>
                        <option value="PUBLICADO">Publicado</option>
                        <option value="LISTO_PARA_FIRMAR">Listo para firmar</option>
                        <option value="CERRADO">Cerrado</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
            <hr className="border-gray-200 border h-10 w-0.5 dark:border-zinc-500" />
            <div className="flex-1" ref={containerRef}>
                <div className="relative rounded-sm flex flex-row bg-gray-50 border dark:bg-zinc-600">
                    <SearchIcon className="self-center ml-2 mt-0.5 dark:text-white" size={18} />
                    <input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setIsOpen(true)
                        }}
                        onFocus={() => setIsOpen(true)}
                        className="w-full border-none bg-transparent px-2 py-2 text-sm outline-none dark:text-zinc-100 dark:placeholder:text-zinc-300"
                        placeholder="Buscar supervisor..."
                    />

                    {isOpen && (
                        <div className="absolute left-0 right-0 top-[110%] z-20 max-h-44 overflow-y-auto rounded-sm border border-gray-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((sup) => (
                                    <button
                                        key={sup.idEmpleado}
                                        type="button"
                                        onClick={() => {
                                            selectOption(sup)
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-gray-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                                    >
                                        {sup.alias}
                                    </button>
                                ))
                            ) : (
                                <p className="px-3 py-2 text-sm text-gray-500 dark:text-zinc-400">Sin resultados</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
                <Button className='bg-blue-500 hover:bg-blue-600 '
                    onClick={onClickSearch}
                >Buscar
                </Button>
        </div>
    )
}
