import { EyeIcon } from 'lucide-react'
import React from 'react'

export const HistorialAsesorFila = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 px-3 py-0.5 items-center border-b hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors justify-items-center">
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
                <a 
                    href="https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf"
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
                        <EyeIcon />
                    </button>
                </a>
            </div>
        </div>
    )
}
