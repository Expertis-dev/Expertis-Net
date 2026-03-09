"use client"
import { useCombobox } from "@/hooks/feedback/combobox"
import { LockIcon, SearchIcon } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

interface Props {
    currentFeedback: string,
    setCurrentFeedback: Dispatch<SetStateAction<string>>

}

export const HeaderCrearFbAsesor = ({
    currentFeedback,
    setCurrentFeedback
}: Props) => {
    const {
        filteredSupervisors,
        isSupervisorOpen,
        setSupervisorQuery,
        supervisorRef,
        supervisorQuery,
        setIsSupervisorOpen
    } = useCombobox();

    return (
        <>
            <div className="flex flex-row bg-zinc-50 p-2 border shadow rounded-sm dark:bg-zinc-900 dark:border-zinc-700">
                <div className="flex flex-col px-2 flex-3/4">
                    <h1 className="font-bold text-xl text-gray-800 dark:text-zinc-100">Crear Nuevo Feedback</h1>
                    <p className="font-light text-gray-600 text-[14px] dark:text-zinc-300">Ingrese los datos de desempeño mensual y sus respectivas metas</p>
                    <p className="font-light text-gray-600 text-[12px] mt-2 dark:text-zinc-400">Seleccionar asesor</p>
                    <div className="flex-1" ref={supervisorRef}>
                        <div className="relative rounded-sm flex flex-row bg-gray-50 border dark:bg-zinc-600">
                            <SearchIcon className="self-center ml-2 mt-0.5 dark:text-white" size={18} />
                            <input
                                value={supervisorQuery}
                                onChange={(e) => {
                                    setSupervisorQuery(e.target.value)
                                    setIsSupervisorOpen(true)
                                }}
                                onFocus={() => setIsSupervisorOpen(true)}
                                className="w-full border-none bg-transparent px-2 py-2 text-sm outline-none dark:text-zinc-100 dark:placeholder:text-zinc-300"
                                placeholder="Buscar supervisor..."
                            />

                            {isSupervisorOpen && (
                                <div className="absolute left-0 right-0 top-[110%] z-20 max-h-44 overflow-y-auto rounded-sm border border-gray-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900">
                                    {filteredSupervisors.length > 0 ? (
                                        filteredSupervisors.map((name) => (
                                            <button
                                                key={name}
                                                type="button"
                                                onClick={() => {
                                                    setSupervisorQuery(name)
                                                    setIsSupervisorOpen(false)
                                                }}
                                                className="w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-gray-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                                            >
                                                {name}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="px-3 py-2 text-sm text-gray-500 dark:text-zinc-400">Sin resultados</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col px-4">
                    <div className="flex-2/3"></div>
                    <p className="text-gray-400 font-light text-[12px] dark:text-zinc-400">TIPO DE FEEDBACK</p>
                    <div className="relative mt-1 grid grid-cols-2 rounded-sm bg-zinc-300 p-1.5 dark:bg-zinc-700">
                        <div
                            className={`absolute left-1.5 top-1.5 h-[calc(100%-0.75rem)] w-[calc(50%-0.75rem)] rounded-sm bg-zinc-50 shadow-sm transition-transform duration-300 ease-out dark:bg-zinc-900 ${currentFeedback === "rutina" ? "translate-x-0" : "translate-x-[calc(100%+0.25rem)]"
                                }`}
                        />

                        <button
                            type="button"
                            className={`relative z-10 rounded-sm px-6 py-1.5 text-sm transition-colors duration-300 ${currentFeedback === "rutina"
                                ? "text-zinc-900 dark:text-zinc-100"
                                : "text-gray-600 dark:text-zinc-300"
                                }`}
                            onClick={() => setCurrentFeedback("rutina")}
                        >
                            Rutina
                        </button>

                        <button
                            type="button"
                            className={`relative z-10 rounded-sm px-6 py-1.5 text-sm transition-colors duration-300 ${currentFeedback === "negativa"
                                ? "text-zinc-900 dark:text-zinc-100"
                                : "text-gray-600 dark:text-zinc-300"
                                }`}
                            onClick={() => setCurrentFeedback("negativa")}
                        >
                            Negativa
                        </button>
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
