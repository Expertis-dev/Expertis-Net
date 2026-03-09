import { CalendarIcon } from 'lucide-react'
import React from 'react'

export const SideTable = () => {
    return (
        <div className="flex flex-col flex-2/5 max-w-[28%]">
            <div className="flex flex-row">
                <CalendarIcon className="text-blue-500 mr-1 mb-0.5" size={20} />
                <h1 className="text-xs self-center text-blue-600 font-bold">Marzo 2026</h1>
            </div>
            <h1 className="text-xl font-semibold dark:text-zinc-100">Resultados del Feedback</h1>
            <p className="text-gray-600 font-light dark:text-zinc-300">Sebastian Guzmán</p>
            <div className="flex flex-col pt-2">
                <div className="flex flex-row justify-between border border-e-gray-200 bg-gray-100 rounded-t-md px-2 py-1 dark:border-zinc-600 dark:bg-zinc-700">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Indicador</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Valor</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Recupero</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">S/. 12,500</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Meta</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">S/. 13,000</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Alcance</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">92%</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Efectividad</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">0.29%</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Monto PDP</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">S/. 45,200</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">% Cierre</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">12.5%</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">% Calidad</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">98.2%</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Pago / DK PPC</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">28.5 %</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Puntualidad</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">S/. 12,500</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Puntualidad - equipos</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">S/. 12,500</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Ausentismo - equipo</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">97%</p>
                </div>
            </div>
        </div>
    )
}
