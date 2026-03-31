"use client"
import React, { useState } from 'react'
import { UploadPdfModal } from './UploadPdfModal'
import { Button } from '@/components/ui/button'

interface Props {
    compromisoMejora: string | null,
    estadoFeedBack: string,
    idFeedback: number
}

export const SupervisorPdfActionsPanel = ({compromisoMejora, estadoFeedBack, idFeedback}: Props) => {
    console.log({compromisoMejora, estadoFeedBack})
    const unsignedPdfUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/generateFbRutinaSupervisorPdf/${idFeedback}`;
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    

    const openPdfInPopup = (url: string) => {
        const width = 1100;
        const height = 750;
        const left = Math.max(0, Math.floor((window.screen.width - width) / 2));
        const top = Math.max(0, Math.floor((window.screen.height - height) / 2));

        const popup = window.open(
            url,
            "feedback_pdf_popup",
            `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (popup) popup.focus();
    };

    const onClickPdfSigned = async () => {
        console.log(idFeedback)
        const response: {url: string, key: string} = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/supervisor/fbFirmado/${idFeedback}`).then(r => r.json());
        openPdfInPopup(response.url)
    }

    return (
        <div className="space-y-3">
            <div className="rounded-sm border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Archivo PDF sin firmar</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Se abrira en una ventana emergente.</p>
                <Button 
                    className="mt-4 w-full" 
                    onClick={() => openPdfInPopup(unsignedPdfUrl)}
                    disabled={compromisoMejora === ""}
                >
                    Ver PDF sin firmar
                </Button>
            </div>

            <div className="rounded-sm border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Archivo PDF firmado</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Se abrira en una ventana emergente.</p>
                <Button 
                    className="mt-4 w-full" 
                    onClick={onClickPdfSigned}
                    disabled={estadoFeedBack !== "CERRADO"}
                >
                    Ver PDF firmado
                </Button>
                <Button 
                    className="mt-4 w-full bg-blue-900 hover:bg-blue-800 text-zinc-200" 
                    onClick={() => setIsUploadModalOpen(true)}
                    disabled={estadoFeedBack !== "LISTO_PARA_FIRMAR"}
                >
                    Subir PDF firmado
                </Button>
            </div>
            <UploadPdfModal isUploadModalOpen={isUploadModalOpen} setIsUploadModalOpen={setIsUploadModalOpen} idFeedback={idFeedback}/>
        </div>
    )
}
