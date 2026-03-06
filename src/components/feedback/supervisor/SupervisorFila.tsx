import { CloudUploadIcon, EyeIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import React from 'react'

export const SupervisorFila = () => {
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
                <span className="text-green-600 dark:text-green-400 font-medium text-sm">Publicada</span>
            </div>
            <div className="flex items-center justify-center gap-2 md:justify-start">
                <button className="p-0.5 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors">
                    <EyeIcon />
                </button>
                <button className="p-0.5 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors">
                    <CloudUploadIcon />
                </button>
                <button className="p-0.5 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors">
                    <PencilIcon />
                </button>
                <button className="p-0.5 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2Icon />
                </button>
            </div>
        </div>
    )
}
