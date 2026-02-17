"use client"
import { InputSearch, InputSearchValues } from "@/Encuesta/components/inputSearch";
import { CheckSquare2 } from "lucide-react";
import { useEffect, useState } from "react";

export interface Encuestas {
    _id: string;
    surveyId: string;
    title: string;
    createdBy: string;
    description: string;
    createdAt: Date;
    surveyState: SurveyStates;
    myResponse?: { createdAt: Date }[]
}

enum SurveyStates {
    PUBLICADA = "PUBLICADA",
    BORRADOR = "BORRADOR",
    CERRADA = "CERRADA"
}

export interface RespuestasTime {
    success: boolean;
    message: string;
    data: Datum[];
}

export interface Datum {
    _id: string;
    survey: string;
    createdAt: Date;
}

const fetchEncuestas = async (filters?: Partial<InputSearchValues>): Promise<Encuestas[]> => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (filters?.name) params.set("name", filters.name);
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);

    const query = params.toString();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/1/encuesta${query ? `?${query}` : ""}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` || '' }
    })
        .then(async res => await res.json())
    return response
}

export default function Page() {
    const [encuestas, setEncuestas] = useState<Encuestas[]>([]);
    const [isLoading, setIsLoading] = useState(false)
    const handleSearch = (filters: InputSearchValues) => {
        setIsLoading(true)
        fetchEncuestas(filters).then((res) => {
            setEncuestas(Array.isArray(res) ? res : [])
            setIsLoading(false)

        })
    };

    useEffect(() => {
        setIsLoading(true)
        fetchEncuestas().then((r) => {
            setEncuestas(r)
            setIsLoading(false)
        }).catch((e) => {
            console.log(e)
            setIsLoading(false)
        })
    }, [])

    return (
        <>
            <h1 className="text-3xl font-semibold">Mis encuestas completadas</h1>

            <InputSearch onSearch={handleSearch} />

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
                            No haz respondido ninguna encuesta o ajusta los filtros para ver resultados.
                        </p>
                        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                            Sin resultados
                        </p>
                    </div>
                </div>
            ) :
                (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-5">
                        {encuestas.map((v: Encuestas) => {
                            const respuestaTime = v.myResponse![0].createdAt
                            return (
                                <article key={v._id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm dark:shadow-md border border-gray-200 dark:border-zinc-700 hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-slate-900/30 transform hover:-translate-y-1 transition flex flex-col">
                                    <div>
                                        <div className="flex justify-end mt-[-12]">
                                            <time className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(v.createdAt).toLocaleDateString("es-PE")}
                                            </time>
                                        </div>
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                                <CheckSquare2 className="text-emerald-600 dark:text-emerald-300" size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h5 className="text-lg font-semibold text-gray-900 dark:text-white leading-7 wrap-break-word">
                                                    {v.title}
                                                </h5>
                                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                                                        Completada
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 mb-4 line-clamp-3 wrap-break-word">
                                        {v.description}
                                    </p>

                                    <div className="mt-auto border-t border-gray-100 dark:border-zinc-800 pt-4">
                                        <dl className="grid grid-cols-1 gap-2 text-xs text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center justify-between gap-3">
                                                <dt className="text-gray-500 dark:text-gray-400">ID</dt>
                                                <dd className="font-medium text-gray-700 dark:text-gray-200 truncate">
                                                    {v.surveyId}
                                                </dd>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <dt className="text-gray-500 dark:text-gray-400">Fecha de envío</dt>
                                                <dd className="font-medium text-gray-700 dark:text-gray-200">
                                                    {respuestaTime
                                                        ? new Date(respuestaTime).toLocaleString("es-PE", {
                                                            timeZone: "America/Lima",
                                                        })
                                                        : "Sin respuestas"}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

        </>
    )
}
