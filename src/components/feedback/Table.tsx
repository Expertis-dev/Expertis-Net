import { ReactNode } from 'react'

interface Props {
    children: ReactNode
}

export const Table = ({children}: Props) => {
    return (
        <div className="border border-gray-200 rounded-sm dark:border-zinc-600 overflow-hidden mt-2 mx-2">
            {children}
        </div>
    )
}
