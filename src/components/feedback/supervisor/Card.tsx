import React from 'react'

interface Props {
    title: string,
    cantidad: number,
    unidad: string,
    color: string
}

export const Card = ({title, unidad, cantidad, color}: Props) => {
    return (
        <div className="border h-auto flex-1 mx-2 flex flex-row rounded-sm">
            <div className={`h-auto bg-${color}-500 w-1 rounded-l-4xl`} />
            <div className="flex flex-col ml-4 my-1">
                <p className={`text-[15px] my-1 font-semibold text-${color}-500`}>{title}</p>
                <div className="flex flex-row">
                    <h4 className="text-2xl mr-1 font-semibold">{cantidad}</h4>
                    <h5 className="text-xs self-center">{unidad}</h5>
                </div>
            </div>
        </div>
    )
}
