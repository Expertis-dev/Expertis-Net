'use client'
import Link from "next/link"
import { Encuestas } from "../misEncuestas/page"
import { useUser } from "@/Provider/UserProvider"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { SurveyStatusSelector } from "@/Encuesta/components/SurveyStatusSelector"
import { InputSearch } from "@/Encuesta/components/inputSearch"

const fetchEncuestasCreadas = async (nombre: string): Promise<Encuestas[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/encuestasCreadas/${nombre}`)
        .then(async res => await res.json())
    return response
}



export default function Page() {
    const { user } = useUser()
    const [encuestas, setEncuestas] = useState<Encuestas[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const onDeleteSurvey = async  (id: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/encuesta/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            })
            if (res.ok) {
                setEncuestas(prev => prev.filter(e => e.surveyId !== id))
                setRefreshKey(k => k + 1)
            } else {
                console.error("Delete failed", await res.text())
            }
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        if (user) {
            fetchEncuestasCreadas(user.usuario.trim()).then(res => setEncuestas(res))
        }
    }, [user, refreshKey])
    return (
        <>
            <div>
                <div className="flex justify-between">
                    <h1 className="text-3xl font-semibold">Mis encuestas creadas</h1>
                    <Button variant={"default"} className="h-10 bg-blue-400 dark:bg-zinc-700 dark:text-white">
                        <Link href={`/dashboard/encuesta/crearEncuesta`}>
                        Crear nueva encuesta
                        </Link>
                    </Button>
                </div>
                <InputSearch />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-5">
                    {encuestas.map((v: Encuestas) => (
                        <article key={v._id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm dark:shadow-md border border-gray-200 dark:border-zinc-700 hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-slate-900/30 transform hover:-translate-y-1 transition flex flex-col">
                            <div className="flex items-start gap-3 mb-3 min-w-0">
                                <div className="min-w-0 flex-1">
                                    <h5 className="text-lg font-semibold text-gray-900 dark:text-white leading-7 wrap-break-word">{v.title}</h5>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">ID: {v.surveyId}</span>
                                    <time className="text-xs text-gray-500 dark:text-gray-400">{new Date(v.createdAt).toLocaleDateString()}</time>
                                </div>
                                <button
                                    className="bg-white border-2 border-rose-400 hover:bg-red-500 rounded p-1 transition cursor-pointer dark:bg-red-900/40 dark:border-red-900/40 dark:hover:bg-red-500"
                                    onClick={() => { setSelectedSurveyId(v.surveyId); setIsModalOpen(true) }}
                                >
                                    <XIcon className="text-red-500 hover:text-white box-content dark:text-gray-300 "/>
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 line-clamp-3">{v.description}</p>
                            <div className="space-y-3 mt-auto">
                                <SurveyStatusSelector _id={v._id} surveyState={v.surveyState}/>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 w-full">
                                    <Link href={`/dashboard/encuesta/editarEncuesta/${v._id}`} className="inline-flex w-full sm:w-auto min-w-0 items-center justify-center bg-white text-black border-3 border-blue-400 dark:bg-zinc-900 dark:border-gray-700 dark:text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-md hover:bg-blue-400 dark:hover:bg-zinc-950 transition text-center leading-tight whitespace-normal wrap-break-word">
                                        Editar
                                        <svg className="hidden sm:inline w-4 h-4 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4" /></svg>
                                    </Link>
                                    <Link href={`/dashboard/encuesta/resultados/${v._id}`} className="inline-flex w-full sm:w-auto min-w-0 items-center justify-center bg-blue-400 dark:bg-zinc-950 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-700 transition text-center leading-tight whitespace-normal wrap-break-word">
                                        Ver Respuestas
                                        <svg className="hidden sm:inline w-4 h-4 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4" /></svg>
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedSurveyId(null) }}
                onConfirm={() => {
                    if (selectedSurveyId) {
                        onDeleteSurvey(selectedSurveyId)
                    }
                    setIsModalOpen(false)
                    setSelectedSurveyId(null)
                }}
                title="Eliminar encuesta"
                message="¿Estás seguro de que deseas eliminar esta encuesta? Esta acción no se puede deshacer."
            />
        </>
    )
}
