import { notFound } from "next/navigation"
import { Pregunta } from "@/types/encuesta"
import { EditarPlantillaFormClient } from "./EditarPlantillaFormClient"

interface Props {
    id: string
}

type PlantillaSurvey = {
    _id: string
    templateId: string
    title: string
    createdBy: string
    availableFor: string
    description: string
    category: string
    createdAt: string
    preguntas: Pregunta[]
}

type PlantillaResponse = {
    success: boolean
    data: PlantillaSurvey
}

const fetchPlantilla = async (id: string): Promise<PlantillaSurvey> => {
    try {
        const response: PlantillaResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/encuestaPlantilla/${id}`)
            .then(async r => await r.json())
        if (!response?.success || !response?.data) return notFound()
        return response.data
    } catch (error) {
        console.log(error)
        notFound()
    }
}

export default async function Page({
    params,
}: {
    params: Promise<Props>
}) {
    const { id } = await params
    const plantilla = await fetchPlantilla(id)
    return (
        <div className="bg-gray-200 dark:bg-zinc-900 min-h-screen -mx-4 px-4 -my-4">
            <EditarPlantillaFormClient plantilla={plantilla} />
        </div>
    )
}
