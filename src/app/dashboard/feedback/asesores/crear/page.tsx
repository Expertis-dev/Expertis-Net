"use client"
import { CrearFbAsesorForm } from "@/components/feedback/asesor/crear/CrearFbAsesorForm";
import { CrearFbNegativoAsesorForm } from "@/components/feedback/asesor/crear/CrearFbNegativoAsesorForm";
import { HeaderCrearFbAsesor } from "@/components/feedback/asesor/crear/HeaderCrearFbAsesor";
import { useState } from "react";

export default function CrearFeedbackAsesorPage() {
    const [currentFeedback, setCurrentFeedback] = useState("rutina")
    return (
        <div className="flex flex-col rounded-xs dark:text-zinc-100">
            <HeaderCrearFbAsesor currentFeedback={currentFeedback} setCurrentFeedback={setCurrentFeedback}/>
            {
                currentFeedback === "rutina" ? 
                <CrearFbAsesorForm/>
                :
                <CrearFbNegativoAsesorForm/>
            }
        </div>
    );
}

