import { LockIcon, SearchIcon } from "lucide-react"

export const HeaderCrearFbAsesor = () => {
    return (
        <>
            <div className="flex flex-row bg-zinc-50 p-2 border shadow rounded-sm dark:bg-zinc-900 dark:border-zinc-700">
                <div className="flex flex-col px-2 flex-3/4">
                    <h1 className="font-bold text-xl text-gray-800 dark:text-zinc-100">Crear Nuevo Feedback</h1>
                    <p className="font-light text-gray-600 text-[14px] dark:text-zinc-300">Ingrese los datos de desempeño mensual y sus respectivas metas</p>
                    <p className="font-light text-gray-600 text-[12px] mt-2 dark:text-zinc-400">Seleccionar asesor</p>
                    <div className="flex flex-row border w-100 p-1 bg-white rounded-sm dark:bg-zinc-800 dark:border-zinc-600">
                        <SearchIcon size={15} className="self-center text-gray-600 dark:text-zinc-400" />
                        <input type="text" className="border-none outline-none ml-2 flex-1 bg-transparent dark:text-zinc-100 dark:placeholder:text-zinc-400" placeholder="Buscar por nombre" />
                    </div>
                </div>
                <div className="flex flex-col px-4">
                    <div className="flex-2/3"></div>
                    <p className="text-gray-400 font-light text-[12px] dark:text-zinc-400">TIPO DE FEEDBACK</p>
                    <div className="flex-1/3 flex flex-row bg-zinc-300 rounded-sm dark:bg-zinc-700">
                        <div className="flex-1 m-1 mr-2 px-1 py-0.5 hover:cursor-pointer bg-zinc-50 rounded-sm dark:bg-zinc-900">
                            <p className="px-8 dark:text-zinc-100">
                                Rutina
                            </p>
                        </div>
                        <div className="flex-1 m-1 px-1 py-0.5 hover:cursor-pointer">
                            <p className="px-8 text-gray-600 dark:text-zinc-300">
                                Negativa
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col p-2 mt-2 border shadow bg-zinc-200 rounded-sm dark:bg-zinc-800 dark:border-zinc-700">
                <div className="flex flex-row px-4 justify-between">
                    <div>
                        <p className="dark:text-zinc-100">
                            Datos del Asesor
                        </p>
                    </div>
                    <div className="flex flex-row text-gray-400 dark:text-zinc-400">
                        <LockIcon size={12} className="self-center mb-0.5 mr-1" />
                        <p className="text-xs self-center">
                            Auto-Completado
                        </p>
                    </div>
                </div>
                <div className="flex flex-row bg-white -mx-2 -mb-2 mt-2 justify-evenly dark:bg-zinc-900">
                    <div className="flex-1 p-2">
                        <p className="text-gray-500 text-xs text-[10px] dark:text-zinc-400">Nombre completo</p>
                        <p className="text-[15px] dark:text-zinc-100">Sebastian Guzmán</p>
                    </div>
                    <hr className="border peer-autofill border-gray-300 h-13 py-2 dark:border-zinc-600" />
                    <div className="flex-1 p-2">
                        <p className="text-gray-500 text-xs text-[10px] dark:text-zinc-400">Cargo</p>
                        <p className="text-[15px] dark:text-zinc-100">Asesor</p>
                    </div>
                    <hr className="border peer-autofill border-gray-300 h-13 py-2 dark:border-zinc-600" />
                    <div className="flex-1 p-2">
                        <p className="text-gray-500 text-xs text-[10px] dark:text-zinc-400">Mes Evaluacion</p>
                        <p className="text-[15px] dark:text-zinc-100">Enero 2024</p>
                    </div>
                    <hr className="border peer-autofill border-gray-300 h-13 py-2 dark:border-zinc-600" />
                    <div className="flex-1 p-2">
                        <p className="text-gray-500 text-xs text-[10px] dark:text-zinc-400">Equipo</p>
                        <p className="text-[15px] dark:text-zinc-100">Jorge</p>
                    </div>
                </div>
            </div>
        </>
    )
}
