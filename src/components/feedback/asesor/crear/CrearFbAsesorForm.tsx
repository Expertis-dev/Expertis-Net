import { Button } from "@/components/ui/button"
import { ArrowRight, InfoIcon, SquareIcon } from "lucide-react"
import { formatWithThousands } from "../../supervisor/crear/CrearFbSupervisorForm"
import { Dispatch, SetStateAction, useEffect, useRef } from "react"
import { FormattedNumberInput } from "../../FormattedNumberInput"
import { SuccessModal } from "@/components/success-modal"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { Controller, useForm } from "react-hook-form"
import { useUser } from "@/Provider/UserProvider"
import { Colaborador } from "./HeaderCrearFbAsesor"
import { useParams } from "next/navigation"

interface Modal {
    isOpen: boolean;
    message: string;
}

interface Props {
    modal: Modal,
    setModal: Dispatch<SetStateAction<Modal>>,
    router: AppRouterInstance,
    asesor: Colaborador,
    defaultValues?: Form
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
                { name: "recupero", label: "Actual", prefix: "S/", decimals: 2, placeholder: "Actual" },
                { name: "recuperoMeta", label: "Meta", prefix: "S/", decimals: 2, placeholder: "Meta" },
            ],
        },
        {
            name: "Ticket de PDP",
            values: [
                { name: "ticketDePdp", label: "Actual", prefix: "S/", decimals: 2, placeholder: "Actual" },
                { name: "ticketDePdpPromedio", label: "Meta", prefix: "S/", decimals: 2, placeholder: "Promedio por asesor" },
            ],
        },
        {
            name: "Calidad PDP (%)",
            values: [
                { name: "calidadPdp", label: "Actual", prefix: "%", decimals: 2, placeholder: "Actual" },
                { name: "calidadPdpPromedio", label: "Promedio por asesor", prefix: "%", decimals: 2, placeholder: "Promedio por asesor" },
            ],
        },
        {
            name: "Calidad Cierre (%)",
            values: [
                { name: "calidadCierre", label: "Actual", prefix: "%", decimals: 2, placeholder: "Actual" },
                { name: "calidadCierrePromedio", label: "Promedio por asesor", prefix: "%", decimals: 2, placeholder: "Promedio por asesor" },
            ],
        },
        {
            name: "Produccion PDP",
            values: [
                { name: "produccionPdp", label: "Actual", prefix: "S/", decimals: 0, placeholder: "Actual" },
                { name: "produccionPdpPromedio", label: "Promedio por asesor", prefix: "S/", decimals: 0, placeholder: "Promedio por asesor" },
            ],
        },
        {
            name: "Asistencia (Faltas/Tardanzas)",
            values: [
                { name: "faltasInjustificadas", label: "Faltas injustificadas", prefix: "", decimals: 0, placeholder: "Actual" },
                { name: "tardanzasInjustificadas", label: "Tardanzas injustificadas", prefix: "", decimals: 0, placeholder: "Promedio por asesor" },
            ],
        },
    ]

export const CrearFbAsesorForm = ({
    modal,
    setModal,
    router,
    asesor,
    defaultValues
}: Props) => {
    const {id: idFeedback} = useParams<{id: string}>()
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

    const { control, register, handleSubmit, setError, clearErrors, formState: { errors }, reset } = useForm<Form>({
        defaultValues: buildDefaults(defaultValues)
    })
    const { user } = useUser()
    const submitModeRef = useRef<"BORRADOR" | "PUBLICAR">("BORRADOR")

    const requireIfPublishing = (message: string) => (value: string) =>
        submitModeRef.current === "PUBLICAR" ? (!!value || message) : true

    const onClickSave = async (type: string, { observacionesGenerales, ...data }: Form) => {
        const message = type === "PUBLICAR" ? "Feedback de asesor publicado con éxito" : "Borrador guardado con éxito"
        if (!defaultValues){
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/asesor`, {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({
                    idEmpleado: asesor.idEmpleado,
                    periodo: (new Date()).toISOString(),
                    tipoEvaluacion: "RUTINA",
                    estadoFeedback: type === "PUBLICAR" ? "PUBLICADO" : "BORRADOR",
                    observacionesGenerales: observacionesGenerales,
                    resultadoEvaluacion: data,
                    usrInsert: user?.usuario || "",
                    tipoEmpleado: "ASESOR"
                })
            }).then(() => {
                setModal({ isOpen: true, message: message })
                setTimeout(() => {
                    router.push(`/dashboard/feedback/asesores/?usuario=${user?.usuario || ""}`)
                }, 1500);
            }).catch(() => {
                alert("Ocurrio un error, contactar con soporte si el error persiste")
            })
        }else{
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/asesor`, {
                headers: { "Content-Type": "application/json" },
                method: "PUT",
                body: JSON.stringify({
                    idFeedback,
                    estadoFeedback: type === "PUBLICAR" ? "PUBLICADO" : "BORRADOR",
                    observacionesGenerales: observacionesGenerales,
                    resultadoEvaluacion: data,
                })
            }).then(() => {
                setModal({ isOpen: true, message: message })
                setTimeout(() => {
                    router.push(`/dashboard/feedback/asesores/?usuario=${user?.usuario || ""}`) //! AGREGAR QUERYPARAM DE SUPERVISOR
                }, 1500);
            }).catch(() => {
                alert("Ocurrio un error, contactar con soporte si el error persiste")
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
    return (
        <>
            <div className="flex flex-col mt-4 p-2 border rounded-sm bg-white dark:bg-zinc-900 dark:border-zinc-700">
                <div className="flex flex-row p-4 justify-between">
                    <p className="font-semibold">
                        Matriz de Desempeño
                    </p>
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
                                    <h4>{field.name} </h4>
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
                    <textarea
                        id="observacionesGenerales"
                        rows={6}
                        {...register("observacionesGenerales", {
                            validate: requireIfPublishing("Las observaciones generales son obligatorias")
                        })}
                        className="border text-[13px] border-gray-200 rounded-sm px-2 py-1 mx-2 mt-1 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-none resize-y dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-200 dark:placeholder:text-zinc-400 dark:focus:ring-blue-500/30"
                        placeholder="Redacte aqui su compromiso de mejora en base a los datos mostrados"
                    />
                </div>
            </div>

            <div className="flex flex-col mt-4 p-2 border rounded-sm bg-white dark:bg-zinc-900 dark:border-zinc-700">
                <div className="flex flex-row justify-between p-2">
                    <div className="flex-row flex">
                        <InfoIcon className="self-center text-gray-500 dark:text-zinc-400" size={15} />
                        <p className="text-gray-500 ml-1 text-xs self-center dark:text-zinc-400">Los campos vacios se guardarán con valor 0</p>
                    </div>
                    {errors.root?.message && (
                        <p className="text-red-600 text-xs self-center">{errors.root.message}</p>
                    )}
                    <div className="flex flex-row justify-between">
                        <Button
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
                        <Button className="flex-1 ml-4 dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white"
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
                </div>
            </div>
        </>
    )
}
