"use client"
import { Button } from '@/components/ui/button'
import { SendHorizonalIcon } from 'lucide-react'
import React, { useState } from 'react'
import { GenerateDocModal } from './GenerateDocModal'

export const GenerateDocButton = () => {
    const [successModal, setSuccessModal] = useState({isOpen: false, inf: null})
    return (
        <>
            <Button 
                onClick={() => setSuccessModal({...successModal, isOpen: true})}
                className="bg-blue-500 dark:text-white dark:hover:bg-blue-800"
            >
                <SendHorizonalIcon />
                Generar Documento
            </Button>
            <GenerateDocModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal({...successModal, isOpen: false})}
            />
        </>
    )
}
