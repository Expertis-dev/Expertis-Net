'use client'
import { EyeIcon } from 'lucide-react'

import Link from 'next/link'
import React from 'react'

interface Props {
    esSupervisor?: boolean
    periodo: Date,
    estado: string,
    idFeedback: number
    tipoFeedback?: string
}

export const HistorialAsesorFila = ({ esSupervisor, estado, idFeedback, periodo, tipoFeedback }: Props) => {
    const handleOpenPdf = async () => {
        try {
            const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/${esSupervisor ? "generateFbRutinaSupervisorPdf" : tipoFeedback === "RUTINA" ? "generateFbRutinaAsesorPdf" : "generateFbNegativoAsesorPdf"}/${idFeedback}`
            const response = await fetch(endpoint)
            if (!response.ok) {
                throw new Error(`Error al generar PDF: ${response.status}`)
            }
            const data = await response.json()
            if (data?.url) {
                window.open(data.url, '_blank', 'noopener,noreferrer')
            } else {
                throw new Error('Respuesta sin url')
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className={`grid grid-cols-${esSupervisor ? 3 : 4} px-3 py-0.5 items-center border-b hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors justify-items-center`}>
            {
                esSupervisor ?
                    <></>
                    :
                    <div className="flex justify-between md:block">
                        <span className={`${tipoFeedback === "NEGATIVO" ? "text-red-500" : "text-green-500"}`}>{tipoFeedback}</span>
                    </div>
            }
            <div className="flex justify-between md:block">
                <span>{(new Date(periodo)).toISOString().slice(0,7)}</span>
            </div>
            <div className="flex justify-between md:block">
                <span className="text-green-600 font-medium text-sm">{estado}</span>
            </div>
            <div className="flex justify-between md:block">
                {
                    (estado === "PUBLICADO" && esSupervisor === true) ?
                        <Link href={`/dashboard/feedback/historialSupervisores/compromiso/${idFeedback}`} >
                            <button className="hover:bg-blue-800 dark:hover:bg-blue-800 bg-blue-500 text-white cursor-pointer dark:bg-blue-950 px-3 my-0.5 rounded-2xl">
                                Redactar Compromiso
                            </button>
                        </Link>
                        :
                        <button
                            onClick={handleOpenPdf}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            aria-label="Ver PDF"
                            type="button"
                        >
                            <EyeIcon />
                        </button>
                }
            </div>
        </div>
    )
}
