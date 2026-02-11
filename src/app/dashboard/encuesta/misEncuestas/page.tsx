import Link from "next/link";
import { InputSearch } from "@/Encuesta/components/inputSearch";
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
    PUBLICADA= "PUBLICADA",
    BORRADOR = "BORRADOR",
    CERRADA = "CERRADA"
}

const fetchEncuestas = async (): Promise<Encuestas[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/encuesta`)
        .then(async res => await res.json())
    return response
}

export default async function Page() {
    const encuestas = await fetchEncuestas();
    return (
        <>
            <h1 className="text-3xl font-semibold">Mis encuestas</h1>

            <InputSearch />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
                {encuestas.map((v: Encuestas) => (
                    <article key={v._id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-slate-900/30 transform hover:-translate-y-1 transition flex flex-col">
                        <div className="flex items-start justify-between gap-3">
                            <h5 className="text-lg font-semibold text-gray-900 dark:text-white leading-7">{v.title}</h5>
                            <time className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(v.createdAt).toLocaleDateString()}</time>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 mb-5 line-clamp-3 wrap-break-word">{v.description}</p>
                        <div className="flex items-center justify-between gap-3 mt-auto">
                            <Link href={`/dashboard/encuesta/misEncuestas/${v.surveyId}`} className="inline-flex items-center bg-blue-600 dark:bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-700 transition">
                                Llenar encuesta
                                <svg className="w-4 h-4 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4" /></svg>
                            </Link>
                            <span className="text-xs text-gray-500 dark:text-gray-400">ID: {v.surveyId}</span>
                        </div>
                    </article>
                ))}
            </div>
        </>
    )
}