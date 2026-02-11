"use client"
import { ResponsesPage } from "@/Encuesta/components/resultados/ResponsesPage";
import { StatisticsPage } from "@/Encuesta/components/resultados/StatisticsPage";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { Encuesta } from "@/types/encuesta";
const options = [
    "Ver respuestas",
    "Ver estadísticas"
]

interface Props {
    id: string
}

export interface RespuestasFetch {
    _id:       string;
    surveyId:  string;
    dni:       number;
    name:      string;
    responses: { [key: string]: string[] | string };
    createdAt: Date;
}


const getRespuestas = async (surveyId: string) => {
    try {
        const res: RespuestasFetch[] = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/respuesta/${surveyId}`)
            .then(async res => await res.json())
        return res
    } catch (error) {
        console.log(error)
        notFound()
    }
}

const fetchEncuesta = async (id: string): Promise<Encuesta> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/encuesta/${id}`)
            .then(async r => await r.json());
        if (response === null) return notFound();
        return response
    } catch (error) {
        console.log(error)
        notFound()
    }
}

export const ResultadosPage = ({id}: Props) => {
    const [activeTab, setActiveTab] = useState<string>("Ver respuestas");
    const [respuestas, setRespuestas] = useState<RespuestasFetch[]>();
    const [encuesta, setEncuesta] = useState<Encuesta>()
    const [isReady, setIsReady] = useState(false)
    useEffect(() => {
        const getResp = getRespuestas(id)
        const getSurvey = fetchEncuesta(id)
        Promise.all([getResp, getSurvey])
            .then((values) => {
                setRespuestas(values[0])
                setEncuesta(values[1])
                setIsReady(true)
            }).catch((e) => {
                console.log(e)
                notFound()
            })
    }, [id])
    return (
        <>
            <ul className="hidden sm:flex text-sm font-medium text-center cursor-pointer gap-2">
                {isReady && options.map((o, i) => {
                    const isActive = activeTab === o;

                    return (
                        <li
                            key={i}
                            className="flex-1 rounded-xl overflow-hidden"
                        >
                            <button
                                onClick={() => setActiveTab(o)}
                                className={`w-full px-4 py-2.5 rounded-xl border transition duration-150 focus:outline-none focus:ring-2 focus:ring-brand
                  
                                    ${isActive ? "bg-brand text-black border-brand shadow-sm bg-blue-200"
                                            : "bg-gray-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900"
                                        }
                                    `}
                            >
                                {o}
                            </button>
                        </li>
                    );
                })}
            </ul>
            {
                (activeTab === "Ver respuestas" && isReady === true) ?
                    <ResponsesPage encuesta={encuesta!} responses={respuestas!}/> :
                    <StatisticsPage encuesta={encuesta!} responses={respuestas!}/>
            }
        </>
    )
}
