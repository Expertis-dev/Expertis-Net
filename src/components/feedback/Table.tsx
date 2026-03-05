import { ReactNode } from 'react'

interface Props {
    children: ReactNode
}

export const Table = ({children}: Props) => {
    return (
        <div className="w-full border border-gray-200 overflow-hidden mt-2">
            {children}
        </div>
    )
}
