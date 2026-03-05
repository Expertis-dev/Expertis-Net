import { Input } from '@/components/ui/input'
import React from 'react'

export const FilterAsesor = () => {
    return (
        <div className="flex flex-col md:flex-row items-center gap-4 border border-gray-200 rounded-2xl p-3 bg-white shadow-sm">
            <div className="w-full md:w-auto">
                <input
                    type="month"
                    id="mes-anio"
                    className="w-full md:w-max bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-2.5 outline-none transition-all"
                />
            </div>

            <div className="w-full">
                <Input
                    className="w-full border-gray-200 rounded-xl focus-visible:ring-indigo-500 bg-gray-50"
                    placeholder="Buscar Asesor..."
                />
            </div>
            <div className="w-full md:max-w-[200px]">
                <div className="relative">
                    <select
                        className="w-full bg-gray-50 text-slate-700 text-sm border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none hover:bg-gray-100"
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
