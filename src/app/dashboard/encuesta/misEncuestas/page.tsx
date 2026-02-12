"use client"
import Link from "next/link";
import { InputSearch } from "@/Encuesta/components/inputSearch";
import { NotebookPen } from "lucide-react";
import { useEffect, useState } from "react";
export interface Encuestas {
    _id: string;
    surveyId: string;
    title: string;
    createdBy: string;
    description: string;
    createdAt: Date;
    surveyState: SurveyStates;
}

enum SurveyStates {
    PUBLICADA = "PUBLICADA",
    BORRADOR = "BORRADOR",
    CERRADA = "CERRADA"
}

const fetchEncuestas = async (): Promise<Encuestas[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/0/encuesta`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` || '' }
    })
        .then(async res => await res.json())
    return response
}

export default function Page() {
    const [encuestas, setEncuestas] = useState<Encuestas[]>([]);
    useEffect(() => {
        fetchEncuestas().then((res) => {
            setEncuestas(Array.isArray(res) ? res : [])
        })
    }, [setEncuestas])

    return (
        <>
            <h1 className="text-3xl font-semibold">Mis encuestas</h1>

            <InputSearch />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-5">
                {encuestas.map((v: Encuestas) => (
                    <article key={v._id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm dark:shadow-md border border-gray-200 dark:border-zinc-700 hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-slate-900/30 transform hover:-translate-y-1 transition flex flex-col">
                            <div>
                                <div className="flex justify-end mt-[-12]">
                                    <time className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(v.createdAt).toLocaleDateString("es-PE")}
                                    </time>
                                </div>
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded-xl flex items-center justify-center">
                                        <NotebookPen className="" size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h5 className="text-lg font-semibold text-gray-900 dark:text-white leading-7 wrap-break-word">
                                            {v.title}
                                        </h5>
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-sky-900/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
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
                            <Link href={`/dashboard/encuesta/misEncuestas/${v._id}`} className="inline-flex items-center bg-sky-500 dark:bg-zinc-600 dark:border-zinc-700 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-slate-800 transition">
                                Resolver encuesta
                                <svg className="w-4 h-4 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4" /></svg>
                            </Link>
                                        <dt className="text-gray-500 dark:text-gray-400">ID</dt>
                                        <dd className="font-medium text-gray-700 dark:text-gray-200 truncate">
                                            {v.surveyId}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </article>
                ))}
            </div>
        </>
    )
}
