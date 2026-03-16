import { AlertTriangleIcon, Calendar, ChartNoAxesCombinedIcon, EyeIcon, Gavel, HammerIcon, LineChartIcon, LucideCalendarDays, TimerOffIcon, TrendingUp } from "lucide-react";

export default function DetalleCasoPage() {
    return (
        <>
            <div className="flex flex-col border border-gray-200 rounded-xl p-3 dark:border-gray-700 dark:bg-zinc-900">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Sebastian Guzman</h1>
                <p className="text-gray-500 dark:text-gray-400">Desarrollador - ID: 1111</p>
            </div>
            <div className="grid grid-cols-3 grid-rows-4 gap-5 mt-5 items-stretch">
                <div className="row-span-1 h-full">
                    <div className="flex flex-col rounded-xl border border-gray-200 p-4 h-full dark:border-gray-700 dark:bg-zinc-900">
                        <h2 className="font-light text-sm text-gray-600 dark:text-gray-300">TOTAL AMONESTACIONES</h2>
                        <p className="font-bold text-2xl my-3 text-gray-900 dark:text-gray-100">4</p>
                        <p className="text-gray-400 font-light mb-3 dark:text-gray-400">Acumuladas este mes</p>
                    </div>
                </div>
                <div className="row-span-1 h-full bg-radial ">
                    <div className="flex flex-col bg-linear-to-r from-white from-60% to-orange-600/10 to-100%  rounded-xl border border-gray-200 p-4 h-full dark:border-gray-700 dark:from-zinc-900 dark:to-orange-500/10">
                        <div className="flex flex-row">
                            <AlertTriangleIcon className="text-orange-600" />
                            <h2 className="ml-2 font-light text-sm self-center text-gray-700 dark:text-gray-200">TIPO AMONESTACION</h2>
                        </div>
                        <p className="font-semibold text-2xl mt-6 text-orange-600">TARDANZA</p>
                    </div>
                </div>
                <div className="row-span-1 h-full">
                    <div className="flex flex-col rounded-xl border border-gray-200 p-4 h-full dark:border-gray-700 dark:bg-zinc-900">
                        <div className="flex flex-row">
                            <LucideCalendarDays className="text-blue-600" />
                            <h2 className="ml-2 font-light text-sm self-center text-gray-700 dark:text-gray-200">MES DE REVISIÓN</h2>
                        </div>
                        <p className="font-semibold text-2xl my-3 text-gray-900 dark:text-gray-100">Marzo 2026</p>
                    </div>
                </div>
                <div className="row-span-3 col-span- p-5 border rounded-xl border-gray-200 dark:border-gray-700 dark:bg-zinc-900">
                    <div className="flex flex-row gap-2 mb-6">
                        <ChartNoAxesCombinedIcon className="text-blue-600" />
                        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Progreso de Sanciones</h2>
                    </div>
                    <div className="rounded-full border-10 border-orange-600 w-35 h-35 justify-self-center mt-15">
                        <div className="flex flex-col items-center my-4 mt-8">
                            <h2 className="text-3xl font-bold ">
                                4 <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/7</span>
                            </h2>
                            <p className="text-gray-500 text-xs dark:text-gray-400">INCIDENTES</p>
                        </div>
                    </div>
                    <p className="text-base text-gray-700 text-center my-4 w-40 mx-auto dark:text-gray-300">
                        Haz alcanzado el <span className="text-red-600 font-semibold">57%</span> del límite de tolerancia para rescisión contractual
                    </p>
                    <div className="flex flex-col mb-4">
                        <div className="flex flex-row justify-between text-sm">
                            <p className="text-gray-800 dark:text-gray-200">Tardanzas Injustificadas</p>
                            <p>4/7</p>
                        </div>
                        <div className="w-full bg-gray-100 h-3 rounded-full dark:bg-zinc-800">
                            <div className="w-[60%] bg-orange-400 h-full rounded-full" />
                        </div>
                    </div>
                    <div className="flex flex-col mb-4">
                        <div className="flex flex-row justify-between text-sm">
                            <p className="text-gray-800 dark:text-gray-200">Tardanzas Justificadas</p>
                            <p>1</p>
                        </div>
                        <div className="w-full bg-gray-100 h-3 rounded-full dark:bg-zinc-800">
                            <div className="w-[50%] bg-green-600 h-full rounded-full" />
                        </div>
                    </div>
                </div>
                <div className="row-span-3 col-span-2 border rounded-2xl p-5 flex flex-col h-full dark:border-gray-700 dark:bg-zinc-900">
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">Historial de incidentes</h2>
                    <div className="mt-3 grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] place-items-center gap-3 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 text-center dark:bg-zinc-950 dark:text-gray-400">
                        <p>Tipo incidente</p>
                        <p>Fecha</p>
                        <p>Minutos</p>
                        <p>Registrado por</p>
                        <p>Accion</p>
                    </div>
                    <div className="mt-2 grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] place-items-center gap-3 px-3 py-2 text-sm text-center">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center rounded-sm bg-red-100 p-1 text-red-600 dark:bg-red-500/15 dark:text-red-300">
                                <Gavel />
                            </span>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">Amon. Escrita</p>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">22 Mar 2026</p>
                        <div className="inline-flex items-center gap-1 rounded-full bg-yellow-200 px-2 py-0.5 w-fit whitespace-nowrap justify-self-center dark:bg-yellow-400/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-600 dark:bg-yellow-300"></span>
                            <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-200">15 min</span>
                        </div>
                        <p className="text-gray-700 justify-self-center dark:text-gray-200">MELINA</p>
                        <div className="flex justify-center justify-self-center">
                            <EyeIcon className="text-gray-500 dark:text-gray-300" />
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] place-items-center gap-3 px-3 py-2 text-sm text-center">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center rounded-sm bg-orange-100 p-1 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300">
                                <TimerOffIcon />
                            </span>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">Amon. Verbal</p>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">22 Mar 2026</p>
                        <div className="inline-flex items-center gap-1 rounded-full bg-yellow-200 px-2 py-0.5 w-fit whitespace-nowrap justify-self-center dark:bg-yellow-400/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-600 dark:bg-yellow-300"></span>
                            <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-200">15 min</span>
                        </div>
                        <p className="text-gray-700 justify-self-center dark:text-gray-200">MELINA</p>
                        <div className="flex justify-center justify-self-center">
                            <EyeIcon className="text-gray-500 dark:text-gray-300" />
                        </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-gray-200 pt-3 text-sm dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">Pagina 1 de 4</p>
                        <div className="flex flex-row gap-3">
                            <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                                Anterior
                            </button>
                            <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="mt-4">
                <p className="text-end text-gray-600 hover:underline cursor-pointer text-xs dark:text-gray-400">Descargar reporte pdf</p>
            </footer>
        </>
    );
}
