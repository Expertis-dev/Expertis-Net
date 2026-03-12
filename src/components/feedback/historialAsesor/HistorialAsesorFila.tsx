import { EyeIcon } from 'lucide-react'
import React from 'react'

interface Props {
    esSupervisor?: boolean
}

export const HistorialAsesorFila = ({esSupervisor}: Props) => {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-${esSupervisor ? 3 : 4} px-3 py-0.5 items-center border-b hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors justify-items-center`}>
            {
                esSupervisor ? 
                <></>
                :
                <div className="flex justify-between md:block">
                    <span>Rutina</span>
                </div>
            }
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
