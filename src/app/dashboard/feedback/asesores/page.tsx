import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AcroFormComboBox } from "jspdf";
import { DownloadIcon, SheetIcon } from "lucide-react";
import Link from "next/link";

export default function AsesoresPage() {
    return (
        <>
            {/*//* HEADER */}
            <div className="flex flex-row justify-between mb-3">
                <div className="flex flex-col">
                    <h1 className="text-xl">Historial de Feedback de Asesores</h1>
                    <p className="text-[15px]">Revise y extraiga evaluaciones históricas de desempeño de todos los asesores</p>
                </div>
                <div className="flex flex-auto justify-end">
                    <Button className="mr-2.5 bg-green-600 mt-1" >
                        <SheetIcon />
                        Exportar a Excel
                    </Button>
                    <Link
                        href={"/dashboard/"}
                    >
                        <Button className="bg-blue-600 mt-1">
                            <h2>+</h2>
                            <h2>Nueva Entrada</h2>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* // Filtro */}
            <div className="flex flex-col md:flex-row items-center gap-4 border border-gray-200 rounded-2xl p-3 bg-white shadow-sm">
                <div className="w-full md:w-auto">
                    <input
                        type="month"
                        id="mes-anio"
                        className="w-full md:w-max bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-2.5 outline-none transition-all"
                    />
                </div>

                <div className="w-full">
                    <Input
                        className="w-full border-gray-200 rounded-xl focus-visible:ring-indigo-500 bg-gray-50"
                        placeholder="Buscar Asesor..."
                    />
                </div>
                <div className="w-full md:max-w-[200px]">
                    <div className="relative">
                        <select
                            className="w-full bg-gray-50 text-slate-700 text-sm border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none hover:bg-gray-100"
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="rutina">Rutina</option>
                            <option value="negativo">Negativo</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            {/* Tabla */}
            <div className="w-full border border-gray-200 rounded-lg overflow-hidden mt-2">
                <div className="hidden md:grid grid-cols-5 bg-gray-100 font-bold px-3 py-0.5 border-b border-gray-200">
                    <div>Asesor</div>
                    <div>Tipo Evaluación</div>
                    <div>Tipo Periodo</div>
                    <div>Estado</div>
                    <div>Acciones</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 px-3 py-0.5 items-center border-b hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between md:block">
                        <span>Ana Martinez</span>
                    </div>
                    <div className="flex justify-between md:block">
                        <span>Rutina</span>
                    </div>
                    <div className="flex justify-between md:block">
                        <span>2026-1</span>
                    </div>
                    <div className="flex justify-between md:block">
                        <span className="text-green-600 font-medium text-sm">Publicada</span>
                    </div>
                    <div className="flex justify-between md:block">
                        <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
                            <DownloadIcon />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 px-3 py-0.5 items-center border-b hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between md:block">
                        <span>Ana Martinez</span>
                    </div>
                    <div className="flex justify-between md:block">
                        <span>Rutina</span>
                    </div>
                    <div className="flex justify-between md:block">
                        <span>2026-1</span>
                    </div>
                    <div className="flex justify-between md:block">
                        <span className="text-green-600 font-medium text-sm">Publicada</span>
                    </div>
                    <div className="flex justify-between md:block">
                        <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
                            <DownloadIcon />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}