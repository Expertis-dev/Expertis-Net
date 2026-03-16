import { Button } from "@/components/ui/button";
import { AlertCircleIcon, SaveIcon, ShieldCheckIcon, ShieldPlusIcon, UploadCloudIcon, UserSearchIcon, XIcon } from "lucide-react";
import Link from "next/link";

export default function RegistroAmonestacionPage() {
    return (
        <>
            <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Registro de Amonestación</h1>
                <p className="text-gray-400 text-xs dark:text-gray-400">Complete los detalles del incidente. El sistema vinculará automáticamente el caso</p>
            </div>
            <div className="grid grid-cols-1 gap-5 mt-4 lg:grid-cols-3">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="border border-gray-200 flex flex-col p-4 rounded-2xl shadow dark:border-gray-700 dark:bg-gray-900">
                        <p className="font-semibold text-lg rounded-2xl text-gray-900 dark:text-gray-100">Empleado Implicado</p>
                        <div className="flex flex-row mt-4 p-3 border rounded-lg gap-2 shadow-xs dark:border-gray-700 dark:bg-gray-950">
                            <UserSearchIcon className="text-sky-400" />
                            <p className="text-gray-900 dark:text-gray-100">Sebastian Guzman</p>
                        </div>
                        <div className="flex flex-col my-4 p-3 border-2 border-blue-300/40 bg-blue-200/10 rounded-lg gap-2 shadow-xs dark:border-blue-400/30 dark:bg-blue-500/10">
                            <div>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <h2 className="text-lg flex-initial self-center text-gray-900 dark:text-gray-100">Sebastian Guzmán</h2>
                                        <p className="flex-initial text-green-600 bg-green-500/20 p-1 self-center text-xs rounded-2xl px-2">ACTIVO</p>
                                    </div>
                                    <Button className="text-xs flex-initial bg-white shadow text-red-500 hover:bg-red-100 w-full sm:w-auto dark:bg-gray-900 dark:text-red-300 dark:hover:bg-red-500/10 dark:border dark:border-red-400/30">
                                        <XIcon className="text-xs" />
                                        Eliminar Empleado
                                    </Button>
                                </div>
                                <p className="font-light text-sm text-gray-800 dark:text-gray-200">Asesor de cobranza</p>
                                <p className="text-gray-400 text-xs dark:text-gray-400">Agencia BPO</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border shadow rounded-2xl dark:border-gray-700 dark:bg-gray-900">
                        <h1 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Detalle del incidente</h1>
                        <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                            <div className="flex flex-col flex-1 gap-2">
                                <p className="text-gray-900 dark:text-gray-100">Tipo de Amonestacion</p>
                                <select name="tipoAmonestacion" id="1" className="py-2 px-4 border border-gray-300 rounded-lg w-full dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">
                                    <option value="tardanza">Tardanza injustificada</option>
                                    <option value="tardanza justificada">Tardamza justificada</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-900 dark:text-gray-100">Fecha del incidente</p>
                                <input type="month" className="mt-2 border border-gray-300 rounded-lg py-1.5 px-2 w-full dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100" />
                            </div>
                        </div>
                        <div className="flex flex-col mt-2 gap-2">
                            <p className="text-gray-900 dark:text-gray-100">Descripcion de los Hechos</p>
                            <textarea name="Descripcion" id="desc" cols={10} className="border border-gray-300 rounded-lg py-1 px-2 min-h-[120px] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100" placeholder="Describa detalladamente lo sucedido..." />
                            <p className="text-xs text-gray-500 dark:text-gray-400">Sea objetivo y preciso. Evite opinciones personales</p>
                            <p className="text-gray-900 dark:text-gray-100">Evidencia adjunta</p>
                            <label
                                htmlFor="evidencia"
                                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600 transition hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:bg-blue-500/10"
                            >
                                <UploadCloudIcon className="text-blue-500" />
                                <span className="font-medium text-gray-700 dark:text-gray-100">Arrastra y suelta un archivo</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">o haz clic para seleccionar</span>
                                <input id="evidencia" type="file" accept="image/*,.pdf" className="sr-only" />
                            </label>
                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-2">
                                <Button className="bg-white border border-gray text-black hover:bg-gray-300 w-full sm:w-auto dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">Cancelar</Button>
                                <Link href={"/dashboard/amonestaciones/generacionAmonestacion"}>
                                    <Button className="bg-blue-500 hover:bg-blue-800 w-full sm:w-auto">
                                        <SaveIcon />
                                        Registrar Amonestacion
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
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
                        <div className="flex flex-col border bg-white rounded-sm px-3 py-3 border-amber-100 dark:border-amber-400/20 dark:bg-gray-950">
                            <div className="flex flex-row justify-between">
                                <p className="text-xs font-light text-gray-800 dark:text-gray-200">Numero de incidencias</p>
                                <p className="text-xs text-amber-600 dark:text-amber-300"> Medio-Alto</p>
                            </div>
                            <div className="border-2 bg-amber-50 h-2 rounded-full dark:border-amber-400/30 dark:bg-amber-500/10">
                                <div className="h-full bg-amber-500 w-[66%] dark:bg-amber-300" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col border-2 shadow rounded-lg p-4 gap-8 flex-1 dark:border-gray-700 dark:bg-gray-900">
                        <h1 className="mb-1">
                            <p className="text-gray-400 font-semibold dark:text-gray-400">
                                HISTORIAL DEL CASO
                            </p>
                        </h1>
                        <div className="flex flex-row">
                            <div className="border w-6 h-6 rounded-full border-gray-300 flex justify-center dark:border-gray-600">
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
                                <div className="w-3 h-3 bg-gray-400 rounded-full self-center dark:bg-gray-500" />
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
                                <div className="w-3 h-3 bg-gray-400 rounded-full self-center dark:bg-gray-500" />
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

