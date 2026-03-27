"use client"

import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export const GoBackLink = () => {
    const router = useRouter()
    return (
        <Button className="flex flex-row text-black dark:text-gray-400 cursor-pointer bg-white hover:bg-white"
            onClick={() => {
                router.back()
            }
            }>
            <ArrowLeft size={15} className="self-center" />
            <p className="text-xs font-light">Volver a la pagina anterior</p>
        </Button>
    )
}
