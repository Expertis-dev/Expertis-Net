"use client"
import { CrearFbAsesorForm } from "@/components/feedback/asesor/crear/CrearFbAsesorForm";
import { Colaborador, HeaderCrearFbAsesor } from "@/components/feedback/asesor/crear/HeaderCrearFbAsesor";
import { useUser } from "@/Provider/UserProvider";
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
    const { user } = useUser()
    const [asesor, setAsesor] = useState<Colaborador>()
    const today = new Date()
    const toMonthValue = (date: Date) => {
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, "0")
        return `${year}-${month}`
    }
    const toDateValue = (date: Date) => {
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, "0")
        const day = String(date.getUTCDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
    }
    const [periodoRutina, setPeriodoRutina] = useState(toMonthValue(today))
    const [periodoNegativa, setPeriodoNegativa] = useState(toDateValue(today))

    return (
        <div className="flex flex-col rounded-xs dark:text-zinc-100">
            <div className="text-xs flex mb-1 cursor-pointer text-gray-500" onClick={() => router.push(`/dashboard/feedback/asesores/?usuario=${user?.usuario || ""}`)}>
                <ArrowLeft size={15} />
                <p className="self-center">Volver a la pagina anterior</p>
            </div>
            <HeaderCrearFbAsesor
                currentFeedback={currentFeedback}
                setCurrentFeedback={setCurrentFeedback}
                setAsesor={setAsesor}
                periodoRutina={periodoRutina}
                periodoNegativa={periodoNegativa}
                setPeriodoRutina={setPeriodoRutina}
                setPeriodoNegativa={setPeriodoNegativa}
            />
            {
                <CrearFbAsesorForm
                    asesor={asesor}
                    modal={modal}
                    router={router}
                    setModal={setModal}
                    periodoSeleccionado={periodoRutina}
                    currentFeedback={currentFeedback}
                />
            }
        </div>
    );
}

