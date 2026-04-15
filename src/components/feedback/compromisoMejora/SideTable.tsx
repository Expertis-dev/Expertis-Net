import { CalendarIcon } from 'lucide-react'
import React from 'react'
export interface FeedbackSupervisor {
    idFeedBack:             number;
    USUARIO:                string;
    tipoEmpleado:           string;
    periodo:                Date;
    estadoFeedBack:         string;
    analisisResultados:     string;
    compromisoMejora:       null;
    resultadoEvaluacion:    ResultadoEvaluacion;
    tipoEvaluacion:         string;
    observacionesGenerales: null;
}

export interface ResultadoEvaluacion {
    recupero:          string;
    meta:              string;
    alcance:           string;
    efectividad:       string;
    montoPdp:          string;
    cierre:            string;
    calidad:           string;
    pagoDkPpc:         string;
    puntualidad:       string;
    puntualidadEquipo: string;
    ausentismoEquipo:  string;
}

interface Props{
    Feedback: FeedbackSupervisor
}

export const SideTable = ({Feedback}: Props) => {

    return (
        <div className="flex flex-col flex-2/5 max-w-[28%] mt-6">
            <div className="flex flex-row">
                <CalendarIcon className="text-blue-500 mr-1 mb-0.5" size={20} />
                <h1 className="text-xs self-center text-blue-600 font-bold">{(new Date(Feedback.periodo)).toLocaleDateString("es-ES", { month: "long", year: "numeric", timeZone: "UTC" })}</h1>
            </div>
            <h1 className="text-xl font-semibold dark:text-zinc-100">Resultados del Feedback</h1>
            <p className="text-gray-600 font-light dark:text-zinc-300">{Feedback.USUARIO}</p>
            <div className="flex flex-col pt-2">
                <div className="flex flex-row justify-between border border-e-gray-200 bg-gray-100 rounded-t-md px-2 py-1 dark:border-zinc-600 dark:bg-zinc-700">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Indicador</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Valor</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Recupero</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">S/ {Feedback.resultadoEvaluacion.recupero}</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Meta</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">S/ {Feedback.resultadoEvaluacion.meta}</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Alcance</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">{Feedback.resultadoEvaluacion.alcance} %</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Efectividad</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">{Feedback.resultadoEvaluacion.efectividad} %</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Monto PDP</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">S/ {Feedback.resultadoEvaluacion.montoPdp}</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">% Cierre</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">{Feedback.resultadoEvaluacion.cierre} %</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">% Calidad</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">{Feedback.resultadoEvaluacion.calidad} %</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Pago / DK PPC</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">{Feedback.resultadoEvaluacion.pagoDkPpc} %</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Puntualidad</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">{Feedback.resultadoEvaluacion.puntualidad}%</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Puntualidad - equipo</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">S/. 12,500</p>
                </div>
                <div className="flex flex-row justify-between px-2 py-1 border border-gray-200 dark:border-zinc-600">
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">Ausentismo - equipo</p>
                    <p className="font-light text-[15px] text-gray-800 dark:text-zinc-200">{Feedback.resultadoEvaluacion.ausentismoEquipo} %</p>
                </div>
            </div>
        </div>
    )
}
