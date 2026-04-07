"use client"
import { Button } from "@/components/ui/button"
import { useRef, useState } from "react"
import { CloudUpload, SaveIcon } from "lucide-react"
import { FormattedNumberInput } from "../../FormattedNumberInput"
import { useRouter } from "next/navigation"
import { SuccessModal } from "@/components/success-modal"
import { Controller, useForm } from "react-hook-form"
import { HeaderCrearFbSupervisor } from "./HeaderCrearFbSupervisor"
import { Empleado } from "@/types/feedback/interfaces"
import { useUser } from "@/Provider/UserProvider"
import { LoadingModal } from "@/components/loading-modal"
import TiptapEditor from "@/components/tiptap/TipTap"

export const formatWithThousands = (input: string, maxDecimals = 2) => {
    if (!input) return ""

    let cleaned = input.replace(/[^\d.]/g, "")
    if (!cleaned) return ""

    const firstDot = cleaned.indexOf(".")
    if (firstDot !== -1) {
        cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "")
    }

    const endsWithDot = cleaned.endsWith(".")
    const parts = cleaned.split(".")

    let intPart = parts[0]
    const decPart = parts[1]

    intPart = intPart.replace(/^0+(?=\d)/, "")
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    if (endsWithDot) {
        return `${formattedInt || "0"}.`
    }

    if (decPart !== undefined) {
        const trimmedDec = maxDecimals >= 0 ? decPart.slice(0, maxDecimals) : decPart
        return `${formattedInt || "0"}.${trimmedDec}`
    }

    return formattedInt
}

interface Props {
    supervisores: Array<Empleado>
    defaultValues?: Form
    supervisorName?: string
    periodoDefault?: Date
    idFeedback?: number
}

interface Form {
    recupero: string,
    meta: string,
    alcance: string,
    efectividad: string,
    montoPdp: string,
    cierre: string,
    calidad: string,
    pagoDkPpc: string,
    puntualidad: string,
    puntualidadEquipo: string,
    ausentismoEquipo: string,
    analisisResultados: string
}

type MetricField = Exclude<keyof Form, "analisisResultados">

const metricFields: Array<{
    name: MetricField
    label: string
    prefix: string
    decimals?: number
}> = [
        { name: "recupero", label: "Recupero Total", prefix: "S/", decimals: 2 },
        { name: "meta", label: "Meta", prefix: "S/", decimals: 2 },
        { name: "alcance", label: "Alcance", prefix: "%", decimals: 2 },
        { name: "efectividad", label: "Efectividad", prefix: "%", decimals: 2 },
        { name: "montoPdp", label: "Monto PDP", prefix: "S/", decimals: 2 },
        { name: "cierre", label: "% Cierre", prefix: "%", decimals: 2 },
        { name: "calidad", label: "% Calidad", prefix: "%", decimals: 2 },
        { name: "pagoDkPpc", label: "Pago / DK PPC", prefix: "%", decimals: 2 },
        { name: "puntualidad", label: "Puntualidad", prefix: "%", decimals: 2 },
        { name: "puntualidadEquipo", label: "Puntualidad - Equipo", prefix: "%", decimals: 2 },
        { name: "ausentismoEquipo", label: "% Ausentismo Equipo", prefix: "%", decimals: 2 },
    ]

export const CrearFbSupervisorForm = ({ supervisores, defaultValues, supervisorName, periodoDefault, idFeedback }: Props) => {
    const [supervisor, setSupervisor] = useState<Empleado>()
    const [periodo, setPeriodo] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(false)

    const { user } = useUser()
    const safeDefaults: Form = defaultValues ?? {
        recupero: "",
        meta: "",
        alcance: "",
        efectividad: "",
        montoPdp: "",
        cierre: "",
        calidad: "",
        pagoDkPpc: "",
        puntualidad: "",
        puntualidadEquipo: "",
        ausentismoEquipo: "",
        analisisResultados: "",
    }
    const { control, handleSubmit, formState: { errors }, clearErrors, setError, } = useForm<Form>({
        defaultValues: {
            recupero: safeDefaults.recupero || "",
            meta: safeDefaults.meta || "",
            alcance: safeDefaults.alcance || "",
            efectividad: safeDefaults.efectividad || "",
            montoPdp: safeDefaults.montoPdp || "",
            cierre: safeDefaults.cierre || "",
            calidad: safeDefaults.calidad || "",
            pagoDkPpc: safeDefaults.pagoDkPpc || "",
            puntualidad: safeDefaults.puntualidad || "",
            puntualidadEquipo: safeDefaults.puntualidadEquipo || "",
            ausentismoEquipo: safeDefaults.ausentismoEquipo || "",
            analisisResultados: safeDefaults.analisisResultados || "",
        },
    })
    const router = useRouter()
    const [modal, setModal] = useState({
        isOpen: false,
        message: ""
    })
    const onClickSave = async (type: string, { analisisResultados, ...data }: Form) => {
        setIsLoading(true)
        const message = type === "PUBLICAR" ? "Feedback de supervisor publicado con éxito" : "Borrador guardado con éxito"

        if (!defaultValues){
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/supervisor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    USUARIO: supervisor?.alias,
                    idEmpleado: supervisor?.idEmpleado,
                    periodo,
                    estadoFeedback: type === "PUBLICAR" ? "PUBLICADO" : "BORRADOR",
                    analisisResultados: analisisResultados,
                    resultadoEvaluacion: data,
                    usrInsert: user?.usuario,
                    tipoEmpleado: "SUPERVISOR"
                })
            })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("HTTP_ERROR")
                }
                return res
            }).then(() => {
                setModal({ isOpen: true, message: message })
                setTimeout(() => {
                    router.push("/dashboard/feedback/supervisores")
                }, 1500);
            }).catch(() => {
                alert("Algo no funcionó")
            }).finally(() => {
                setIsLoading(false)
            })
        }else {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${idFeedback}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    estadoFeedback: type === "PUBLICAR" ? "PUBLICADO" : "BORRADOR",
                    observacionesGenerales: undefined,
                    analisisResultados: analisisResultados,
                    compromisoMejora: undefined,
                    resultadoEvaluacion: JSON.stringify(data),
                    usuario: user?.usuario
                })
            })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("HTTP_ERROR")
                }
                return res
            }).then(() => {
                setModal({ isOpen: true, message: message })
                setTimeout(() => {
                    router.push("/dashboard/feedback/supervisores")
                }, 1500);
            }).catch(() => {
                alert("Algo no funcionó")
            }).finally(() => {
                setIsLoading(false)
            })
        }

    }
    const handleChange =
        (onChange: (value: string) => void, maxDecimals = 2) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const formatted = formatWithThousands(e.target.value, maxDecimals)
                onChange(formatted)
            }
    const submitModeRef = useRef<"BORRADOR" | "PUBLICAR">("BORRADOR")

    const requireIfPublishing = (message: string) => (value: string) =>
        submitModeRef.current === "PUBLICAR" ? (!!value || message) : true
    const hasAnyValue = (data: Form) =>
        Object.values(data).some((value) => value.trim() !== "")
    return (
        <>
            <HeaderCrearFbSupervisor
                supervisores={supervisores}
                setSupervisor={setSupervisor}
                setPeriodo={setPeriodo}
                defaultSup={supervisorName}
                defaultPeriodo={periodoDefault}
            />
            <div className="flex flex-row py-2 m-2">
                <div className="flex-2/3 border border-gray-200 dark:border-zinc-700 px-3 flex flex-col rounded-sm mr-2 border-b-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    <h2 className="text-xl my-1 border-b-2 border-gray-200 dark:border-zinc-700 w-[100%] py-3">Indicadores operativos</h2>
                    <div className="grid grid-cols-2 gap-1">
                        {metricFields.map((fieldConfig) => (
                            <div className="p-2" key={fieldConfig.name}>
                                <h4>{fieldConfig.label}</h4>
                                {errors[fieldConfig.name] && (
                                    <span className="text-red-600 text-xs">
                                        {errors[fieldConfig.name]?.message}
                                    </span>
                                )}
                                <div className="mt-1 flex flex-wrap gap-2">
                                    <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                        <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">
                                            {fieldConfig.prefix}
                                        </p>
                                        <Controller
                                            rules={{
                                                validate: requireIfPublishing(
                                                    `El ${fieldConfig.name} es un campo obligatorio`
                                                ),
                                            }}
                                            control={control}
                                            name={fieldConfig.name}
                                            render={({ field }) => (
                                                <FormattedNumberInput
                                                    value={field.value ?? ""}
                                                    onBlur={field.onBlur}
                                                    name={field.name}
                                                    onChange={handleChange(field.onChange, fieldConfig.decimals ?? 2)}
                                                    placeholder="00.00"
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col rounded-sm bg-white dark:bg-zinc-900 dark:border-zinc-700">
                        <h2 className="px-2 text-zinc-900 dark:text-zinc-100">Análisis de resultados</h2>
                        {errors.analisisResultados && (
                            <span className="text-red-600 text-xs">{errors.analisisResultados.message}</span>
                        )}
                        <Controller
                            control={control}
                            name="analisisResultados"
                            rules={{ validate: requireIfPublishing("El analisisResultados es requerido") }}
                            render={({ field }) => (
                                <TiptapEditor
                                    id="analisisResultados"
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    placeholder="Escriba aquí el analisis de los resultados del supervisor"
                                    className="mb-3"
                                    containerClassName="rounded-sm border-gray-200 dark:border-zinc-600 dark:bg-zinc-800 dark:focus-within:border-blue-500/30 dark:focus-within:ring-blue-500/20"
                                    toolbarClassName="border-gray-200 dark:border-zinc-700 dark:bg-zinc-900/70"
                                    editorClassName="min-h-[150px] text-[13px] leading-5 text-gray-800 dark:text-zinc-200"
                                />
                            )}
                        />
                    </div>
                </div>


                <div className="flex-1/3 border self-start border-gray-200 dark:border-zinc-700 px-5 py-4 flex flex-col rounded-sm ml-2 bg-white dark:bg-zinc-900">
                    <h4 className="text-[18px] text-zinc-900 dark:text-zinc-100">Finalizar evaluación</h4>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">Confirme y verifique que todos los datos son correctos. El sistema procesará el análisis tras la publicación</p>
                    <Button
                        disabled={!supervisor || !periodo}
                        onClick={() => {
                            submitModeRef.current = "PUBLICAR"
                            handleSubmit((data) => {
                                clearErrors("root")
                                onClickSave("PUBLICAR", data)
                            })()
                        }}
                        className="mt-4"
                    >
                        <CloudUpload />
                        Subir evaluacion
                    </Button>
                    {errors.root?.message && (
                        <p className="text-red-600 text-xs self-center">{errors.root.message}</p>
                    )}
                    <Button
                        disabled={!supervisor || !periodo}
                        onClick={() => {
                            submitModeRef.current = "BORRADOR"
                            handleSubmit((data) => {
                                if (!hasAnyValue(data)) {
                                    setError("root", { type: "manual", message: "Completa al menos un campo para guardar borrador." })
                                    return
                                }
                                clearErrors("root")
                                onClickSave("BORRADOR", data)
                            })()
                        }}
                        className="my-2 bg-transparent text-black dark:text-zinc-100 border border-gray-500 dark:border-zinc-600 hover:bg-gray-200 dark:hover:bg-zinc-800"
                    >
                        <SaveIcon />
                        Guardar borrador
                    </Button>
                    {!supervisor || !periodo ?
                        <h1 className="text-red-500 text-xs">Debe seleccionar el supervisor y el periodo de la evaluacion</h1>
                        :
                        <></>
                    }
                </div>
                <SuccessModal
                    isOpen={modal.isOpen}
                    message={modal.message}
                />
                <LoadingModal 
                    isOpen={isLoading}
                    message="Cargando..."
                />
            </div>
        </>
    )
}
