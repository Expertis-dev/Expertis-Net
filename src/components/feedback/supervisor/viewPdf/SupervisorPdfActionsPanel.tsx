"use client"
import React, { useState } from 'react'
import { UploadPdfModal } from './UploadPdfModal'
import { Button } from '@/components/ui/button'

export const SupervisorPdfActionsPanel = () => {
    const unsignedPdfUrl = "https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf";
    const signedPdfUrl = "https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf";
    
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
    return (
        <div className="space-y-3">
            <div className="rounded-sm border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Archivo PDF sin firmar</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Se abrira en una ventana emergente.</p>
                <Button className="mt-4 w-full" onClick={() => openPdfInPopup(unsignedPdfUrl)}>
                    Ver PDF sin firmar
                </Button>
            </div>

            <div className="rounded-sm border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Archivo PDF firmado</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Se abrira en una ventana emergente.</p>
                <Button className="mt-4 w-full" onClick={() => openPdfInPopup(signedPdfUrl)}>
                    Ver PDF firmado
                </Button>
                <Button className="mt-4 w-full bg-blue-900 hover:bg-blue-800 text-zinc-200" onClick={() => setIsUploadModalOpen(true)}>
                    Subir PDF firmado
                </Button>
            </div>
            <UploadPdfModal isUploadModalOpen={isUploadModalOpen} setIsUploadModalOpen={setIsUploadModalOpen} />
        </div>
    )
}
