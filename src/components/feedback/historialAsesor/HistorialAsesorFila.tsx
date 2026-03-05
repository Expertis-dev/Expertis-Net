import { DownloadIcon, EyeIcon } from 'lucide-react'
import React from 'react'

export const HistorialAsesorFila = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 px-3 py-0.5 items-center border-b hover:bg-gray-50 transition-colors justify-items-center">
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
                <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
                    <EyeIcon />
                </button>
            </div>
        </div>
    )
}
