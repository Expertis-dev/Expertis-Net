import { EyeIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
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
                <Link
                    href={"/dashboard/feedback/supervisores/viewPdf/1"}
                    className='-mb-1'
                >
                    <button className="cursor-pointer p-0.5 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors dark:hover:bg-blue-950 dark:hover:text-blue-200">
                        <EyeIcon />
                    </button>
                </Link>
                <button className="p-0.5 cursor-pointer rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors dark:hover:bg-blue-950 dark:hover:text-blue-200">
                    <PencilIcon />
                </button>
                <button className="p-0.5 cursor-pointer rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors dark:hover:bg-red-950 dark:hover:text-red-200">
                    <Trash2Icon />
                </button>
            </div>
        </div>
    )
}
