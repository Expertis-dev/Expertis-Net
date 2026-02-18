'use client'
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { useRouter } from "next/navigation"
import { Pregunta } from "@/types/encuesta"

type Plantilla = {
    _id: string
    templateId: string
    title: string
    createdBy: string
    availableFor: string
    description: string
    category: string
    createdAt: string
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

type PlantillasResponse = {
    success: boolean
    data: Plantilla[]
}
type PlantillaResponse = {
    success: boolean
    data: PlantillaSurvey
}

const fetchPlantillas = async (): Promise<PlantillasResponse> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/encuestaPlantilla`)
        .then(async res => await res.json())
    return response
}

export default function Page() {
    const [plantillas, setPlantillas] = useState<Plantilla[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const onDeleteTemplate = async (id: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/encuestaPlantilla/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            })
            if (res.ok) {
                setPlantillas(prev => prev.filter(p => p._id !== id))
                setRefreshKey(k => k + 1)
            } else {
                console.error("Delete failed", await res.text())
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        setIsLoading(true)
        fetchPlantillas().then(res => {
            setPlantillas(res?.data ?? [])
            setIsLoading(false)
        })
    }, [refreshKey])

    const onPublishAsSurvey = async (id: string) => {
        setIsLoading(true)
        const template: PlantillaResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/encuestaPlantilla/${id}`).then(async res => {
            setIsLoading(false)
            return await res.json()
        })
        if (template?.success && template?.data) {
            sessionStorage.setItem("templateToSurvey", JSON.stringify(template.data))
            router.push('/dashboard/encuesta/crearEncuesta?fromTemplate=1')
        }
    }

    return (
        <>
            <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-semibold">Mis plantillas</h1>
                    <Button variant={"default"} className="h-10 bg-white text-black border-3 border-blue-400 dark:bg-zinc-900 dark:border-gray-700 dark:text-white hover:bg-blue-400 dark:hover:bg-zinc-950">
                        <Link href={`/dashboard/encuesta/encuestasCreadas`}>
                            Volver a encuestas
                        </Link>
                    </Button>
                </div>
                {!isLoading && plantillas.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-slate-200/70 dark:border-zinc-700 bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-slate-900 p-8 shadow-sm">
                        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
                            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                                No hay plantillas para mostrar
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                Crea una plantilla o ajusta los filtros para ver resultados.
                            </p>
                            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                Sin resultados
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-5">
                        {plantillas.map((p: Plantilla) => (
                            <article key={p._id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm dark:shadow-md border border-gray-200 dark:border-zinc-700 hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-slate-900/30 transform hover:-translate-y-1 transition flex flex-col">
                                <div className="flex items-start gap-3 mb-3 min-w-0">
                                    <div className="min-w-0 flex-1">
                                        <h5 className="text-lg font-semibold text-gray-900 dark:text-white leading-7 wrap-break-word">{p.title}</h5>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">ID: {p.templateId}</span>
                                        <time className="text-xs text-gray-500 dark:text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</time>
                                    </div>
                                    <button
                                        className="bg-white border-2 border-rose-400 hover:bg-red-500 rounded p-1 transition cursor-pointer dark:bg-red-900/40 dark:border-red-900/40 dark:hover:bg-red-500"
                                        onClick={() => { setSelectedTemplateId(p._id); setIsModalOpen(true) }}
                                    >
                                        <XIcon className="text-red-500 hover:text-white box-content dark:text-gray-300 " />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-3">{p.description}</p>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 space-y-1">
                                    <div>Creado por: {p.createdBy}</div>
                                    <div>Categoria: {p.category}</div>
                                    <div>Disponible para: {p.availableFor}</div>
                                </div>
                                <div className="flex flex-row flex-wrap gap-2 w-full mt-auto">
                                    <Button
                                        variant={"default"}
                                        className="inline-flex flex-1 min-w-0 items-center justify-center bg-white text-black border-3 border-blue-400 dark:bg-zinc-900 dark:border-gray-700 dark:text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-md hover:bg-blue-400 dark:hover:bg-zinc-950 transition text-center leading-tight whitespace-normal wrap-break-word"
                                        onClick={() => router.push(`/dashboard/encuesta/editarPlantilla/${p._id}`)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant={"default"}
                                        className="inline-flex flex-1 min-w-0 items-center justify-center bg-blue-400 dark:bg-zinc-950 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-700 transition text-center leading-tight whitespace-normal wrap-break-word"
                                        onClick={() => onPublishAsSurvey(p._id)}
                                    >
                                        Publicar como encuesta
                                    </Button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedTemplateId(null) }}
                onConfirm={() => {
                    if (selectedTemplateId) {
                        onDeleteTemplate(selectedTemplateId)
                    }
                    setIsModalOpen(false)
                    setSelectedTemplateId(null)
                }}
                title="Eliminar plantilla"
                message="Estás seguro de que deseas eliminar esta plantilla? Esta acción no se puede deshacer."
            />

        </>
    )
}
