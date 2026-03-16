import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";
import Link from "next/link";

export default function MisAmonestacionesPage() {
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-3 auto-cols-max gap-5 mt-2">
                {
                    [1, 2, 3].map((v) => (
                        <div
                            key={v}
                            className="flex flex-col border border-gray-200 p-6 rounded-3xl dark:border-gray-700 dark:bg-zinc-900"
                        >
                            <div className="flex flex-row justify-between -mt-4 ">
                                <h3 className="font-light text-gray-600 self-center dark:text-gray-300">Total registradas</h3>
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
                <div className="flex flex-col gap-4 border-b border-gray-200 px-3 py-3 lg:flex-row lg:items-center lg:justify-between dark:border-gray-700">

                </div>
                <div className="grid grid-cols-7 gap-2 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 justify-items-center dark:bg-zinc-950 dark:text-gray-400">
                    <p>Tipo</p>
                    <p>Razón/Categoria</p>
                    <p>Fecha</p>
                    <p>Estado</p>
                    <p>Categoria</p>
                    <p>Mes</p>
                    <p className="text-right">Acciones</p>
                </div>
                <div className="grid grid-cols-7 gap-2 px-6 py-4 text-sm text-gray-500 justify-items-center dark:text-gray-300">

                    <div className="px-1 self-center">
                        <div className="rounded-full border bg-yellow-200 flex flex-row px-2 dark:border-yellow-400/40 dark:bg-yellow-400/20">
                            <div className=" h-2 w-2 self-center bg-yellow-700 rounded-full dark:bg-yellow-300" />
                            <p className="px-2 self-center text-yellow-700 dark:text-yellow-200">Verbal</p>
                        </div>
                    </div>
                    <p className="font-semibold self-center text-gray-900 dark:text-gray-100">Asistencia Tardía</p>
                    <p className="self-center text-black dark:text-gray-100">10 Oct 2023</p>
                    <div className="px-1 self-center">
                        <p className="py-1 px-2 bg-green-200 text-green-700 rounded-xl dark:bg-green-400/20 dark:text-green-200">Notificada</p>
                    </div>
                    <div className="px-1 self-center">
                        <p className="py-1 px-2 bg-yellow-400 text-yellow-700 rounded-xl dark:bg-yellow-400/20 dark:text-yellow-200">Notificada</p>
                    </div>
                    <p className="self-center text-gray-900 dark:text-gray-100">Marzo</p>
                    <Link href={"/dashboard/"}
                        className="text-blue-500 hover:underline self-center dark:text-blue-300"
                    >
                        Ver Detalle
                    </Link>
                </div>
                <div className="flex flex-row px-6 py-4 text-sm text-gray-500 bg-gray-100 justify-items-center dark:bg-zinc-950 dark:text-gray-400">
                    <p className="flex-5/6 self-center">Mostrando 1-5 de 24 casos</p>
                    <div className="flex flex-1/6 justify-between gap-4">
                        <Button className="bg-gray-50 border border-gray-50 h-7 text-black dark:bg-zinc-900 dark:border-gray-700 dark:text-gray-100">
                            Anterior
                        </Button>
                        <Button className="bg-gray-200 border border-gray-400 h-7 text-black dark:bg-zinc-800 dark:border-gray-600 dark:text-gray-100">
                            Siguiente
                        </Button>

                    </div>
                </div>
            </div>
        </>
    );
}
