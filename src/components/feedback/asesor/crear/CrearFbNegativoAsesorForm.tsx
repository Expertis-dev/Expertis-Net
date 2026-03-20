import { SuccessModal } from '@/components/success-modal'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Dispatch, SetStateAction, useRef } from 'react'
import { useForm } from 'react-hook-form';
import { Colaborador } from './HeaderCrearFbAsesor';
import { useUser } from '@/Provider/UserProvider';

interface Modal {
    isOpen: boolean;
    message: string;
}

interface Props {
    modal: Modal,
    setModal: Dispatch<SetStateAction<Modal>>,
    router: AppRouterInstance,
    asesor: Colaborador
}

interface Form {
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
    asesor
}: Props) => {
    const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm<Form>()
    const submitModeRef = useRef<"BORRADOR" | "PUBLICAR">("BORRADOR")
    const requireIfPublishing =
        (message: string) =>
            (value: string) =>
                submitModeRef.current === "PUBLICAR" ? (!!value || message) : true
    const {user} = useUser()
    const onClickSave = async (type: string, {observaciones,...data}: Form) => {
        const message = type === "PUBLICAR" ? "Feedback de asesor publicado con éxito" : "Borrador guardado con éxito"
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/asesor`, {
            headers: {"Content-Type": "application/json"},
            method: "POST",
            body: JSON.stringify({
                idEmpleado: asesor.idEmpleado,
                periodo: (new Date()).toISOString(),
                tipoEvaluacion: "NEGATIVO",
                estadoFeedback: type === "PUBLICAR" ? "PUBLICADO" : "BORRADOR",
                observacionesGenerales: observaciones,
                resultadoEvaluacion: data,
                usrInsert: user?.usuario!,
                tipoEmpleado: "ASESOR"
            })
        }).then(() => {
            setModal({ isOpen: true, message: message })
            setTimeout(() => {
                router.push("/dashboard/feedback/asesores")
            }, 1500);
        }).catch(() => {
            alert("Ocurrio un error, contactar con soporte si el error persiste")
        })
    }

    const hasAnyValue = (data: Form) =>
        Object.values(data).some((value) => value.trim() !== "")

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
                <div className="flex flex-row justify-between p-2 self-end">
                    <div className="flex flex-row justify-between">
                        {errors.root?.message && (
                            <p className="text-red-600 text-xs self-center">{errors.root.message}</p>
                        )}
                        <Button
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
                            className="flex-1 bg-white text-black border border-gray-400 hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700">
                            Guardar Borrador
                        </Button>
                        <Button className="flex-1 ml-4 dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white" onClick={() => {
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
                </div>
            </div>
        </>
    )
}
