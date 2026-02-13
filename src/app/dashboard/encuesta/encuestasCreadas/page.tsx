'use client'
import Link from "next/link"
import { Encuestas } from "../misEncuestas/page"
import { useUser } from "@/Provider/UserProvider"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { SurveyStatusSelector } from "@/Encuesta/components/SurveyStatusSelector"
import { InputSearch, InputSearchValues } from "@/Encuesta/components/inputSearch"
import { LoadingModal } from "@/components/loading-modal"

const fetchEncuestasCreadas = async (nombre: string, filters?: Partial<InputSearchValues>): Promise<Encuestas[]> => {
    const params = new URLSearchParams();
    if (filters?.name) params.set("name", filters.name);
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    const query = params.toString();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/encuestasCreadas/${nombre}${query ? `?${query}` : ""}`)
        .then(async res => await res.json())
    return response
}



export default function Page() {
    const { user } = useUser()
    const [encuestas, setEncuestas] = useState<Encuestas[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const handleSearch = (filters: InputSearchValues) => {
        setIsLoading(true)
        fetchEncuestasCreadas(user!.usuario.trim(),filters).then((res) => {
            setEncuestas(Array.isArray(res) ? res : [])
            setIsLoading(false)
        })
    };

    const onDeleteSurvey = async (id: string) => {
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
                <InputSearch onSearch={handleSearch}/>
                {!isLoading && encuestas.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-slate-200/70 dark:border-zinc-700 bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-slate-900 p-8 shadow-sm">
                    <div className="mx-auto flex max-w-lg flex-col items-center text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300">
                            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                                <path d="M7 3a2 2 0 0 0-2 2v2H4a1 1 0 1 0 0 2h1v2H4a1 1 0 1 0 0 2h1v2H4a1 1 0 1 0 0 2h1v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7Zm0 2h10v14H7V5Zm2 2a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Zm0 4a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Zm0 4a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2H9Z" />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                            No hay encuestas para mostrar
                        </h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Crea tu primera encuesta o ajusta los filtros para ver resultados.
                        </p>
                        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                            Sin resultados
                        </p>
                    </div>
                </div>
            ) :
                (<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-5">
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
                                    onClick={() => { setSelectedSurveyId(v._id); setIsModalOpen(true) }}
                                >
                                    <XIcon className="text-red-500 hover:text-white box-content dark:text-gray-300 " />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 line-clamp-3">{v.description}</p>
                            <div className="space-y-3 mt-auto">
                                <SurveyStatusSelector _id={v._id} surveyState={v.surveyState} />
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
                </div>)}
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

            <LoadingModal isOpen={isLoading} message="cargando..."/>
        </>
    )
}
