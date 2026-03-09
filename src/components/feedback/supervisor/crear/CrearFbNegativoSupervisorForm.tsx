import { Button } from "@/components/ui/button"
import { CloudUpload, SaveIcon } from "lucide-react"

export const CrearFbNegativoSupervisorForm = () => {
    return (
        <div className="flex flex-row py-2 m-2">
            <div className="flex-2/3 border border-gray-200 dark:border-zinc-700 px-3 flex flex-col rounded-sm mr-2 border-b-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                Formulario de feedback negativo
            </div>


            <div className="flex-1/3 border self-start border-gray-200 dark:border-zinc-700 px-5 py-4 flex flex-col rounded-sm ml-2 bg-white dark:bg-zinc-900">
                <h4 className="text-[18px] text-zinc-900 dark:text-zinc-100">Finalizar evaluación</h4>
                <p className="text-sm text-gray-500 dark:text-zinc-400">Confirme y verifique que todos los datos son correctos. El sistema procesará el análisis tras la publicación</p>
                <Button className="mt-4">
                    <CloudUpload />
                    Subir evaluacion
                </Button>
                <Button className="my-2 bg-transparent text-black dark:text-zinc-100 border border-gray-500 dark:border-zinc-600 hover:bg-gray-200 dark:hover:bg-zinc-800">
                    <SaveIcon />
                    Guardar borrador
                </Button>
            </div>
        </div>
    )
}
