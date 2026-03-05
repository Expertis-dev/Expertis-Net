import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrainIcon, SearchIcon, SheetIcon } from "lucide-react";
import Link from "next/link";

export default function SupervisoresPage() {
    return (
        <>
            <div className="flex flex-row justify-between mb-1">
                <div className="flex flex-col gap-1 text-gray-900">
                    <h1 className="text-2xl font-bold leading-tight text-zinc-800 dark:text-gray-300">
                        Feedbacks supervisores
                    </h1>
                    <h3 className="text-[13px] text-zinc-500 mt-[-4]">
                        Flujo maestro de firmas, análisis de resultados y validación operativa
                    </h3>
                </div>
                <div className="flex flex-auto justify-end">
                    <Button className="mr-2.5 bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-700 hover:bg-zinc-800 text-xs h-8 mt-3" >
                        <BrainIcon />
                        Generar Análisis de resultados
                    </Button>
                    <Button className="mr-2.5 bg-green-600 dark:text-gray-300 dark:hover:bg-green-900 hover:bg-green-500 text-xs h-8 mt-3" >
                        <SheetIcon className="text-gray-50" />
                        Exportar a Excel
                    </Button>
                    <Link
                        href={"/dashboard/"}
                    >
                        <Button className="bg-blue-600 dark:text-gray-300 dark:hover:bg-blue-900 hover:bg-blue-500 text-xs h-8 mt-3">
                            <h2>+</h2>
                            <h2>Nueva Entrada</h2>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* //* CARDS */}
            <div className="flex flex-row mb-2">
                <div className="border h-auto flex-1 mx-2 flex flex-row">
                    <div className="h-auto bg-gray-500 w-1" />
                    <div className="flex flex-col ml-4 my-1">
                        <p className="text-[15px] my-1 font-semibold text-gray-500">Total evaluados</p>
                        <div className="flex flex-row">
                            <h4 className="text-2xl mr-1 font-semibold">12</h4>
                            <h5 className="text-xs self-center">Supervisores</h5>
                        </div>
                    </div>
                </div>
                <div className="border h-auto flex-1 mx-2 flex flex-row">
                    <div className="h-auto bg-orange-500 w-1" />
                    <div className="flex flex-col ml-4 my-1">
                        <p className="text-[15px] my-1 font-semibold text-orange-500">Listo para firmar</p>
                        <div className="flex flex-row">
                            <h4 className="text-2xl mr-1 font-semibold">20</h4>
                            <h5 className="text-xs self-center">Supervisores</h5>
                        </div>
                    </div>
                </div>
                <div className="border h-auto flex-1 mx-2 flex flex-row">
                    <div className="h-auto bg-green-500 w-1" />
                    <div className="flex flex-col ml-4 my-1">
                        <p className="text-[15px] my-1 font-semibold text-green-500">Cerrado</p>
                        <div className="flex flex-row">
                            <h4 className="text-2xl mr-1 font-semibold">20</h4>
                            <h5 className="text-xs self-center">feedbacks cerrados</h5>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-row md:flex-row items-center gap-2 border border-gray-200 px-2 py-1 bg-white shadow">
                <div className="w-full md:w-auto flex flex-row flex-initial">
                    <h2 className="self-center mr-2 font-light text-[14px]">Mes - Año: </h2>
                    <input
                        type="month"
                        id="mes-anio"
                        className="md:w-max bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-2.5 outline-none transition-all h-8"
                    />
                </div>
                <hr className="border-gray-200 border h-10 w-0.5" />
                <div className="flex flex-row flex-initial">
                    <h4 className="self-center mr-2 font-light text-[14px]">Estado:</h4>
                    <div className=" flex flex-row bg-gray-50 border-slate-200 border">
                        <select
                            className="w-full  text-slate-700 text-sm pl-4 pr-10 py-2.5 transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 outline-none hover:bg-gray-100 h-10"
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="rutina">Rutina</option>
                            <option value="negativo">Negativo</option>
                        </select>
                        <div className="relative right-4 flex items-center pointer-events-none text-slate-500 flex-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
                <hr className="border-gray-200 border h-10 w-0.5" />
                <div className="flex-1">
                    <div className="flex flex-row bg-gray-50 border">
                        <SearchIcon className="self-center ml-2 mt-0.5" size={18}/>
                        <Input
                            className="w-full bg-gray-50 border-0"
                            placeholder="Buscar supervisor..."
                        />
                    </div>
                </div>
            </div>
        </>
    );
}