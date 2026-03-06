import { Button } from '@/components/ui/button'
import { ArrowRightToLine, BarChartIcon, NotebookPenIcon } from 'lucide-react'
import React from 'react'

export const CompromisoPage = () => {
    return (
        <div className="flex flex-col flex-3/4">
            <div className="flex flex-col p-4 mx-5 bg-blue-50 rounded-md dark:bg-blue-950/30">
                <div className="flex flex-row">
                    <BarChartIcon className="text-blue-500 mr-1 mb-0.5" size={20} />
                    <h1 className="text-xs self-center text-black font-semibold dark:text-zinc-100">ANÁLISIS DE RESULTADOS</h1>
                </div>
                <hr className="my-1.5 border-gray-300 dark:border-zinc-600" />
                <p className="text-[13px] text-gray-700 dark:text-zinc-300">
                    El desempeño del equipo ha superado las expectativas en recuperación y
                    calidad. Sin embargo, la efectividad de contacto ha caído por debajo del
                    umbral crítico del 90%, lo que sugiere problemas en la segmentación de la
                    base de datos o en los horarios de llamada. Se requiere un plan de acción
                    específico para revertir la tendencia en Efectividad y Alcance durante el
                    próximo ciclo operativo.
                    El desempeño del equipo ha superado las expectativas en recuperación y
                    calidad. Sin embargo, la efectividad de contacto ha caído por debajo del
                    umbral crítico del 90%, lo que sugiere problemas en la segmentación de la
                    base de datos o en los horarios de llamada. Se requiere un plan de acción
                    específico para revertir la tendencia en Efectividad y Alcance durante el
                    próximo ciclo operativo.
                </p>
                <p className="text-gray-400 text-[9px] mt-2 dark:text-zinc-400">EMITIDO POR: JEFATURA DE OPERACIONES</p>
            </div>
            <div className="flex flex-col px-4 mt-2">
                <div className="flex flex-row mt-2">
                    <NotebookPenIcon className="text-blue-500 mr-1 mb-0.5" size={20} />
                    <h1 className="text-xs self-center text-blue-500 font-semibold text-[10px]">ACCIÓN REQUERIDA</h1>
                </div>
                <h1 className="font-bold text-xl dark:text-zinc-100">Compromiso de Mejora</h1>
                <p className="text-gray-700 dark:text-zinc-300">Basado en los resultados y el análisis superior, detalla  tu plan de acción para que el próximo periodo. Define objetivos accionables para las métricas que requieren atencion</p>
                <hr className="border-none py-2" />
                <p className="text-gray-700 dark:text-zinc-300">Plan de acción detallado: </p>
                <textarea
                    name="Compromiso de mejora" id="1" rows={6}
                    className="border-2 text-[13px] border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-none resize-y dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-200 dark:placeholder:text-zinc-400"
                    placeholder="Redacte aqui su compromiso de mejora en base a los datos mostrados"
                />
                <div className="flex flex-row self-end">
                    <Button className="mt-2 bg-blue-500 hover:bg-blue-900 rounded-md dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white">
                        Guardar y marcar listo
                        <ArrowRightToLine />
                    </Button>
                </div>
            </div>
        </div>
    )
}
