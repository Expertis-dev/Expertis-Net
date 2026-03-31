"use client"
import { CrearFbSupervisorForm } from "@/components/feedback/supervisor/crear/CrearFbSupervisorForm";
import { Empleado } from "@/types/feedback/interfaces";
import { use, useEffect, useState } from "react";
import { GoBackLink } from "@/components/feedback/GoBackLink";

interface SupervisorFb {
    USUARIO: string;
    idFeedBack: number;
    idEmpleado: number;
    tipoEvaluacion: string;
    periodo: Date;
    estadoFeedback: string;
    observacionesGenerales: string;
    analisisResultados: null;
    tipoEmpleado: string;
    compromisoMejora: null;
    resultadoEvaluacion: string | FormDefaulValues;
    usrInsert: string;
    fecInsert: Date;
}

interface FormDefaulValues {
    recupero: string
    meta: string
    alcance: string
    efectividad: string
    montoPdp: string
    cierre: string
    calidad: string
    pagoDkPpc: string
    puntualidad: string
    puntualidadEquipo: string
    ausentismoEquipo: string
    analisisResultados: string
}

const fetchSupervisores = async (): Promise<Array<Empleado>> => {
    const result = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/supervisores`).then(r => r.json())
    return result
}

export default function EditarFeedbackSupervisorPage({ params }: {
    params: Promise<{ id: string }>
}) {
    const { id: idFeedback } = use(params)

    const [supervisores, setSupervisores] = useState<Empleado[]>([])
    const [form, setForm] = useState<FormDefaulValues>()
    const [data, setData] = useState<SupervisorFb>()

    const parseFeedback = (data: SupervisorFb) => {
        console.log(data)
        const resultadoEvaluacion = JSON.parse(data.resultadoEvaluacion as string)
        return {
            recupero: String(resultadoEvaluacion.recupero),
            meta: String(resultadoEvaluacion.meta),
            alcance: String(resultadoEvaluacion.alcance),
            efectividad: String(resultadoEvaluacion.efectividad),
            montoPdp: String(resultadoEvaluacion.montoPdp),
            cierre: String(resultadoEvaluacion.cierre),
            calidad: String(resultadoEvaluacion.calidad),
            pagoDkPpc: String(resultadoEvaluacion.pagoDkPpc),
            puntualidad: String(resultadoEvaluacion.puntualidad),
            puntualidadEquipo: String(resultadoEvaluacion.puntualidadEquipo),
            ausentismoEquipo: String(resultadoEvaluacion.ausentismoEquipo),
            analisisResultados: String(data.analisisResultados),
        }
    }
    useEffect(() => {
        let isActive = true
        const fetchFeedback = async (idFeedback: number): Promise<SupervisorFb> => {
            const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${idFeedback}`).then(r => r.json())
            return data
        }
        const load = async () => {
            const [supervisoresData, feedbackData] = await Promise.all([
                fetchSupervisores(),
                fetchFeedback(+idFeedback),
            ])
            if (!isActive) return
            setSupervisores(supervisoresData)
            const formValues = parseFeedback(feedbackData)
            setForm(formValues)
            setData(feedbackData)
        }
        load()
        return () => { isActive = false }
    }, [idFeedback])

    return (
        <>
            <GoBackLink/>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-gray-100">Edición de evaluacion de supervisor</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Ingrese los resultados de objetivos y desempeno operativo</p>

            {form ? (
                <CrearFbSupervisorForm
                    supervisores={supervisores}
                    defaultValues={form}
                    supervisorName={data?.USUARIO}
                    periodoDefault={data?.periodo}
                    idFeedback={+idFeedback}
                />
            ) : null}
        </>
    );
}

