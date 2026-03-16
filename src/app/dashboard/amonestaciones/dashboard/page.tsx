import { Button } from "@/components/ui/button";
import { AlertTriangleIcon, BellIcon, CalendarIcon, DownloadIcon, FilterIcon } from "lucide-react";
import Link from "next/link";

export default function AmonestacionesDashboardPage() {
    return (
        <>
            <div className="flex-row flex justify-between">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Resumen de Amonestaciones</h1>
                    <p className="text-sm text-gray-400 dark:text-gray-400">Gestión de sanciones disciplinarias y cumplimiento normativo</p>
                </div>
                <div className="flex flex-row mt-4 p-2.5 bg-white border border-gray-200 rounded-2xl dark:bg-zinc-900 dark:border-gray-700">
                    <CalendarIcon className="text-gray-600 dark:text-gray-300" />
                    <p className="ml-2 text-gray-600 dark:text-gray-300">
                        {new Date().toLocaleString("sv-SE", { timeZone: "America/Lima" })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 auto-cols-max gap-5 mt-2">
                {
                    [1, 2, 3].map((v) => (
                        <div
                            key={v}
                            className="flex flex-col border border-gray-200 p-6 rounded-3xl dark:border-gray-700 dark:bg-zinc-900"
                        >
                            <div className="flex flex-row justify-between -mt-4 ">
                                <h3 className="font-light text-gray-600 self-center dark:text-gray-300">Amonestaciones Activas</h3>
                                <div className="bg-blue-200 p-2 rounded-xl max-h-10.5 dark:bg-blue-500/20">
                                    <AlertTriangleIcon
                                        className="self-center text-blue-500 dark:text-blue-300"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-row pb-3 gap-3">
                                <p className="text-4xl text-gray-900 dark:text-gray-100">9</p>
                                <span className="inline-flex items-center rounded-3xl border border-gray-200 bg-gray-50 px-2.5 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-zinc-950 dark:text-gray-200">
                                    -1%
                                </span>
                            </div>
                            <p className="font-extralight text-sm text-gray-700 dark:text-gray-300">Total</p>
                        </div>
                    ))
                }
            </div>
            <div className="grid gap-5 my-4 grid-cols-3">
                <div className="col-span-2">
                    <div className="flex flex-row items-center justify-between mb-3">
                        <h2 className="text-2xl text-gray-900 dark:text-gray-100">Actividad reciente</h2>
                        <button className="text-blue-600 hover:underline">Ver Todo</button>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-2xl flex flex-col gap-4 dark:border-gray-700 dark:bg-zinc-900">
                        {
                            [1, 2, 3, 4].map((v, i) => (
                                <div className="flex flex-row" key={v}>
                                    <div className="flex flex-col">
                                        <div className="inline-flex text-blue-400 p-1 bg-blue-100 m-1 rounded-full max-h-8 dark:bg-blue-500/15 dark:text-blue-300">
                                            <BellIcon size={24}
                                                className="self-center"
                                            />
                                        </div>
                                        {
                                            i != 3 ?
                                                <div className="border w-0 border-gray-400 relative h-8 mt-0.5 -mb-4 mx-auto dark:border-gray-600" />
                                                :
                                                <></>
                                        }
                                    </div>
                                    <div className="flex flex-col text-[15px] ml-4">
                                        <h1 className="text-gray-900 dark:text-gray-100">Amonestación verbal registrada</h1>
                                        <p className="text-gray-400 dark:text-gray-400">Empleado: <span className="text-gray-600 font-semibold dark:text-gray-200">Sebastian Guzman</span> - siempre llega temprano</p>
                                    </div>

                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col p-3 bg-blue-600 rounded-xl gap-2 dark:bg-blue-700">
                        <h3 className="text-white ">Reporte mensual</h3>
                        <p className="text-white font-extralight text-sm text-wrap ">Genera el resumen de incidencias para la reunión de directivos</p>
                        <Button className="text-blue-500 bg-white hover:bg-blue-200">
                            <DownloadIcon className="text-blue-600" />
                            Descargar PDF
                        </Button>
                    </div>
                    <div className="flex flex-col p-3 rounded-xl gap-2 border border-gray-200 shadow dark:border-gray-700 dark:bg-zinc-900">
                        <h3 className="text-black dark:text-gray-100">Reporte mensual</h3>
                        <div>
                            <div className="flex flex-row justify-between">
                                <h4 className="font-light text-xs text-gray-700 dark:text-gray-300">Operaciones</h4>
                                <p className="font-semibold text-xs text-gray-900 dark:text-gray-100">50%</p>
                            </div>
                            <div className="w-auto h-2 rounded-full bg-gray-200 mt-0.5 overflow-hidden dark:bg-zinc-800">
                                <div className="w-[50%] bg-blue-500 h-full rounded-full" />
                            </div>
                        </div>
                        <div>
                            <div className="flex flex-row justify-between">
                                <h4 className="font-light text-xs text-gray-700 dark:text-gray-300">Finanzas</h4>
                                <p className="font-semibold text-xs text-gray-900 dark:text-gray-100">30%</p>
                            </div>
                            <div className="w-auto h-2 rounded-full bg-gray-200 mt-0.5 overflow-hidden dark:bg-zinc-800">
                                <div className="w-[30%] bg-cyan-500 h-full rounded-full" />
                            </div>
                        </div>
                        <div>
                            <div className="flex flex-row justify-between">
                                <h4 className="font-light text-xs text-gray-700 dark:text-gray-300">Operaciones</h4>
                                <p className="font-semibold text-xs text-gray-900 dark:text-gray-100">15%</p>
                            </div>
                            <div className="w-auto h-2 rounded-full bg-gray-200 mt-0.5 overflow-hidden dark:bg-zinc-800">
                                <div className="w-[15%] bg-violet-500 h-full rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
