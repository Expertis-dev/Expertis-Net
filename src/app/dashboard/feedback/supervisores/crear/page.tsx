import { Button } from "@/components/ui/button";
import { ArrowLeft, CloudUpload, SaveIcon } from "lucide-react";
import Link from "next/link";

export default function CrearFeedbackSupervisorPage() {
    return (
        <>
            <Link className="flex flex-row text-gray-500 dark:text-gray-400 cursor-pointer" href={"/dashboard/feedback/supervisores"}>
                <ArrowLeft size={15} className="self-center" />
                <p className="text-xs font-light">Volver a feedbacks supervisor</p>
            </Link>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-gray-100">Creacion de evaluacion de supervisor</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Ingrese los resultados de objetivos y desempeno operativo</p>

            <div className="flex flex-row border border-gray-200 dark:border-gray-700 px-2 py-0.5 m-2 justify-around rounded-sm bg-white dark:bg-zinc-900">
                <div className="flex flex-col mb-0.5 flex-1 self-start">
                    <h3 className="text-gray-500 dark:text-gray-400 py-2 px-1 font-semibold">Supervisor</h3>
                    <div className="border border-gray-200 dark:border-gray-700 p-1 rounded-sm focus-within:ring-1 focus-within:ring-gray-300 dark:focus-within:ring-gray-600 bg-gray-50 dark:bg-zinc-800">
                        <select className="w-full bg-transparent text-sm px-1 py-1 rounded-sm outline-none cursor-pointer text-zinc-900 dark:text-gray-100">
                            <option>Selecciona un supervisor</option>
                            <option>Supervisor 1</option>
                            <option>Supervisor 1</option>
                            <option>Supervisor 1</option>
                            <option>Supervisor 1</option>
                            <option>Supervisor 1</option>
                        </select>
                    </div>
                </div>
                <div className="flex flex-col p-1 mb-0.5 flex-1">
                    <h3 className="text-gray-500 dark:text-gray-400 py-2 px-1 font-semibold">Periodo</h3>
                    <div className="border border-gray-200 dark:border-gray-700 p-1 rounded-sm -mt-1 focus-within:ring-1 focus-within:ring-gray-300 dark:focus-within:ring-gray-600 bg-gray-50 dark:bg-zinc-800">
                        <input type="month" className="w-full bg-transparent text-sm px-1 py-1 rounded-sm outline-none text-zinc-900 dark:text-gray-100" />
                    </div>
                </div>
                <div className="flex flex-col mb-0.5 flex-1">
                    <h3 className="text-gray-500 dark:text-gray-400 py-2 px-1 font-semibold">Tipo</h3>
                    <div className="border border-gray-200 dark:border-gray-700 p-1 rounded-sm focus-within:ring-1 focus-within:ring-gray-300 dark:focus-within:ring-gray-600 bg-gray-50 dark:bg-zinc-800">
                        <select className="w-full bg-transparent text-sm px-1 py-1 rounded-sm outline-none cursor-pointer text-zinc-900 dark:text-gray-100">
                            <option>Tipo de feedback</option>
                            <option>Rutina</option>
                            <option>Negativo</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="flex flex-row py-2 m-2">
                <div className="flex-2/3 border border-gray-200 dark:border-zinc-700 px-3 flex flex-col rounded-sm mr-2 border-b-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    <h2 className="text-xl my-1 border-b-2 border-gray-200 dark:border-zinc-700 w-[100%] py-3">Indicadores operativos</h2>
                    <div className="grid grid-cols-2 gap-1">
                        <div className="p-2">
                            <h4>Recupero Total</h4>
                            <div className="mt-1 flex flex-wrap gap-2">
                                <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                    <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">S/</p>
                                    <input type="number" step="0.01" placeholder="00.00" className="ml-1 w-full text-right min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                                </div>
                            </div>
                        </div>
                        <div className="p-2">
                            <h4>Meta</h4>
                            <div className="mt-1 flex flex-wrap gap-2">
                                <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                    <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">S/</p>
                                    <input type="number" step="0.01" placeholder="00.00" className="ml-1 w-full text-right min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                                </div>
                            </div>
                        </div>
                        <div className="p-2">
                            <h4>Monto PDP</h4>
                            <div className="mt-1 flex flex-wrap gap-2">
                                <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                    <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">S/</p>
                                    <input type="number" step="0.01" placeholder="00.00" className="ml-1 w-full text-right min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                                </div>
                            </div>
                        </div>
                        <div className="p-2">
                            <h4>Pago / DK PPC</h4>
                            <div className="mt-1 flex flex-wrap gap-2">
                                <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                    <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                    <input type="number" step="0.01" placeholder="00.00" className="ml-1 w-full text-right min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                                </div>
                            </div>
                        </div>
                        <div className="p-2">
                            <h4>Alcance</h4>
                            <div className="mt-1 flex flex-wrap gap-2">
                                <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                    <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                    <input type="number" step="0.01" placeholder="00.00" className="ml-1 w-full text-right min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                                </div>
                            </div>
                        </div>
                        <div className="p-2">
                            <h4>Alcance</h4>
                            <div className="mt-1 flex flex-wrap gap-2">
                                <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                    <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                    <input type="number" step="0.01" placeholder="00.00" className="ml-1 w-full text-right min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                                </div>
                            </div>
                        </div>
                        <div className="p-2">
                            <h4>Efectividad</h4>
                            <div className="mt-1 flex flex-wrap gap-2">
                                <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                    <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                    <input type="number" step="0.01" placeholder="00.00" className="ml-1 w-full text-right min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                                </div>
                            </div>
                        </div>
                        <div className="p-2">
                            <h4>% Cierre</h4>
                            <div className="mt-1 flex flex-wrap gap-2">
                                <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                    <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                    <input type="number" step="0.01" placeholder="00.00" className="ml-1 w-full text-right min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                                </div>
                            </div>
                        </div>

                        <div className="p-2">
                            <h4>% Calidad</h4>
                            <div className="mt-1 flex flex-wrap gap-2">
                                <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                    <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                    <input type="number" step="0.01" placeholder="00.00" className="ml-1 w-full text-right min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                                </div>
                            </div>
                        </div>
                        <div className="p-2">
                            <h4>Puntualidad - Equipo</h4>
                            <div className="mt-1 flex flex-wrap gap-2">
                                <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                    <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                    <input type="number" step="0.01" placeholder="00.00" className="ml-1 w-full text-right min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                                </div>
                            </div>
                        </div>
                        <div className="p-2">
                            <h4>Puntualidad</h4>
                            <div className="mt-1 flex flex-wrap gap-2">
                                <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                    <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                    <input type="number" step="0.01" placeholder="00.00" className="ml-1 w-full text-right min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                                </div>
                            </div>
                        </div>
                        <div className="p-2">
                            <h4>% Ausentismo</h4>
                            <div className="mt-1 flex flex-wrap gap-2">
                                <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                    <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                    <input type="number" step="0.01" placeholder="00.00" className="ml-1 w-full text-right min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col rounded-sm bg-white dark:bg-zinc-900 dark:border-zinc-700">
                        <h2 className="px-2 text-zinc-900 dark:text-zinc-100">Análisis de resultados</h2>
                        <textarea
                            name="Compromiso de mejora" id="1" rows={6}
                            className="border text-[13px] border-gray-200 rounded-sm px-2 py-1 mx-2 mt-1 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-none resize-y dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-200 dark:placeholder:text-zinc-400 dark:focus:ring-blue-500/30"
                            placeholder="Redacte aqui su compromiso de mejora en base a los datos mostrados"
                        />
                    </div>
                </div>


                <div className="flex-1/3 border self-start border-gray-200 dark:border-zinc-700 px-5 py-4 flex flex-col rounded-sm ml-2 bg-white dark:bg-zinc-900">
                    <h4 className="text-[18px] text-zinc-900 dark:text-zinc-100">Finalizar evaluación</h4>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">Confirme y verifique que todos los datos son correctos. El sistema procesará el análisis tras la publicación</p>
                    <Button className="mt-4">
                        <CloudUpload />
                        Subir evaluacion
                    </Button>
                    <Button className="my-2 bg-transparent text-black dark:text-zinc-100 border border-gray-500 dark:border-zinc-600 hover:bg-gray-200 dark:hover:bg-zinc-800">
                        <SaveIcon />
                        Guardar borrador
                    </Button>
                </div>
            </div>
        </>
    );
}

