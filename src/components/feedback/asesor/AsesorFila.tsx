"use client"

import { EyeIcon } from 'lucide-react'
import React from 'react'

interface Props {
    tipoEvaluacion: string;
    periodo: string;
    estadoFeedback: string;
    idFeedback: string
}

export const AsesorFila = ({
    estadoFeedback,
    periodo,
    tipoEvaluacion,
    idFeedback
}: Props) => {
    const pdfUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/${tipoEvaluacion === "RUTINA" ? "generateFbRutinaAsesorPdf" : "generateFbNegativoAsesorPdf"}/${idFeedback}`;

    const handleOpenPopup = () => {
        const width = 1100;
        const height = 750;
        const left = Math.max(0, Math.floor((window.screen.width - width) / 2));
        const top = Math.max(0, Math.floor((window.screen.height - height) / 2));

        const popup = window.open(
            pdfUrl,
            "feedback_pdf_popup",
            `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (popup) popup.focus();
    };
    return (
        <div className="grid grid-cols-5 md:grid-cols-5 px-3 py-0.5 items-center border-b hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors justify-items-center">
            <div className="flex justify-between md:block">
                <span className='text-[14px]'>nombre no disponible</span>
            </div>
            <div className={`flex justify-between md:block ${tipoEvaluacion === "RUTINA" ? "text-green-600" : "text-red-600"}`}>
                <span className='text-[14px]'>{tipoEvaluacion}</span>
            </div>
            <div className="flex justify-between md:block">
                <span className='text-[14px]'>{periodo.slice(0,7)}</span>
            </div>
            <div className="flex justify-between md:block">
                <span className={`${estadoFeedback === "PUBLICADO" ? "text-green-600" : "text-amber-700"} font-medium text-[14px]`}>{estadoFeedback}</span>
            </div>
            <div className="flex justify-between md:block">
                <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={handleOpenPopup}>
                    <EyeIcon size={17}/>
                </button>
            </div>
        </div>
    )
}
