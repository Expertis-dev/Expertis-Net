"use client"
import { SuccessModal } from '@/components/success-modal'
import { Button } from '@/components/ui/button'
import { useUser } from '@/Provider/UserProvider'
import { ArrowLeft, ArrowRightToLine, BarChartIcon, NotebookPenIcon } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FeedbackSupervisor } from './SideTable'
import { LoadingModal } from '@/components/loading-modal'

interface CompromisoMejora {compromisoMejora: string};

interface Props{
    feedback: FeedbackSupervisor
}

export const CompromisoPage = ({feedback}: Props) => {
    const router = useRouter()
    const [modal, setModal] = useState({
        isOpen: false,
        message: ""
    })
    const [isLoading, setIsLoading] = useState(false)

    const {register, handleSubmit, formState: {errors}} = useForm<CompromisoMejora>()
    const {idFeedback} = useParams<{idFeedback: string}>() // idFeedback

    const onClickSave = (data: CompromisoMejora) => {
        setIsLoading(true)
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${idFeedback}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                estadoFeedback: "LISTO_PARA_FIRMAR",
                observacionesGenerales: feedback.observacionesGenerales,
                analisisResultados: feedback.analisisResultados,
                compromisoMejora: data.compromisoMejora,
                resultadoEvaluacion: JSON.stringify(feedback.resultadoEvaluacion),
                usuario: user?.usuario
            })
        }).then(() => {
            setModal({isOpen: true, message: "Compromiso guardado con éxito"})
            setTimeout(() => {
                router.push(`/dashboard/feedback/historialSupervisores/${user?.idEmpleado}`)
            }, 1000);
        }).catch(() => {
            alert("Fallo al subir el compromiso")
        }).finally(() => {
            setIsLoading(false)
        })
    }

    const {user} = useUser()

    return (
        <div className="flex flex-col flex-3/4 relative">
            <Link
                href={`/dashboard/feedback/historialSupervisores/${user?.idEmpleado}`}
                className="text-xs flex items-center gap-1 mb-2 cursor-pointer text-gray-500 self-start hover:text-gray-700"
            >
                <ArrowLeft size={15} />
                <span>Volver a la pagina anterior</span>
            </Link>
            <div className="flex flex-col p-4 mx-5 bg-blue-50 rounded-md dark:bg-blue-950/30">
                <div className="flex flex-row">
                    <BarChartIcon className="text-blue-500 mr-1 mb-0.5" size={20} />
                    <h1 className="text-xs self-center text-black font-semibold dark:text-zinc-100">ANÁLISIS DE RESULTADOS</h1>
                </div>
                <hr className="my-1.5 border-gray-300 dark:border-zinc-600" />
                <p className="text-[13px] text-gray-700 dark:text-zinc-300 whitespace-pre-line">
                    {feedback.analisisResultados}
                </p>
                <p className="text-gray-400 text-[9px] mt-2 dark:text-zinc-400">EMITIDO POR: JEFATURA DE OPERACIONES</p>
            </div>
            <div className="flex flex-col px-4 mt-2">
                <div className="flex flex-row my-2">
                    <NotebookPenIcon className="text-blue-500 mr-1 mb-0.5" size={25} />
                    <h1 className="text-lg self-center text-blue-500 font-semibold">Acción Requerida</h1>
                </div>
                <h1 className="font-bold text-xl dark:text-zinc-100">Compromiso de Mejora</h1>
                <p className="text-gray-700 dark:text-zinc-300">Basado en los resultados y el análisis superior, detalla  tu plan de acción para que el próximo periodo. Define objetivos accionables para las métricas que requieren atencion</p>
                <hr className="border-none py-2" />
                <p className="text-gray-700 dark:text-zinc-300">Plan de acción detallado: </p>
                <p className='text-red-700 text-xs font-semibold ml-2'>{errors.compromisoMejora?.message}</p>
                <textarea
                    id="1" rows={6}
                    {...register("compromisoMejora", {required: "Tienes que redactar el compromiso"})}
                    className="border-2 text-[13px] border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-none resize-y dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-200 dark:placeholder:text-zinc-400"
                    placeholder="Redacte aqui su compromiso de mejora en base a los datos mostrados"
                />
                <div className="flex flex-row self-end">
                    <Button 
                        className="mt-2 bg-blue-500 hover:bg-blue-900 rounded-md dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white"
                        onClick={handleSubmit(onClickSave)}
                    >
                        Guardar y marcar listo
                        <ArrowRightToLine />
                    </Button>
                </div>
            </div>
            <SuccessModal
                isOpen={modal.isOpen}
                message={modal.message}
            />
            <LoadingModal
                isOpen={isLoading}
                message='Cargando...'
            />
        </div>
    )
}
