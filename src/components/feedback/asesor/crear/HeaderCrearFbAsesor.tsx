"use client"
import { useCombobox } from "@/hooks/feedback/combobox"
import { useUser } from "@/Provider/UserProvider"
import { LockIcon, SearchIcon } from "lucide-react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

interface Props {
    currentFeedback: string,
    setCurrentFeedback: Dispatch<SetStateAction<string>>
    setAsesor: (asesor?: Colaborador) => void,
    idEmpleado?: number
    USUARIO?: string
    periodoRutina?: string
    periodoNegativa?: string
    setPeriodoRutina?: (value: string) => void
    setPeriodoNegativa?: (value: string) => void
    periodoDisabled?: boolean
}

export interface Colaborador {
    Id: number,
    usuario: string,
    idEmpleado: number,
    dni: string
}

export const HeaderCrearFbAsesor = ({
    currentFeedback,
    setCurrentFeedback,
    setAsesor,
    idEmpleado,
    USUARIO = "",
    periodoRutina,
    periodoNegativa,
    setPeriodoRutina,
    setPeriodoNegativa,
    periodoDisabled = false
}: Props) => {
    const [asesorOptions, setAsesorOptions] = useState<Array<Colaborador>>([])
    const { user } = useUser()
    useEffect(() => {
        const fetchAsesores = async (): Promise<Colaborador[]> => {
            const asesores = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerListaColaboradores`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario: user?.usuario || "" })
            }).then(r => r.json())
            return asesores
        }
        fetchAsesores().then((r) => {
            setAsesorOptions(r)
        })
    }, [user?.usuario])

    const {
        filteredOptions,
        isOpen,
        setQuery,
        containerRef,
        query,
        setIsOpen,
        selectOption
    } = useCombobox({
        options: asesorOptions,
        getLabel: (v) => v.usuario,
        filterOption: (v, q) => v.usuario.toLowerCase().includes(q),
        initialQuery: `${USUARIO}`
    });

    useEffect(() => {
        if (!USUARIO) return
        setQuery(USUARIO)
        setIsOpen(false)
        const exactMatch = asesorOptions.find(
            (v) => v.usuario.toLowerCase() === USUARIO.trim().toLowerCase()
        )
        setAsesor(exactMatch)
    }, [USUARIO, asesorOptions, setAsesor, setQuery, setIsOpen])

    const selectedById = idEmpleado
        ? asesorOptions.find((v) => v.idEmpleado === idEmpleado)
        : undefined;

    useEffect(() => {
        const normalized = query.trim().toLowerCase()
        if (!normalized) {
            setAsesor(undefined)
            return
        }
        const exactMatch = asesorOptions.find(
            (v) => v.usuario.toLowerCase() === normalized
        )
        setAsesor(exactMatch)
    }, [query, asesorOptions, setAsesor])

    useEffect(() => {
        if (!selectedById) return
        selectOption(selectedById)
        setAsesor(selectedById)
    }, [selectedById, asesorOptions, setAsesor, selectOption])

    const isRutina = currentFeedback === "rutina"
    const periodoValue = isRutina ? (periodoRutina ?? "") : (periodoNegativa ?? "")
    const showPeriodoInput = !!setPeriodoRutina || !!setPeriodoNegativa

    const onPeriodoChange = (value: string) => {
        if (isRutina) {
            setPeriodoRutina?.(value)
            return
        }
        setPeriodoNegativa?.(value)
    }

    return (
        <>
            <div className="flex flex-row bg-zinc-50 p-2 border shadow rounded-sm dark:bg-zinc-900 dark:border-zinc-700 mb-2">
                <div className="flex flex-col px-2 flex-3/4">
                    <h1 className="font-bold text-xl text-gray-800 dark:text-zinc-100">{
                        !!idEmpleado ?
                            "Editar feedback"
                            :
                            "Crear Nuevo Feedback"
                    }</h1>
                    <p className="font-light text-gray-600 text-[14px] dark:text-zinc-300 -mb-2">Ingrese los datos de desempeño mensual y sus respectivas metas</p>
                    <p className="font-light text-gray-600 text-[12px] mt-2 dark:text-zinc-400">Seleccionar asesor</p>
                    <div className="flex-1" ref={containerRef}>
                        <div className="relative rounded-sm flex flex-row bg-gray-50 border dark:bg-zinc-600">
                            <SearchIcon className="self-center ml-2 mt-0.5 dark:text-white" size={18} />
                            <input
                                value={query}
                                onChange={(e) => {
                                    if (USUARIO) return
                                    const value = e.target.value
                                    setQuery(value)
                                    if (!value.trim()) {
                                        setAsesor(undefined)
                                    }
                                    setIsOpen(true)
                                }}
                                onFocus={() => {
                                    if (USUARIO) return
                                    setIsOpen(true)
                                }}
                                disabled={!!USUARIO}
                                className="w-full border-none bg-transparent px-2 py-2 text-sm outline-none dark:text-zinc-100 dark:placeholder:text-zinc-300"
                                placeholder="Buscar asesor..."
                            />

                            {isOpen && !USUARIO && (
                                <div className="absolute left-0 right-0 top-[110%] z-20 max-h-44 overflow-y-auto rounded-sm border border-gray-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900">
                                    {filteredOptions.length > 0 ? (
                                        filteredOptions.map((a) => (
                                            <button
                                                key={a.idEmpleado}
                                                type="button"
                                                onClick={() => {
                                                    selectOption(a)
                                                    setAsesor(a)
                                                }}
                                                className="w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-gray-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                                            >
                                                {a.usuario}
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
                            onClick={() => {
                                if (!!USUARIO) return;
                                setCurrentFeedback("rutina")
                            }}
                        >
                            Rutina
                        </button>

                        <button
                            type="button"
                            className={`relative z-10 rounded-sm px-6 py-1.5 text-sm transition-colors duration-300 ${currentFeedback === "negativa"
                                ? "text-zinc-900 dark:text-zinc-100"
                                : "text-gray-600 dark:text-zinc-300"
                                }`}
                            onClick={() => {
                                if (!!USUARIO) return;
                                setCurrentFeedback("negativa")
                            }}
                        >
                            Negativa
                        </button>
                    </div>
                </div>
            </div>
            {

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
                            <p className="text-[15px] dark:text-zinc-100 mt-1">
                                {query.trim()
                                    ? asesorOptions.find((v) => v.usuario.toLowerCase() === query.trim().toLowerCase())?.usuario
                                    : selectedById?.usuario}
                            </p>
                        </div>
                        <hr className="border peer-autofill border-gray-300 h-15 py-2 dark:border-zinc-600" />
                        <div className="flex-1 p-2">
                            <p className="text-gray-500 text-xs text-[10px] dark:text-zinc-400">Cargo</p>
                            <p className="text-[15px] dark:text-zinc-100 mt-1">Asesor</p>
                        </div>
                        <hr className="border peer-autofill border-gray-300 h-15 py-2 dark:border-zinc-600" />
                        <div className="flex-1 p-2">
                            <p className="text-gray-500 text-xs text-[10px] dark:text-zinc-400">
                                {isRutina ? "Mes Evaluacion" : "Fecha Evaluacion"}
                            </p>
                            {showPeriodoInput ? (
                                <input
                                    type={isRutina ? "month" : "date"}
                                    value={periodoValue}
                                    onChange={(e) => onPeriodoChange(e.target.value)}
                                    disabled={periodoDisabled}
                                    onPointerDown={(e) => {
                                        if (periodoDisabled) return
                                        try {
                                            ;(e.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.()
                                        } catch { }
                                    }}
                                    onKeyDown={(e) => {
                                        if (periodoDisabled) return
                                        if (e.key !== "Enter" && e.key !== " ") return
                                        try {
                                            ;(e.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.()
                                        } catch { }
                                    }}
                                    className="w-full rounded-sm border border-zinc-300 bg-zinc-50 px-2 py-1 text-[13px] text-zinc-900 shadow-sm outline-none transition hover:bg-zinc-100 focus:border-zinc-500 focus:bg-white focus:ring-2 focus:ring-zinc-300/60 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:focus:border-zinc-400 dark:focus:bg-zinc-900 dark:focus:ring-zinc-500/40"
                                />
                            ) : (
                                <p className="text-[15px] dark:text-zinc-100">{(new Date()).toLocaleString("es-ES", { month: "long", year: "numeric", timeZone: "UTC" })}</p>
                            )}
                        </div>
                        <hr className="border peer-autofill border-gray-300 h-15 py-2 dark:border-zinc-600" />
                        <div className="flex-1 p-2">
                            <p className="text-gray-500 text-xs text-[10px] dark:text-zinc-400">Equipo</p>
                            <p className="text-[15px] dark:text-zinc-100 mt-1">{user?.nombre}</p>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}
