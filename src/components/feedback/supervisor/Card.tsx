import React from 'react'

type CardColor = 'gray' | 'orange' | 'green'

interface Props {
    title: string,
    cantidad: number,
    unidad: string,
    color: CardColor
}

export const Card = ({title, unidad, cantidad, color}: Props) => {
    const colorStyles: Record<CardColor, { bar: string; text: string }> = {
        gray: { bar: 'bg-gray-500', text: 'text-gray-500' },
        orange: { bar: 'bg-orange-500', text: 'text-orange-500' },
        green: { bar: 'bg-green-500', text: 'text-green-500' },
    }

    const selectedColor = colorStyles[color]

    return (
        <div className="border h-auto flex-1 mx-2 flex flex-row rounded-sm">
            <div className={`h-auto w-1 rounded-l-4xl ${selectedColor.bar}`} />
            <div className="flex flex-col ml-4 my-1">
                <p className={`text-[15px] my-1 font-semibold ${selectedColor.text}`}>{title}</p>
                <div className="flex flex-row">
                    <h4 className="text-2xl mr-1 font-semibold">{cantidad}</h4>
                    <h5 className="text-xs self-center">{unidad}</h5>
                </div>
            </div>
        </div>
    )
}
