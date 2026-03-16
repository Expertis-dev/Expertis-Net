import { Button } from "@/components/ui/button";
import { CheckCircle2Icon, DownloadIcon, FileIcon, FileTextIcon, MaximizeIcon, PrinterIcon, SendHorizonalIcon } from "lucide-react";

export default function GeneracionAmonestacionPage() {
    const pdfUrl = "https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf";

    return (
        <>
            <div className="flex flex-row p-2 mb-4">
                <h1 className="font-semibold text-xl text-gray-900 dark:text-gray-100">Generacion Amonestación <span className="p-1 rounded-2xl bg-yellow-100 text-xs text-yellow-700 px-3 dark:bg-yellow-300/20 dark:text-yellow-200">BORRADOR</span></h1>
                <span className="flex-1" />
                <Button className="bg-blue-500 dark:text-white dark:hover:bg-blue-800">
                    <SendHorizonalIcon />
                    Generar Documento
                </Button>
            </div>
            <div className="grid grid-cols-3 grid-rows-2 gap-y-2 gap-x-1">
                <div className="col-span-2 row-span-2 px-2">
                    <div className="flex flex-col border border-gray-200 p-3 rounded-t-xl dark:border-gray-700 dark:bg-zinc-900">
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-row">
                                <FileTextIcon className="text-blue-500 dark:text-zinc-400" />
                                <p className="font-semibold self-center ml-1 text-gray-900 dark:text-gray-100">Vista previa del Documento</p>
                            </div>
                            {/* <div className="flex flex-row text-gray-500 gap-4">
                                <MaximizeIcon />
                                <PrinterIcon />
                                <DownloadIcon />
                            </div> */}
                        </div>
                    </div>
                    <div className="border border-gray-200 border-t-0 rounded-b-xl overflow-hidden bg-gray-50 h-[520px] dark:border-gray-700 dark:bg-zinc-950">
                        <object data={pdfUrl} type="application/pdf" className="w-full h-full">
                            <div className="flex items-center justify-center h-full text-sm text-gray-500 dark:text-gray-400">
                                <p>Vista previa no disponible. Descarga el PDF.</p>
                            </div>
                        </object>
                    </div>
                </div>
                <div className="col-span-1 row-span-1">
                    <div className="flex flex-col p-3 border rounded-xl shadow dark:border-gray-700 dark:bg-zinc-900">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Detalles de la infracción</p>
                        <div className="flex flex-row justify-between mt-3 border-b border-gray-300/70 pb-3.5 dark:border-gray-700">
                            <p className="text-gray-500 font-light text-sm dark:text-gray-400">Empleado</p>
                            <p className="text-gray-900 self-center text-sm dark:text-gray-100">Sebastian Guzman</p>
                        </div>
                        <div className="flex flex-row justify-between mt-3 border-b border-gray-300/70 pb-3.5 dark:border-gray-700">
                            <p className="text-gray-500 font-light text-sm dark:text-gray-400">Fecha Incidencia</p>
                            <p className="text-gray-900 self-center text-sm dark:text-gray-100"> 23 Mar 2026</p>
                        </div>
                        <div className="flex flex-row justify-between mt-3 border-b border-gray-300/70 pb-3.5 dark:border-gray-700">
                            <p className="text-gray-500 font-light text-sm dark:text-gray-400">Empleado</p>
                            <p className="text-orange-700 self-center text-sm bg-orange-200 px-2 rounded-sm dark:bg-orange-400/20 dark:text-orange-200">Tardanza</p>
                        </div>
                        <p className="text-gray-500 font-light text-sm mt-3 dark:text-gray-400">Regla Aplicada</p>
                        <div className="px-2 mt-1 bg-gray-200 rounded-sm dark:bg-zinc-800">
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                Regla: 4 tardanzas injustificadas en el mes
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-span-1 row-span-1 border rounded-xl shadow p-3 dark:border-gray-700 dark:bg-zinc-900">
                    <p className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Historial previo</p>
                    <div className="flex flex-col gap-y-5 mx-2">
                        <div className="flex flex-row">
                            <FileIcon className="p-1 bg-gray-300 rounded-sm text-gray-600 self-center dark:bg-zinc-800 dark:text-gray-300" size={25} />
                            <div className="flex flex-col ml-3">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Amonestacion escrita</p>
                                <p className="text-xs font-light text-gray-600 dark:text-gray-400">02 Ago 2023 - Ausencia</p>
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <CheckCircle2Icon className="p-1 bg-green-200 rounded-sm text-green-800 self-center dark:bg-green-400/20 dark:text-green-200" size={25} />
                            <div className="flex flex-col ml-3">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Amonestacion escrita</p>
                                <p className="text-xs font-light text-gray-600 dark:text-gray-400">02 Ago 2023 - Retraso leve</p>
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <CheckCircle2Icon className="p-1 bg-green-200 rounded-sm text-green-800 self-center dark:bg-green-400/20 dark:text-green-200" size={25} />
                            <div className="flex flex-col ml-3">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Amonestacion escrita</p>
                                <p className="text-xs font-light text-gray-600 dark:text-gray-400">02 Ago 2023 - Retraso leve</p>
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <CheckCircle2Icon className="p-1 bg-green-200 rounded-sm text-green-800 self-center dark:bg-green-400/20 dark:text-green-200" size={25} />
                            <div className="flex flex-col ml-3">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Amonestacion escrita</p>
                                <p className="text-xs font-light text-gray-600 dark:text-gray-400">02 Ago 2023 - Retraso leve</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}
