'use client'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { SuccessModal } from '@/components/success-modal'
import { useUser } from '@/Provider/UserProvider'
import { HistFeedback } from '@/types/feedback/interfaces'
import { EyeIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

interface Modal {
    isOpen: boolean,
    message: string,
    title?: string
}

interface Props {
    feedback: HistFeedback
}

export const SupervisorFila = ({ feedback }: Props) => {
    const {user} = useUser()
    const router = useRouter()
    const statusClassMap: Record<string, string> = {
        BORRADOR: "text-amber-600 dark:text-amber-400",
        POR_GENERAR_ANALISIS: "text-yellow-600 dark:text-yellow-400",
        PUBLICADO: "text-green-600 dark:text-green-400",
        LISTO_PARA_FIRMAR: "text-blue-600 dark:text-blue-400",
        CERRADO: "text-gray-600 dark:text-gray-400",
    }
    const [deletionModal, setDeletionModal] = useState<Modal>({
        isOpen: false,
        message: "¿Estas seguro?",
        title: "Estas a punto de eliminar el feedback"
    })
    const [successModal, setSuccesModal] = useState<Modal>({
        isOpen: false,
        message: "El feedback se eliminó con éxito"
    })

    const onClose = () => {
        setDeletionModal({
            ...deletionModal,
            isOpen: false,
        })
    }

    const onConfirm = () => {
        setDeletionModal({
            ...deletionModal,
            isOpen: false,
        })
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${feedback.idFeedBack}/${user?.usuario}`, {
            method: "DELETE"
        }).then(() => {
            setSuccesModal({
                ...successModal,
                isOpen: true,
            })
            setTimeout(() => {
                setSuccesModal({
                    ...successModal,
                    isOpen: false,
                })
                router.refresh()
            }, 1200)
        }).catch(() => {
            alert("Error al eliminar el feedback")
        })
    }

    const onClickTrash = () => {
        setDeletionModal({
            ...deletionModal,
            isOpen: true,
        })
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 px-3 py-0.5 items-center border-b hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors justify-items-center">
            <div className="flex justify-between md:block">
                <span className='text-[14px]'>{feedback.USUARIO}</span>
            </div>
            <div className="flex justify-between md:block">
                <span className='text-[14px]'>{feedback.periodo.split("T")[0].slice(0, 7)}</span>
            </div>
            <div className="flex justify-between md:block">
                <span
                    className={`${statusClassMap[feedback.estadoFeedBack] ?? "text-gray-600 dark:text-gray-400"} font-medium text-[14px]`}
                >
                    {feedback.estadoFeedBack.split("_").join(" ")}
                </span>
            </div>
            <div className="flex items-center justify-center gap-2 md:justify-start">
                {
                    feedback.estadoFeedBack === "BORRADOR" ?
                        <>
                            <Link
                                href={`/dashboard/feedback/supervisores/crear/${feedback.idFeedBack}`} 
                                className="p-0.5 cursor-pointer rounded-md text-green-600 hover:text-green-800 hover:bg-blue-50 transition-colors dark:hover:bg-blue-950 dark:hover:text-blue-200"
                            >
                                <PencilIcon size={17} />
                            </Link>
                            <button
                                onClick={onClickTrash}
                                className="p-0.5 cursor-pointer rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors dark:hover:bg-red-950 dark:hover:text-red-200">
                                <Trash2Icon size={17} />
                            </button>
                        </>
                        :
                        <Link
                            href={`/dashboard/feedback/supervisores/viewPdf/${feedback.idFeedBack}`}
                            className='-mb-1'
                        >
                            <button className="cursor-pointer p-0.5 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors dark:hover:bg-blue-950 dark:hover:text-blue-200">
                                <EyeIcon size={17} className='self-center' />
                            </button>
                        </Link>
                }
            </div>
            <DeleteConfirmationModal
                isOpen={deletionModal.isOpen}
                message={deletionModal.message}
                onClose={onClose}
                onConfirm={onConfirm}
                title={deletionModal.title!}
            />

            <SuccessModal
                isOpen={successModal.isOpen}
                message={successModal.message}
            />
        </div>
    )
}

