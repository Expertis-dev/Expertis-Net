import { Button } from "@/components/ui/button";
import { AlertTriangleIcon, DownloadIcon, FilterIcon } from "lucide-react";
import Link from "next/link";

export default function CasosPage() {
    return (
        <>
            
            <div className="flex flex-row justify-between">
                <div className="flex flex-col">
        
                    <h1 className="text-black text-xl font-semibold dark:text-gray-100">Casos Activos</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gestione y supervise los procedimientos disciplinarios en cusro y su historial</p>
                </div>
                <Link href={"/dashboard/amonestaciones/generacionAmonestacion"}>
                    <Button className="text-white hover:bg-blue-600 bg-blue-500">
                        + Abrir nuevo caso
                    </Button>
                </Link>
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-4 auto-cols-max gap-5 mt-2">
                {
                    [1, 2, 3, 4].map((v) => (
                        <div
                            key={v}
                            className="flex flex-col border border-gray-200 p-6 rounded-3xl dark:border-gray-700 dark:bg-zinc-900"
                        >
                            <div className="flex flex-row justify-between -mt-4 ">
                                <h3 className="font-light text-gray-600 self-center dark:text-gray-300">AMONESTACIONES ACTIVAS</h3>
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
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm mt-4 dark:border-gray-700 dark:bg-zinc-900">
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Listado de casos</h2>
                    <div className="flex flex-wrap gap-3">
                        <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                            <FilterIcon className="h-4 w-4" />
                            Filtros
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                            <DownloadIcon className="h-4 w-4" />
                            Exportar
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 justify-items-center dark:bg-zinc-950 dark:text-gray-400">
                    <p>Empleado</p>
                    <p>ID caso</p>
                    <p>Fecha Apertura</p>
                    <p>Ocurrencias</p>
                    <p>Nivel Sanción</p>
                    <p>Estado</p>
                    <p className="text-right">Acciones</p>
                </div>
                <div className="grid grid-cols-7 gap-2 px-6 py-4 text-sm text-gray-500 justify-items-center dark:text-gray-300">
                    <div className="flex flex-col text-black dark:text-gray-100">
                        <p className="font-bold">
                            Juan Pérez
                        </p>
                        <p>Desarrollo</p>
                    </div>
                    <p className="dark:text-gray-200">ID-CS-111-2026</p>
                    <p className="self-center text-black dark:text-gray-100">10 Oct 2023</p>
                    <div className="px-1 self-center">
                        <p className="py-1 px-2 bg-orange-200 text-orange-700 rounded-xl dark:bg-orange-400/20 dark:text-orange-200">8 Tardanzas</p>
                    </div>
                    <p className="self-center text-gray-400 dark:text-gray-400">Leve</p>
                    <div className="px-1 self-center">
                        <p className="py-1 px-2 bg-orange-500 text-white rounded-xl dark:bg-orange-500/80">AMON. ESCRITA</p>
                    </div>
                    <Link href={"/dashboard/amonestaciones/casos/detalle/1"}
                        className="text-blue-500 hover:underline self-center dark:text-blue-300"
                    >
                        Ver Detalle
                    </Link>
                </div>
                <div className="flex flex-row px-6 py-4 text-sm text-gray-500 bg-gray-100 justify-items-center dark:bg-zinc-950 dark:text-gray-400">
                    <p className="flex-5/6 self-center">Mostrando 1-5 de 24 casos</p>
                    <div className="flex flex-1/6 justify-between gap-4">
                        <Button className="bg-gray-50 border border-gray-50 h-7 text-black hover:bg-gray-300 hover:border hover:border-gray-400 dark:bg-zinc-900 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800">
                            Anterior
                        </Button>
                        <Button className="bg-gray-200 border border-gray-400 h-7 text-black hover:bg-gray-400 hover:border hover:border-gray-500 dark:bg-zinc-800 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700">
                            Siguiente
                        </Button>

                    </div>
                </div>
            </div>
        </>
    );
}
