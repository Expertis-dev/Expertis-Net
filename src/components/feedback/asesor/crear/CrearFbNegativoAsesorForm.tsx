import { SuccessModal } from '@/components/success-modal'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import { Colaborador } from './HeaderCrearFbAsesor';
import { useUser } from '@/Provider/UserProvider';
import { useParams } from 'next/navigation';
import { LoadingModal } from '@/components/loading-modal';
import { ResponseModal } from '@/Encuesta/components/resultados/ResponseModal';

interface Modal {
    isOpen: boolean;
    message: string;
}

interface Props {
    modal: Modal,
    setModal: Dispatch<SetStateAction<Modal>>,
    router: AppRouterInstance,
    asesor?: Colaborador,
    defaultFields?: Form,
    periodoSeleccionado?: string
}

export interface Form {
    puntualidad: string,
    indicadoresPurecloud: string,
    indicadoresGestion: string,
    calidadLlamadas: string,
    observaciones: string
}

type MetricField = keyof Form

const metricFields: Array<{ name: MetricField, label: string, placeholder: string }> = [
    {
        name: "puntualidad",
        label: "PUNTUALIDAD",
        placeholder: "Detalle sobre puntualidad"
    },
    {
        name: "indicadoresPurecloud",
        label: "INDICADORE DE PURECLOUD",
        placeholder: "Detalle de indicacores de purecloud"
    },
    {
        name: "indicadoresGestion",
        label: "INDICADORES DE GESTION",
        placeholder: "Detalle de indicadores de gestion"
    },
    {
        name: "calidadLlamadas",
        label: "CALIDAD DE LLAMADAS",
        placeholder: "Detalle de calida dde llamadas"
    },
    {
        name: "observaciones",
        label: "Observaciones del evaluador (FODA)",
        placeholder: "Fortalezas oportunidades, debilidades y amenazas"
    },
]

export const CrearFbNegativoAsesorForm = ({
    modal,
    setModal,
    router,
    asesor,
    defaultFields,
    periodoSeleccionado
}: Props) => {
    const [isLoading, setIsLoading] = useState(false)
    const { id: idFeedback } = useParams<{ id: string }>()
    const buildDefaults = (fields?: Form): Form => ({
        calidadLlamadas: fields === undefined ? "" : fields.calidadLlamadas,
        indicadoresGestion: fields === undefined ? "" : fields.indicadoresGestion,
        indicadoresPurecloud: fields === undefined ? "" : fields.indicadoresPurecloud,
        observaciones: fields === undefined ? "" : fields.observaciones,
        puntualidad: fields === undefined ? "" : fields.puntualidad,
    })

    const { register, handleSubmit, formState: { errors }, setError, clearErrors, reset } = useForm<Form>({
        defaultValues: buildDefaults(defaultFields)
    })
    const submitModeRef = useRef<"BORRADOR" | "PUBLICAR">("BORRADOR")
    const requireIfPublishing =
        (message: string) =>
            (value: string) =>
                submitModeRef.current === "PUBLICAR" ? (!!value || message) : true
    const { user } = useUser()
    const onClickSave = async (type: string, { observaciones, ...data }: Form) => {
        setIsLoading(true)
        if (!asesor?.idEmpleado) {
            setError("root", { type: "manual", message: "Selecciona un asesor." })
            setIsLoading(false)
            return
        }
        const message = type === "PUBLICAR" ? "Feedback de asesor publicado con éxito" : "Borrador guardado con éxito"
        if (!defaultFields) {
            const toIsoFromDate = (value?: string) => {
                if (!value) return ""
                const fecha = new Date(`${value}T00:00:00Z`)
                if (Number.isNaN(fecha.getTime())) return ""
                return fecha.toISOString()
            }
            const periodoIso = toIsoFromDate(periodoSeleccionado)
            if (!periodoIso) {
                setError("root", { type: "manual", message: "Selecciona una fecha valida." })
                setIsLoading(false)
                return
            }
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/asesor`, {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({
                    idEmpleado: asesor.idEmpleado,
                    periodo: periodoIso,
                    tipoEvaluacion: "NEGATIVO",
                    estadoFeedback: type === "PUBLICAR" ? "PUBLICADO" : "BORRADOR",
                    observacionesGenerales: observaciones,
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
                    idFeedback,
                    estadoFeedback: type === "PUBLICAR" ? "PUBLICADO" : "BORRADOR",
                    observacionesGenerales: observaciones,
                    resultadoEvaluacion: data,
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
        }
    }

    const hasAnyValue = (data: Form) =>
        Object.values(data).some((value) => value.trim() !== "")

    useEffect(() => {
        if (defaultFields) {
            reset(buildDefaults(defaultFields))
        }
    }, [defaultFields, reset])

    return (
        <>
            <div className="flex flex-col mt-4 p-2 border rounded-sm bg-white dark:bg-zinc-900 dark:border-zinc-700">
                <div className="grid grid-cols-1 gap-4 p-2">
                    {
                        metricFields.map((field) => {
                            return (
                                <div className="flex flex-col p-2" key={field.name}>
                                    <h4 className="font-semibold">{field.label}</h4>
                                    {errors.puntualidad ? <p className='text-red-500 text-xs font-semibold'>{errors[field.name]!.message}</p> : <></>}
                                    <textarea
                                        {...register(field.name, { validate: requireIfPublishing(`el campo ${field.name} es obligatorio al publicar`) })}
                                        rows={field.name === "observaciones" ? 8 : 4}
                                        className="border text-[13px] border-gray-200 rounded-sm px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-none resize-y dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-200 dark:placeholder:text-zinc-400 dark:focus:ring-blue-500/30"
                                        placeholder={field.placeholder}
                                    />
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className="flex flex-col mt-4 p-2 border rounded-sm bg-white dark:bg-zinc-900 dark:border-zinc-700">
                <div className="flex flex-col gap-3 p-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                        {!asesor?.idEmpleado && (
                            <p className="text-xs font-semibold text-red-600">Debes seleccionar a un asesor</p>
                        )}
                        {errors.root?.message && (
                            <p className="text-xs text-red-600">{errors.root.message}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button
                            disabled={!asesor?.idEmpleado}
                            onClick={() => {
                                submitModeRef.current = "BORRADOR"
                                handleSubmit(data => {
                                    if (!hasAnyValue(data)) {
                                        setError("root", { type: "manual", message: "Completa al menos un campo para guardar borrador." })
                                        return
                                    }
                                    clearErrors("root")
                                    onClickSave("BORRADOR", data)
                                })()
                            }}
                            className="bg-white text-black border border-gray-400 hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700"
                        >
                            Guardar Borrador
                        </Button>
                        <Button
                            className="dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white"
                            disabled={!asesor?.idEmpleado}
                            onClick={() => {
                                submitModeRef.current = "PUBLICAR"
                                handleSubmit(data => onClickSave("PUBLICAR", data))()
                            }}
                        >
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

