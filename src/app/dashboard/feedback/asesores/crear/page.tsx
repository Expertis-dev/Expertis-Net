import { HeaderCrearFbAsesor } from "@/components/feedback/asesor/crear/HeaderCrearFbAsesor";
import { Button } from "@/components/ui/button";
import { ArrowRight, InfoIcon, LockIcon, SearchIcon, SquareIcon } from "lucide-react";

export default function CrearFeedbackAsesorPage() {
    return (
        <div className="flex flex-col rounded-xs dark:text-zinc-100">
            <HeaderCrearFbAsesor />
            <div className="flex flex-col mt-4 p-2 border rounded-xs bg-white dark:bg-zinc-900 dark:border-zinc-700">
                <div className="flex flex-row p-4 justify-between">
                    <p className="font-semibold">
                        Matriz de Desempeño
                    </p>
                    <div className="flex flex-row">
                        <SquareIcon size={12} className="self-center text-gray-400 dark:text-zinc-500" />
                        <p className="text-[10px] self-center ml-1 dark:text-zinc-300">REAL</p>
                        <SquareIcon size={12} className="self-center text-gray-200 bg-gray-300 ml-8 dark:text-zinc-600 dark:bg-zinc-700" />
                        <p className="text-[10px] self-center ml-1 dark:text-zinc-300">META / PROMEDIO</p>
                    </div>
                </div>
                {/*//* Formulario  */}
                <div className="grid grid-cols-2 gap-2 p-2">

                    <div className="flex flex-col p-2">
                        <h4>Recupero Total</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-xs dark:border-zinc-600 dark:bg-zinc-900">
                                <p className="self-center text-gray-800 dark:text-zinc-200">S/</p>
                                <input type="number" step="0.01" min="0" placeholder="Actual" className="ml-1 w-full min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                            </div>
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-xs bg-gray-300 dark:border-zinc-600 dark:bg-zinc-700">
                                <p className="self-center text-gray-800 dark:text-zinc-200">S/</p>
                                <input type="number" step="0.01" min="0" placeholder="Meta" className="ml-1 w-full min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col p-2">
                        <h4>Ticket Promedio</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-xs dark:border-zinc-600 dark:bg-zinc-900">
                                <p className="self-center text-gray-800 dark:text-zinc-200">S/</p>
                                <input type="number" step="0.01" min="0" placeholder="Actual" className="ml-1 w-full min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                            </div>
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-xs bg-gray-300 dark:border-zinc-600 dark:bg-zinc-700">
                                <p className="self-center text-gray-800 dark:text-zinc-200">S/</p>
                                <input type="number" step="0.01" min="0" placeholder="Meta" className="ml-1 w-full min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col p-2">
                        <h4>Calidad PDP (%)</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-xs dark:border-zinc-600 dark:bg-zinc-900">
                                <input type="number" step="0.01" min="0" max="100" placeholder="Actual" className="ml-1 w-full min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                                <p className="self-center text-gray-800 dark:text-zinc-200">%</p>
                            </div>
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-xs bg-gray-300 dark:border-zinc-600 dark:bg-zinc-700">
                                <input type="number" step="0.01" min="0" max="100" placeholder="Meta" className="ml-1 w-full min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                                <p className="self-center text-gray-800 dark:text-zinc-200">%</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col p-2">
                        <h4>Calidad Cierre (%)</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-xs dark:border-zinc-600 dark:bg-zinc-900">
                                <input type="number" step="0.01" min="0" max="100" placeholder="Actual" className="ml-1 w-full min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                                <p className="self-center text-gray-800 dark:text-zinc-200">%</p>
                            </div>
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-xs bg-gray-300 dark:border-zinc-600 dark:bg-zinc-700">
                                <input type="number" step="0.01" min="0" max="100" placeholder="Meta" className="ml-1 w-full min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                                <p className="self-center text-gray-800 dark:text-zinc-200">%</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col p-2">
                        <h4>Producción PDP (Cant.)</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-xs dark:border-zinc-600 dark:bg-zinc-900">
                                <input type="number" placeholder="Actual" className="ml-1 w-full min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                            </div>
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-xs bg-gray-300 dark:border-zinc-600 dark:bg-zinc-700">
                                <input type="text" placeholder="Meta" className="ml-1 w-full min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col p-2">
                        <h4>Asistencia (Faltas/Tardanzas)</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-xs dark:border-zinc-600 dark:bg-zinc-900">
                                <input type="number" placeholder="Actual" className="ml-1 w-full min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                            </div>
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-xs bg-gray-300 dark:border-zinc-600 dark:bg-zinc-700">
                                <input type="text" placeholder="Meta" className="ml-1 w-full min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col rounded-xs dark:text-zinc-100">
                <div className="flex flex-col mt-4 p-2 border rounded-xs bg-white dark:bg-zinc-900 dark:border-zinc-700">
                    <h2 className="text-xl px-2 font-semibold mb-2">Observaciones Generales</h2>
                    <textarea
                        name="Compromiso de mejora" id="1" rows={6}
                        className="border text-[13px] border-gray-200 rounded-xs px-2 py-1 mx-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-none resize-y dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-200 dark:placeholder:text-zinc-400 dark:focus:ring-blue-500/30"
                        placeholder="Redacte aqui su compromiso de mejora en base a los datos mostrados"
                    />
                </div>
            </div>

            <div className="flex flex-col mt-4 p-2 border rounded-xs bg-white dark:bg-zinc-900 dark:border-zinc-700">
                <div className="flex flex-row justify-between p-2">
                    <div className="flex-row flex">
                        <InfoIcon className="self-center text-gray-500 dark:text-zinc-400" size={15} />
                        <p className="text-gray-500 ml-1 text-xs self-center dark:text-zinc-400">Los campos vacios se guardarán con valor 0</p>
                    </div>
                    <div className="flex flex-row justify-between">
                        <Button className="flex-1 bg-white text-black border border-gray-400 hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700">
                            Guardar Borrador
                        </Button>
                        <Button className="flex-1 ml-4 dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white">
                            Publicar Feedback
                            <ArrowRight />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

