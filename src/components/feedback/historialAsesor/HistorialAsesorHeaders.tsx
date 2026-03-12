import React from 'react'
interface Props {
    esSupervisor?: boolean
}
export const HistorialHeaders = ({esSupervisor}: Props) => {
    return (
        <div className={`hidden md:grid grid-cols-${esSupervisor ? 3 : 4} bg-gray-100 dark:bg-zinc-800 font-bold px-3 py-0.5 border-b border-gray-200 dark:border-gray-600 justify-items-center`}>
            {
                esSupervisor ? 
                <></>
                :
            <div>Tipo Evaluación</div>
            }
            <div>Periodo</div>
            <div>Estado</div>
            <div>Acciones</div>
        </div>
    )
}
