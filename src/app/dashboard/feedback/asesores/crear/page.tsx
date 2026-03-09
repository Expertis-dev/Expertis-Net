import { CrearFbAsesorForm } from "@/components/feedback/asesor/crear/CrearFbAsesorForm";
import { HeaderCrearFbAsesor } from "@/components/feedback/asesor/crear/HeaderCrearFbAsesor";

export default function CrearFeedbackAsesorPage() {
    return (
        <div className="flex flex-col rounded-xs dark:text-zinc-100">
            <HeaderCrearFbAsesor />
            <CrearFbAsesorForm/>
        </div>
    );
}

