"use client"
import { CrearFbAsesorForm } from "@/components/feedback/asesor/crear/CrearFbAsesorForm";
import { CrearFbNegativoAsesorForm } from "@/components/feedback/asesor/crear/CrearFbNegativoAsesorForm";
import { HeaderCrearFbAsesor } from "@/components/feedback/asesor/crear/HeaderCrearFbAsesor";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CrearFeedbackAsesorPage() {
    const [currentFeedback, setCurrentFeedback] = useState("rutina")
    const router = useRouter()
    const [modal, setModal] = useState({
        isOpen: false,
        message: ""
    })
    return (
        <div className="flex flex-col rounded-xs dark:text-zinc-100">
            <div className="text-xs flex mb-1 cursor-pointer text-gray-500" onClick={() => router.back()}>
                <ArrowLeft size={15}/>
                <p className="self-center">Volver a la pagina anterior</p>
            </div>
            <HeaderCrearFbAsesor currentFeedback={currentFeedback} setCurrentFeedback={setCurrentFeedback}/>
            {
                currentFeedback === "rutina" ? 
                <CrearFbAsesorForm
                    modal={modal}
                    router={router}
                    setModal={setModal}
                />
                :
                <CrearFbNegativoAsesorForm
                    modal={modal}
                    router={router}
                    setModal={setModal}
                />
            }
        </div>
    );
}

