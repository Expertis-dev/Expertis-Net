import { Input } from '@/components/ui/input'
import React from 'react'

export const FilterAsesor = () => {
    const sharedHeightClass = 'h-[34px]'

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 border border-gray-200 dark:border-zinc-700 px-2 py-2 bg-white shadow-sm dark:bg-zinc-800 mx-2 rounded-sm">
            <div className="">
                <input
                    type="month"
                    id="mes-anio"
                    className={`rounded-sm w-full md:w-max bg-gray-50 border dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-500 border-gray-200 text-gray-700 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-1.5 outline-none transition-all ${sharedHeightClass}`}
                />
            </div>

            <div className="flex-2">
                <Input
                    className={`rounded-sm w-full border-gray-200 bg-gray-50 dark:border-zinc-500 ${sharedHeightClass}`}
                    placeholder="Buscar Asesor..."
                />
            </div>
            <div className="w-full flex-1">
                <div className="relative">
                    <select
                        className={`rounded-sm dark:border-zinc-500 dark:bg-zinc-800 dark:text-gray-200 w-full bg-gray-50 text-slate-700 text-sm border border-gray-200 pl-4 pr-10 leading-normal transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none hover:bg-gray-100 ${sharedHeightClass}`}
                    >
                        <option value="todos">Todos los estados</option>
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
        </div>
    )
}
