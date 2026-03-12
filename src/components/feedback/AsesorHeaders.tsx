import React from 'react'

interface Props {
    esSupervisor?: boolean
}

export const AsesorHeaders = ({esSupervisor}: Props) => {
    return (
        <div className={`hidden md:grid grid-cols-${esSupervisor ? "4" : "5"} bg-gray-100 font-bold px-3 py-0.5 border-b border-gray-200 dark:border-gray-500 justify-items-center dark:bg-zinc-600 `}>
            <div>Nombre</div>
            {
                esSupervisor ? 
                <></>
                :
                <div>Tipo Evaluación</div>
            }
            <div>Tipo Periodo</div>
            <div>Estado</div>
            <div>Acciones</div>
        </div>
    )
}
