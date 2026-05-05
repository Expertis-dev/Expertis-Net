import { Button } from "@/components/ui/button"
import { ArrowRight, InfoIcon, RefreshCw, SquareIcon } from "lucide-react"
import { formatWithThousands } from "../../supervisor/crear/CrearFbSupervisorForm"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { FormattedNumberInput } from "../../FormattedNumberInput"
import { SuccessModal } from "@/components/success-modal"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { Controller, useForm } from "react-hook-form"
import { useUser } from "@/Provider/UserProvider"
import { Colaborador } from "./HeaderCrearFbAsesor"
import { useParams } from "next/navigation"
import { LoadingModal } from "@/components/loading-modal"
import TiptapEditor from "@/components/tiptap/TipTap"

interface Modal {
    isOpen: boolean;
    message: string;
}

interface Props {
    modal: Modal,
    setModal: Dispatch<SetStateAction<Modal>>,
    router: AppRouterInstance,
    asesor?: Colaborador,
    defaultValues?: Form,
    periodoSeleccionado?: string,
    currentFeedback: string
}

export interface Form {
    recupero: string,
    recuperoMeta: string,
    calidadPdp: string,
    calidadPdpPromedio: string,
    calidadCierre: string,
    calidadCierrePromedio: string,
    produccionPdp: string,
    produccionPdpPromedio: string,
    ticketDePdp: string,
    ticketDePdpPromedio: string,
    faltasInjustificadas: string,
    tardanzasInjustificadas: string,
    observacionesGenerales: string,
}

type MetricField = Exclude<keyof Form, "observacionesGenerales">

export interface AsistenciaDetalle {
    fecha: Date;
    alias: string;
    documento: string;
    grupo: string | null;
    agencia: Agencia;
    horaIngreso: null | string;
    horaSalida: null | string;
    esFalta: number;
    esDiaLaborable: number;
    esVacaciones: number;
    esAusenciaLaborable: number;
    tipoAusencia: null | string;
    tipo: null;
    tipoSubsidio: null | string;
    tipoGoce: null;
    hayJustificacion: number;
    tipoJustificacion: null | string;
    minutos_permiso: number;
    descuento: number;
    fechaInicioGestion: string;
    fechaFinGestion: null;
    horario: string;
    esTardanza: number;
    minutosTardanza: number;
    esUltimoSabadoDelMes: number;
}

export enum Agencia {
    Expertis = "EXPERTIS",
    ExpertisBpo = "EXPERTIS BPO",
}


const metricFields: Array<{
    name: string
    values: [{
        name: MetricField
        label: string
        prefix: string
        placeholder: string
        decimals?: number
    }, {
        name: MetricField
        label: string
        prefix: string
        placeholder: string
        decimals?: number
    }]
}> = [
        {
            name: "Recupero",
            values: [
                { name: "recupero", label: "Actual", prefix: "S/", decimals: 2, placeholder: "Ingresar recupero" },
                { name: "recuperoMeta", label: "Meta", prefix: "S/", decimals: 2, placeholder: "Ingresar Meta" },
            ],
        },
        {
            name: "Ticket de PDP",
            values: [
                { name: "ticketDePdp", label: "Actual", prefix: "S/", decimals: 2, placeholder: "Ingresar ticket de PDP" },
                { name: "ticketDePdpPromedio", label: "Meta", prefix: "S/", decimals: 2, placeholder: "Ingresar promedio" },
            ],
        },
        {
            name: "Calidad PDP (%)",
            values: [
                { name: "calidadPdp", label: "Actual", prefix: "%", decimals: 2, placeholder: "Ingresar calidad de PDP" },
                { name: "calidadPdpPromedio", label: "Promedio por asesor", prefix: "%", decimals: 2, placeholder: "Ingresar promedio" },
            ],
        },
        {
            name: "Calidad Cierre (%)",
            values: [
                { name: "calidadCierre", label: "Actual", prefix: "%", decimals: 2, placeholder: "Ingresar calidad de cierre" },
                { name: "calidadCierrePromedio", label: "Promedio por asesor", prefix: "%", decimals: 2, placeholder: "Ingresar promedio" },
            ],
        },
        {
            name: "Produccion PDP",
            values: [
                { name: "produccionPdp", label: "Actual", prefix: "S/", decimals: 0, placeholder: "Ingresar produccion PDP" },
                { name: "produccionPdpPromedio", label: "Promedio por asesor", prefix: "S/", decimals: 0, placeholder: "Ingresar promedio" },
            ],
        },
        {
            name: "Asistencia (Faltas/Tardanzas)",
            values: [
                { name: "faltasInjustificadas", label: "Faltas injustificadas", prefix: "", decimals: 0, placeholder: "Ingresar faltas injustificadas" },
                { name: "tardanzasInjustificadas", label: "Tardanzas injustificadas", prefix: "", decimals: 0, placeholder: "Ingresar tardanzas injustificadas" },
            ],
        },
    ]

export const CrearFbAsesorForm = ({
    modal,
    setModal,
    router,
    asesor,
    defaultValues,
    periodoSeleccionado,
    currentFeedback
}: Props) => {
    const { id: idFeedback } = useParams<{ id: string }>()
    const [isFetching, setIsFetching] = useState(false)
    const [isDisable, setIsDisable] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    
    const buildDefaults = (fields?: Form): Form => ({
        recupero: fields === undefined ? "" : fields.recupero,
        recuperoMeta: fields === undefined ? "" : fields.recuperoMeta,
        calidadPdp: fields === undefined ? "" : fields.calidadPdp,
        calidadPdpPromedio: fields === undefined ? "" : fields.calidadPdpPromedio,
        calidadCierre: fields === undefined ? "" : fields.calidadCierre,
        calidadCierrePromedio: fields === undefined ? "" : fields.calidadCierrePromedio,
        produccionPdp: fields === undefined ? "" : fields.produccionPdp,
        produccionPdpPromedio: fields === undefined ? "" : fields.produccionPdpPromedio,
        ticketDePdp: fields === undefined ? "" : fields.ticketDePdp,
        ticketDePdpPromedio: fields === undefined ? "" : fields.ticketDePdpPromedio,
        faltasInjustificadas: fields === undefined ? "" : fields.faltasInjustificadas,
        tardanzasInjustificadas: fields === undefined ? "" : fields.tardanzasInjustificadas,
        observacionesGenerales: fields === undefined ? "" : fields.observacionesGenerales,
    })

    const { control, handleSubmit, setError, clearErrors, formState: { errors }, reset, setValue, watch } = useForm<Form>({
        defaultValues: buildDefaults(defaultValues)
    })
    const { user } = useUser()
    const submitModeRef = useRef<"BORRADOR" | "PUBLICAR">("BORRADOR")

    const requireIfPublishing = (message: string) => (value: string) =>
        submitModeRef.current === "PUBLICAR" ? (!!value || message) : true

    const onClickFetchData = async () => {
        setIsFetching(true)
        setIsDisable(true)
        const hoy = new Date()
        const dia = hoy.getDate()
        const mes = hoy.getMonth() + 1
        const data: AsistenciaDetalle[] = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reporteCruzado/${(dia >= 26) ? mes + 1 : mes}`)
            .then(res => res.json())

        const filteredData = data.filter(v => v.alias === asesor?.usuario).filter(v => v.esDiaLaborable === 1)
        console.log(filteredData)
        let faltasInjustificadas = 0;
        let tardanzasInjustificadas = 0;
        for (const asistencia of filteredData) {
            if (asistencia.esFalta === 1) faltasInjustificadas++;
            if (asistencia.esTardanza === 1) tardanzasInjustificadas++;
        }
        setValue("faltasInjustificadas", String(faltasInjustificadas), { shouldDirty: true })
        setValue("tardanzasInjustificadas", String(tardanzasInjustificadas), { shouldDirty: true })

        setIsFetching(false)
        setIsDisable(false)
    }

    const onClickSave = async (type: string, { observacionesGenerales, ...data }: Form) => {
        setIsLoading(true)
        if (!asesor?.idEmpleado) {
            setError("root", { type: "manual", message: "Selecciona un asesor." })
            setIsLoading(false)
            return
        }
        const message = type === "PUBLICAR" ? "Feedback de asesor publicado con éxito" : "Borrador guardado con éxito"
        const toIso = (value?: string) => {
            if (!value) return ""
            const parts = value.split("-")
            if (parts.length === 2) {
                // YYYY-MM
                const [year, month] = parts
                const fecha = new Date(`${year}-${month}-01T00:00:00Z`)
                return Number.isNaN(fecha.getTime()) ? "" : fecha.toISOString()
            } else if (parts.length === 3) {
                // YYYY-MM-DD
                const [year, month, day] = parts
                const fecha = new Date(`${year}-${month}-${day}T00:00:00Z`)
                return Number.isNaN(fecha.getTime()) ? "" : fecha.toISOString()
            }
            return ""
        }
        const periodoIso = toIso(periodoSeleccionado)

        if (!defaultValues) {
            if (!periodoIso) {
                setError("root", { type: "manual", message: "Selecciona un periodo valido." })
                setIsLoading(false)
                return
            }
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/asesor`, {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({
                    idEmpleado: asesor.idEmpleado,
                    periodo: periodoIso,
                    tipoEvaluacion: currentFeedback.toUpperCase(),
                    estadoFeedback: type === "PUBLICAR" ? "PUBLICADO" : "BORRADOR",
                    observacionesGenerales: observacionesGenerales,
                    resultadoEvaluacion: data,
                    usrInsert: user?.usuario || "",
                    tipoEmpleado: "ASESOR",
                    USUARIO: asesor.usuario
                })
            }).then((res) => {
                if (!res.ok) {
                    throw new Error("HTTP_ERROR")
                }
                return res
            }).then(() => {
                setModal({ isOpen: true, message: message })
                setTimeout(() => {
                    router.push(`/dashboard/feedback/asesores/?usuario=${user?.usuario || ""}`)
                }, 1500);
            }).catch(() => {
                alert("Algo no funcionó")
            }).finally(() => {
                setIsLoading(false)
            })
        } else {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${idFeedback}`, {
                headers: { "Content-Type": "application/json" },
                method: "PUT",
                body: JSON.stringify({
                    estadoFeedback: type === "PUBLICAR" ? "PUBLICADO" : "BORRADOR",
                    observacionesGenerales: observacionesGenerales,
                    analisisResultados: null,
                    compromisoMejora: null,
                    periodo: periodoIso,
                    resultadoEvaluacion: JSON.stringify({
                        recupero: data.recupero,
                        recuperoMeta: data.recuperoMeta,
                        calidadPdp: data.calidadPdp,
                        calidadPdpPromedio: data.calidadPdpPromedio,
                        calidadCierre: data.calidadCierre,
                        calidadCierrePromedio: data.calidadCierrePromedio,
                        produccionPdp: data.produccionPdp,
                        produccionPdpPromedio: data.produccionPdpPromedio,
                        ticketDePdp: data.ticketDePdp,
                        ticketDePdpPromedio: data.ticketDePdpPromedio,
                        faltasInjustificadas: data.faltasInjustificadas,
                        tardanzasInjustificadas: data.tardanzasInjustificadas,
                    }),
                    usuario: user?.usuario
                })
            }).then((res) => {
                if (!res.ok) {
                    throw new Error("HTTP_ERROR")
                }
                return res
            }).then(() => {
                setModal({ isOpen: true, message: message })
                setTimeout(() => {
                    router.push(`/dashboard/feedback/asesores/?usuario=${user?.usuario || ""}`) //! AGREGAR QUERYPARAM DE SUPERVISOR
                }, 1500);
            }).catch(() => {
                alert("Algo no funcionó")
            }).finally(() => {
                setIsLoading(false)
            })
        }
    }

    const handleFormattedChange =
        (onChange: (value: string) => void, maxDecimals = 2) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const formatted = formatWithThousands(e.target.value, maxDecimals)
                onChange(formatted)
            }

    const hasAnyValue = (data: Form) =>
        Object.values(data).some((value) => value.trim() !== "")

    useEffect(() => {
        if (defaultValues) {
            reset(buildDefaults(defaultValues))
        }
    }, [defaultValues, reset])

    const calculateRatioAlcance = () => {
        const recupero = Number((watch("recupero") || "").replace(/,/g, ""))
        const recuperoMeta = Number((watch("recuperoMeta") || "").replace(/,/g, ""))

        const ratio = recupero / recuperoMeta * 100

        return ratio.toFixed(2)
    }

    return (
        <>
            <div className="flex flex-col mt-4 p-2 border rounded-sm bg-white dark:bg-zinc-900 dark:border-zinc-700">
                <div className="flex flex-row p-4 justify-between">
                    <p className="font-semibold">
                        Matriz de Desempeño
                    </p>
                    <span className="flex-1" />
                    {
                        !!asesor &&
                        <Button className="mr-4 bg-gray-200 text-black dark:text-white hover:scale-105 hover:bg-blue-300 dark:bg-zinc-500"
                            onClick={onClickFetchData}
                        >
                            {
                                isFetching &&
                                <RefreshCw className="animate-spin" />
                            }
                            Autocompletado
                        </Button>
                    }
                    <div className="flex flex-row">
                        <SquareIcon size={12} className="self-center text-gray-400 dark:text-zinc-500" />
                        <p className="text-[10px] self-center ml-1 dark:text-zinc-300">REAL</p>
                        <SquareIcon size={12} className="self-center text-gray-200 bg-gray-300 ml-8 dark:text-zinc-600 dark:bg-zinc-700" />
                        <p className="text-[10px] self-center ml-1 dark:text-zinc-300">META / PROMEDIO</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2">
                    {
                        metricFields.map((field) => {
                            return (
                                <div className="flex flex-col p-2" key={field.name}>
                                    <div className="flex flex-row justify-between">
                                        <h4>{field.name} </h4>
                                        {field.name === "Recupero" ? 
                                            <p className="font-extralight">Alcance recupero: {isNaN(+calculateRatioAlcance()) ? "" : calculateRatioAlcance() + "%"}</p>
                                        : <></>}
                                    </div>
                                    {errors[field.values[0].name] && <span className="text-red-600 text-xs">{errors[field.values[0].name]!.message}</span>}
                                    {errors[field.values[1].name] && <span className="text-red-600 text-xs">{errors[field.values[1].name]!.message}</span>}
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {field.values.map((input, i) => {
                                            return (
                                                <div className={`flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm ${i === 1 ? "bg-gray-300" : ""} dark:border-zinc-600 dark:bg-zinc-900`} key={input.name}>
                                                    {input.prefix === "S/" ? <p className="self-center text-gray-800 dark:text-zinc-200">S/</p> : <></>}
                                                    <Controller
                                                        rules={{ validate: requireIfPublishing(`El ${input.label} es un campo obligatorio`) }}
                                                        control={control}
                                                        name={input.name}
                                                        render={({ field }) => (
                                                            <FormattedNumberInput
                                                                value={field.value}
                                                                onChange={handleFormattedChange(field.onChange, input.decimals)}
                                                                onBlur={field.onBlur}
                                                                name={field.name}
                                                                placeholder={input.placeholder}
                                                                inputAsesor={true}
                                                                disbaled={isDisable}
                                                            />
                                                        )}
                                                    />
                                                    {input.prefix === "%" ? <p className="self-center text-gray-800 dark:text-zinc-200">%</p> : <></>}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className="flex flex-col rounded-sm dark:text-zinc-100">
                <div className="flex flex-col mt-4 p-2 border rounded-sm bg-white dark:bg-zinc-900 dark:border-zinc-700">
                    <h2 className="text-xl px-2 font-semibold">Observaciones Generales</h2>
                    {errors.observacionesGenerales && <span className="text-red-600 text-xs ml-4">{errors.observacionesGenerales.message}</span>}
                    <Controller
                        control={control}
                        name="observacionesGenerales"
                        rules={{ validate: requireIfPublishing("Las observaciones generales son obligatorias") }}
                        render={({ field }) => (
                            <TiptapEditor
                                id="observacionesGenerales"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                disabled={isDisable}
                                placeholder="Redacte aqui su compromiso de mejora en base a los datos mostrados"
                                className="mx-2 mt-1 mb-2"
                                containerClassName="rounded-sm border-gray-200 dark:border-zinc-600 dark:bg-zinc-800 dark:focus-within:border-blue-500/30 dark:focus-within:ring-blue-500/20"
                                toolbarClassName="border-gray-200 dark:border-zinc-700 dark:bg-zinc-900/70"
                                editorClassName="min-h-[150px] text-[13px] leading-5 text-gray-800 dark:text-zinc-200"
                            />
                        )}
                    />
                </div>
            </div>

            <div className="flex flex-col mt-4 p-2 border rounded-sm bg-white dark:bg-zinc-900 dark:border-zinc-700">
                <div className="flex flex-row justify-between p-2">
                    <div className="flex-row flex">
                        <InfoIcon className={`self-center text-gray-500 ${!asesor?.idEmpleado ? "text-gray-500 dark:text-zinc-400" : "text-red-500 dark:text-red-400"}`} size={15} />
                        <p className={`${!asesor?.idEmpleado ? "text-gray-500 dark:text-zinc-400" : "text-red-500 dark:text-red-400"} ml-1 text-xs self-center`}>{!asesor?.idEmpleado ? "Completar el nombre del asesor" : "Los campos vacios se guardarán con valor 0"}</p>
                    </div>
                    {errors.root?.message && (
                        <p className="text-red-600 text-xs self-center">{errors.root.message}</p>
                    )}
                    <div className="flex flex-row justify-between">
                        <Button
                            disabled={!asesor?.idEmpleado}
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
                            className="flex-1 bg-white text-black border border-gray-400 hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700">
                            Guardar Borrador
                        </Button>
                        <Button
                            disabled={!asesor?.idEmpleado}
                            className="flex-1 ml-4 dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white"
                            onClick={() => {
                                submitModeRef.current = "PUBLICAR"
                                clearErrors("root")
                                handleSubmit((data) => onClickSave("PUBLICAR", data))()
                            }
                            }>
                            Publicar Feedback
                            <ArrowRight />
                        </Button>
                    </div>
                    <SuccessModal
                        isOpen={modal.isOpen}
                        message={modal.message}
                    />
                    <LoadingModal
                        isOpen={isLoading}
                        message="Subiendo feedback"
                    />
                </div>
            </div>
        </>
    )
}

