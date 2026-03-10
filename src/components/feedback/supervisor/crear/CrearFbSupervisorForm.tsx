import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CloudUpload, SaveIcon } from "lucide-react"
import { FormattedNumberInput } from "../../FormattedNumberInput"
import { useRouter } from "next/navigation"
import { SuccessModal } from "@/components/success-modal"

export const formatWithThousands = (input: string, maxDecimals = 2) => {
    if (!input) return ""

    let cleaned = input.replace(/[^\d.]/g, "")
    if (!cleaned) return ""

    const firstDot = cleaned.indexOf(".")
    if (firstDot !== -1) {
        cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "")
    }

    const endsWithDot = cleaned.endsWith(".")
    let [intPart, decPart] = cleaned.split(".")

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

export const CrearFbSupervisorForm = () => {
    const [values, setValues] = useState({
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
    })
    const router = useRouter()
    const [modal, setModal] = useState({
        isOpen: false,
        message: ""
    })
    const onClickSave = (type: string) => {
        const message = type === "PUBLICAR" ? "Feedback de supervisor publicado con éxito" : "Borrador guardado con éxito"
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
        <div className="flex flex-row py-2 m-2">
            <div className="flex-2/3 border border-gray-200 dark:border-zinc-700 px-3 flex flex-col rounded-sm mr-2 border-b-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                <h2 className="text-xl my-1 border-b-2 border-gray-200 dark:border-zinc-700 w-[100%] py-3">Indicadores operativos</h2>
                <div className="grid grid-cols-2 gap-1">
                    <div className="p-2">
                        <h4>Recupero Total</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">S/</p>
                                <FormattedNumberInput
                                    value={values.recupero}
                                    onChange={handleChange("recupero", 2)}
                                    placeholder="00.00"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-2">
                        <h4>Meta</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">S/</p>
                                <FormattedNumberInput
                                    value={values.meta}
                                    onChange={handleChange("meta", 2)}
                                    placeholder="00.00"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-2">
                        <h4>Monto PDP</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">S/</p>
                                <FormattedNumberInput
                                    value={values.montoPdp}
                                    onChange={handleChange("montoPdp", 2)}
                                    placeholder="00.00"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-2">
                        <h4>Pago / DK PPC</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                <FormattedNumberInput
                                    value={values.pagoDkPpc}
                                    onChange={handleChange("pagoDkPpc", 2)}
                                    placeholder="00.00"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-2">
                        <h4>Alcance</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                <FormattedNumberInput
                                    value={values.alcance}
                                    onChange={handleChange("alcance", 2)}
                                    placeholder="00.00"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-2">
                        <h4>Efectividad</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                <FormattedNumberInput
                                    value={values.efectividad}
                                    onChange={handleChange("efectividad", 2)}
                                    placeholder="00.00"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-2">
                        <h4>% Cierre</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                <FormattedNumberInput
                                    value={values.cierre}
                                    onChange={handleChange("cierre", 2)}
                                    placeholder="00.00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-2">
                        <h4>% Calidad</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                <FormattedNumberInput
                                    value={values.calidad}
                                    onChange={handleChange("calidad", 2)}
                                    placeholder="00.00"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-2">
                        <h4>Puntualidad - Equipo</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                <FormattedNumberInput
                                    value={values.puntualidadEquipo}
                                    onChange={handleChange("puntualidadEquipo", 2)}
                                    placeholder="00.00"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-2">
                        <h4>Puntualidad</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                <FormattedNumberInput
                                    value={values.puntualidad}
                                    onChange={handleChange("puntualidad", 2)}
                                    placeholder="00.00"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-2">
                        <h4>% Ausentismo Equipo</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                            <div className="flex min-w-[140px] flex-1 flex-row items-center border border-gray-300 p-1 rounded-sm dark:border-zinc-600 dark:bg-zinc-900">
                                <p className="self-center text-gray-800 ml-1 dark:text-zinc-200">%</p>
                                <FormattedNumberInput
                                    value={values.ausentismoEquipo}
                                    onChange={handleChange("ausentismoEquipo", 2)}
                                    placeholder="00.00"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col rounded-sm bg-white dark:bg-zinc-900 dark:border-zinc-700">
                    <h2 className="px-2 text-zinc-900 dark:text-zinc-100">Análisis de resultados</h2>
                    <textarea
                        name="Compromiso de mejora" id="1" rows={6}
                        className="border text-[13px] border-gray-200 rounded-sm px-2 py-1 mx-2 mt-1 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-none resize-y dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-200 dark:placeholder:text-zinc-400 dark:focus:ring-blue-500/30"
                        placeholder="Redacte aqui su compromiso de mejora en base a los datos mostrados"
                    />
                </div>
            </div>


            <div className="flex-1/3 border self-start border-gray-200 dark:border-zinc-700 px-5 py-4 flex flex-col rounded-sm ml-2 bg-white dark:bg-zinc-900">
                <h4 className="text-[18px] text-zinc-900 dark:text-zinc-100">Finalizar evaluación</h4>
                <p className="text-sm text-gray-500 dark:text-zinc-400">Confirme y verifique que todos los datos son correctos. El sistema procesará el análisis tras la publicación</p>
                <Button 
                    onClick={() => onClickSave("PUBLICAR")}
                    className="mt-4"
                >
                    <CloudUpload />
                    Subir evaluacion
                </Button>
                <Button 
                    onClick={() => onClickSave("BORRADOR")}
                    className="my-2 bg-transparent text-black dark:text-zinc-100 border border-gray-500 dark:border-zinc-600 hover:bg-gray-200 dark:hover:bg-zinc-800"
                >
                    <SaveIcon />
                    Guardar borrador
                </Button>
            </div>
            <SuccessModal
                isOpen={modal.isOpen}
                message={modal.message}
            />
        </div>
    )
}
