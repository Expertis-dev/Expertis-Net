import { Button } from "@/components/ui/button"
import { ArrowRight, InfoIcon, SquareIcon } from "lucide-react"
import { formatWithThousands } from "../../supervisor/crear/CrearFbSupervisorForm"
import { useState } from "react"
import { FormattedNumberInput } from "../../FormattedNumberInput"
import { useRouter } from "next/navigation"
import { SuccessModal } from "@/components/success-modal"

export const CrearFbAsesorForm = () => {
    const [values, setValues] = useState({
        recupero: "", recuperoMeta: "",
        calidadPdp: "", calidadPdpPromedio: "",
        calidadCierre: "", calidadCierrePromedio: "",
        produccionPdp: "", produccionPdpPromedio: "",
        ticketPromedio: "", ticketPromedioMeta: "",
        faltasInjustificadas: "",
        tardanzasInjustificadas: "",
    })

    const router = useRouter()
    const [modal, setModal] = useState({
        isOpen: false,
        message: ""
    })

    const onClickSave = (type: string) => {
        const message = type === "PUBLICAR" ? "Feedback de asesor publicado con éxito" : "Borrador guardado con éxito"
        setModal({isOpen: true, message: message})
        setTimeout(() => {
            router.back()
        }, 1500);
    }

    const handleChange =
        (key: keyof typeof values, maxDecimals = 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const formatted = formatWithThousands(e.target.value, maxDecimals)
            setValues((prev) => ({ ...prev, [key]: formatted }))
        }
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

                    <div className="flex flex-col p-2">
                        <h4>Recupero </h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <p className="self-center text-gray-800 dark:text-zinc-200">S/</p>
                                <FormattedNumberInput
                                    value={values.recupero}
                                    onChange={handleChange("recupero", 2)}
                                    placeholder="Actual"
                                    inputAsesor={true}
                                />
                            </div>
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm bg-gray-300 dark:border-zinc-600 dark:bg-zinc-700">
                                <p className="self-center text-gray-800 dark:text-zinc-200">S/</p>
                                <FormattedNumberInput
                                    value={values.recuperoMeta}
                                    onChange={handleChange("recuperoMeta", 2)}
                                    placeholder="Meta"
                                    inputAsesor={true}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col p-2">
                        <h4>Ticket Promedio</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <p className="self-center text-gray-800 dark:text-zinc-200">S/</p>
                                <FormattedNumberInput
                                    value={values.ticketPromedio}
                                    onChange={handleChange("ticketPromedio", 2)}
                                    placeholder="Actual"
                                    inputAsesor={true}
                                />
                            </div>
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm bg-gray-300 dark:border-zinc-600 dark:bg-zinc-700">
                                <p className="self-center text-gray-800 dark:text-zinc-200">S/</p>
                                <FormattedNumberInput
                                    value={values.ticketPromedioMeta}
                                    onChange={handleChange("ticketPromedioMeta", 2)}
                                    placeholder="Meta"
                                    inputAsesor={true}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col p-2">
                        <h4>Calidad PDP (%)</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <FormattedNumberInput
                                    value={values.calidadPdp}
                                    onChange={handleChange("calidadPdp", 2)}
                                    placeholder="Actual"
                                    inputAsesor={true}
                                />
                                <p className="self-center text-gray-800 dark:text-zinc-200">%</p>
                            </div>
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm bg-gray-300 dark:border-zinc-600 dark:bg-zinc-700">
                                <FormattedNumberInput
                                    value={values.calidadPdpPromedio}
                                    onChange={handleChange("calidadPdpPromedio", 2)}
                                    placeholder="Promedio por asesor"
                                    inputAsesor={true}
                                />
                                <p className="self-center text-gray-800 dark:text-zinc-200">%</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col p-2">
                        <h4>Calidad Cierre (%)</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <FormattedNumberInput
                                    value={values.calidadCierre}
                                    onChange={handleChange("calidadCierre", 2)}
                                    placeholder="Actual"
                                    inputAsesor={true}
                                />
                                <p className="self-center text-gray-800 dark:text-zinc-200">%</p>
                            </div>
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm bg-gray-300 dark:border-zinc-600 dark:bg-zinc-700">
                                <FormattedNumberInput
                                    value={values.calidadCierrePromedio}
                                    onChange={handleChange("calidadCierrePromedio", 2)}
                                    placeholder="Promedio por asesor"
                                    inputAsesor={true}
                                />
                                <p className="self-center text-gray-800 dark:text-zinc-200">%</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col p-2">
                        <h4>Producción PDP</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <p className="self-center text-gray-800 dark:text-zinc-200">S/</p>
                                <FormattedNumberInput
                                    value={values.produccionPdp}
                                    onChange={handleChange("produccionPdp", 0)}
                                    placeholder="Actual"
                                    inputAsesor={true}
                                />
                            </div>
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm bg-gray-300 dark:border-zinc-600 dark:bg-zinc-700">
                                <p className="self-center text-gray-800 dark:text-zinc-200">S/</p>
                                <FormattedNumberInput
                                    value={values.produccionPdpPromedio}
                                    onChange={handleChange("produccionPdpPromedio", 0)}
                                    placeholder="Promedio por asesor"
                                    inputAsesor={true}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col p-2">
                        <h4>Asistencia (Faltas/Tardanzas)</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <FormattedNumberInput
                                    value={values.faltasInjustificadas}
                                    onChange={handleChange("faltasInjustificadas", 0)}
                                    placeholder="Faltas injustificadas"
                                    inputAsesor={true}
                                />
                            </div>
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm bg-gray-300 dark:border-zinc-600 dark:bg-zinc-700">
                                <FormattedNumberInput
                                    value={values.tardanzasInjustificadas}
                                    onChange={handleChange("tardanzasInjustificadas", 0)}
                                    placeholder="Tardanzas injustificadas"
                                    inputAsesor={true}
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col rounded-sm dark:text-zinc-100">
                <div className="flex flex-col mt-4 p-2 border rounded-sm bg-white dark:bg-zinc-900 dark:border-zinc-700">
                    <h2 className="text-xl px-2 font-semibold">Observaciones Generales</h2>
                    <textarea
                        name="Compromiso de mejora" id="1" rows={6}
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
                    <div className="flex flex-row justify-between">
                        <Button 
                            onClick={() => onClickSave("BORRADOR")}
                            className="flex-1 bg-white text-black border border-gray-400 hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700">
                            Guardar Borrador
                        </Button>
                        <Button className="flex-1 ml-4 dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white" onClick={() => onClickSave("PUBLICAR")}>
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
