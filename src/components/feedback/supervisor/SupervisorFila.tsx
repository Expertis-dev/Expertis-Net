'use client'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { SuccessModal } from '@/components/success-modal'
import { HistFeedback } from '@/types/feedback/interfaces'
import { EyeIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
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

        setSuccesModal({
            ...successModal,
            isOpen: true,
        })
        setTimeout(() => {
            setSuccesModal({
                ...successModal,
                isOpen: false,
            })
        }, 1200)
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
                <span className={`${feedback.estadoFeedBack === "PUBLICADO" ?
                    "text-green-600 dark:text-green-400" :
                    "text-gray-600 dark:text-gray-400"} 
                    font-medium text-[14px]`}
                >
                    {feedback.estadoFeedBack}
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
