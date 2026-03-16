import { Button } from "@/components/ui/button";
import { DownloadIcon, FilterIcon } from "lucide-react";
import Link from "next/link";

export default function AlertaIncidenciasPage() {
  return (
    <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row lg:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Incidencias encontradas en el mes</h1>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                        Gestione y supervise los procedimientos disciplinarios en curso y su historial
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm text-white">+ Registrar amonestacion</Button>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-zinc-900">
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Lista incidencia</h2>
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
                <div className="grid grid-cols-4 gap-2 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 justify-items-center dark:bg-zinc-950 dark:text-gray-400">
                    <p>Empleado</p>
                    <p>Fecha Apertura</p>
                    <p>Ocurrencias</p>
                    <p className="text-right">Acciones</p>
                </div>
                <div className="grid grid-cols-4 gap-2 px-6 py-4 text-sm text-gray-500 justify-items-center dark:text-gray-300">
                    <div className="flex flex-col text-black dark:text-gray-100">
                        <p className="font-bold">
                            Juan Pérez
                        </p>
                        <p>Desarrollo</p>
                    </div>
                    <p className="self-center text-black dark:text-gray-100">10 Oct 2023</p>
                    <div className="px-1 self-center">
                        <p className="py-1 px-2 bg-orange-200 text-orange-700 rounded-xl dark:bg-orange-400/20 dark:text-orange-200">Tardanzas</p>
                    </div>
                    <Link href={"/dashboard/"}
                        className="text-blue-500 hover:underline self-center dark:text-blue-300"
                    >
                        Ver Detalle
                    </Link>
                </div>
                <div className="flex flex-row px-6 py-4 text-sm text-gray-500 bg-gray-100 justify-items-center dark:bg-zinc-950 dark:text-gray-400">
                    <p className="flex-5/6 self-center">Mostrando 1-5 de 24 casos</p>
                    <div className="flex flex-1/6 justify-between gap-4">
                        <Button className="border border-blue-500 bg-white text-black hover:bg-blue-500 hover:text-white h-7 dark:bg-zinc-900 dark:text-gray-100 dark:border-blue-400 dark:hover:bg-blue-600">
                            Anterior
                        </Button>
                        <Button className="bg-blue-500 h-7 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700">
                            Siguiente
                        </Button>

                    </div>
                </div>
            </div>
        </div>
  );
}
