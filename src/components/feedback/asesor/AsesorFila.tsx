"use client"

import { EyeIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export const AsesorFila = () => {
    const pdfUrl = "https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf";

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
        <div className="grid grid-cols-1 md:grid-cols-5 px-3 py-0.5 items-center border-b hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors justify-items-center">
            <div className="flex justify-between md:block">
                <span>Ana Martinez</span>
            </div>
            <div className="flex justify-between md:block">
                <span>Rutina</span>
            </div>
            <div className="flex justify-between md:block">
                <span>2026-1</span>
            </div>
            <div className="flex justify-between md:block">
                <span className="text-green-600 font-medium text-sm">Publicada</span>
            </div>
            <div className="flex justify-between md:block">
                <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={handleOpenPopup}>
                    <EyeIcon />
                </button>
            </div>
        </div>
    )
}
