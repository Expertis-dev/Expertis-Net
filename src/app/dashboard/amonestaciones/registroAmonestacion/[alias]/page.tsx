import { FormRegistroAmonestacion } from "@/components/amonestaciones/registroAmonestacion/FormRegistroAmonestacion";
import { Incidencia } from "@/types/Incidencias";
import { AlertCircleIcon, ShieldCheckIcon, UserSearchIcon } from "lucide-react";

const incidenciasPorAlias = async (alias: string): Promise<Incidencia[]> => {
    const fecha = new Date()
    const month = fecha.getMonth() + 1
    const data: Incidencia[] = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reporteCruzadoPorEmp/${month}/${decodeURIComponent(alias)}`).then(res => res.json())
    const response = data.filter((v) => (v.esFalta === 1 || v.esTardanza === 1))
    return response;
}

interface Props {
    alias: string
}

export default async function RegistroAmonestacionPage({
    params,
}: {
    params: Promise<Props>
}) {
    const {alias} = await params
    const incidencias = await incidenciasPorAlias(alias)
    const nombreAsesor = decodeURIComponent(alias)
    return (
        <>
            <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Registro de Amonestación</h1>
                <p className="text-gray-400 text-xs dark:text-gray-400">Complete los detalles del incidente. El sistema vinculará automáticamente el caso</p>
            </div>
            <div className="grid grid-cols-1 gap-5 mt-4 lg:grid-cols-3">
                <div className="lg:col-span-2 flex flex-col gap-4">

                        <div className="flex flex-col p-3 border-2 border-blue-300/40 bg-blue-200/10 rounded-lg gap-2 shadow-xs dark:border-blue-400/30 dark:bg-blue-500/10">
                            <div>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <h2 className="text-lg flex-initial self-center text-gray-900 dark:text-gray-100">{nombreAsesor}</h2>
                                        <p className="flex-initial text-green-600 bg-green-500/20 p-1 self-center text-xs rounded-2xl px-2">ACTIVO</p>
                                    </div>
                                    {/* <Button className="text-xs flex-initial bg-white shadow text-red-500 hover:bg-red-100 w-full sm:w-auto dark:bg-zinc-900 dark:text-red-300 dark:hover:bg-red-500/10 dark:border dark:border-red-400/30">
                                        <XIcon className="text-xs" />
                                        Eliminar Empleado
                                    </Button> */}
                                </div>
                                <p className="font-light text-sm text-gray-800 dark:text-gray-200">Asesor de cobranza</p>
                                <p className="text-gray-400 text-xs dark:text-gray-400">{incidencias[0].agencia}</p>
                            </div>
                        </div>

                    <FormRegistroAmonestacion/>
                </div>
                <div className="lg:col-span-1 flex flex-col gap-3">
                    <div className="flex flex-col border-2 border-amber-200 bg-amber-100/30 rounded-lg p-4 gap-2 shadow dark:border-amber-400/30 dark:bg-amber-500/10">
                        <div className="flex flex-row text-amber-600 gap-2 dark:text-amber-300">
                            <ShieldCheckIcon />
                            <p className="text-xs self-center font-semibold ">ANALISIS INTELIGENTE</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Expediente #2026-004</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                            Se detectó un caso abierto. Esta entrada se vinculará como reincidencia
                        </p>
                        <div className="flex flex-col border bg-white rounded-sm px-3 py-3 border-amber-100 dark:border-amber-400/20 dark:bg-zinc-950">
                            <div className="flex flex-row justify-between">
                                <p className="text-xs font-light text-gray-800 dark:text-gray-200">Numero de incidencias</p>
                                <p className="text-xs text-amber-600 dark:text-amber-300"> Medio-Alto</p>
                            </div>
                            <div className="border-2 bg-amber-50 h-2 rounded-full dark:border-amber-400/30 dark:bg-amber-500/10">
                                <div className="h-full bg-amber-500 w-[66%] dark:bg-amber-300" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col border-2 shadow rounded-lg p-4 gap-8 flex-1 dark:border-zinc-700 dark:bg-zinc-900">
                        <h1 className="mb-1">
                            <p className="text-gray-400 font-semibold dark:text-gray-400">
                                HISTORIAL DEL CASO
                            </p>
                        </h1>
                        <div className="flex flex-row">
                            <div className="border w-6 h-6 rounded-full border-gray-300 flex justify-center dark:border-zinc-600">
                                <div className="w-3 h-3 bg-blue-600 rounded-full self-center" />
                            </div>

                            <div className="self-center">
                                <div className="flex flex-row">
                                    <div className="ml-2 text-xs bg-blue-100 px-1 rounded-sm dark:bg-blue-500/15">
                                        <h1 className="text-blue-600 dark:text-blue-200">NUEVO REGISTRO</h1>
                                    </div>
                                </div>
                                <p className="ml-2 text-sm text-gray-900 dark:text-gray-100">Amonestacion escrita</p>
                                <p className="ml-2 text-xs text-gray-400 dark:text-gray-400">Borrador Actual</p>
                            </div>
                        </div>
                        <div className="flex flex-row items-center">
                            <div className="w-6 h-6 flex justify-center">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full self-center dark:bg-yellow-300" />
                            </div>
                            <div className="flex-1 flex items-center justify-between">
                                <div className="self-center">
                                    <p className="ml-2 text-sm text-gray-900 dark:text-gray-100">Amonestacion escrita</p>
                                    <p className="ml-2 text-xs text-gray-400 dark:text-gray-400">Borrador Actual</p>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-400">22 feb 2026</p>
                            </div>
                        </div>
                        <div className="flex flex-row items-center">
                            <div className="w-6 h-6 flex justify-center">
                                <div className="w-3 h-3 bg-gray-400 rounded-full self-center dark:bg-zinc-500" />
                            </div>
                            <div className="flex-1 flex items-center justify-between">
                                <div className="self-center">
                                    <p className="ml-2 text-sm text-gray-900 dark:text-gray-100">Amonestacion Verbal </p>
                                    <p className="ml-2 text-xs text-gray-400 dark:text-gray-400">Borrador Actual</p>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-400">03 mar 2026</p>
                            </div>
                        </div>
                        <div className="flex flex-row items-center">
                            <div className="w-6 h-6 flex justify-center">
                                <div className="w-3 h-3 bg-gray-400 rounded-full self-center dark:bg-zinc-500" />
                            </div>
                            <div className="flex-1 flex items-center justify-between">
                                <div className="self-center">
                                    <p className="ml-2 text-sm text-gray-900 dark:text-gray-100">Amonestacion Verbal</p>
                                    <p className="ml-2 text-xs text-gray-400 dark:text-gray-400">Borrador Actual</p>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-400">12 mar 2026</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-linear-to-b from-blue-500 to-blue-700 flex flex-row p-4 rounded-xl dark:from-blue-600 dark:to-blue-900">
                        <div className="flex flex-col text-white">
                            <AlertCircleIcon />
                        </div>
                        <div className="flex flex-col px-3 gap-2">
                            <p className="text-white ">Política de reincidencia</p>
                            <p className="text-white font-extralight text-xs">
                                Al ser la tercera incidencia en 6 meses, este caso requiere aprobación del Director de RRHH antes de proceder con sanciones mayores
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

