
import { CrearFbSupervisorForm } from "@/components/feedback/supervisor/crear/CrearFbSupervisorForm";
import { Empleado } from "@/types/feedback/interfaces";
import { GoBackLink } from "@/components/feedback/GoBackLink";

const fetchSupervisores = async (): Promise<Array<Empleado>> => {
    const result = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/supervisores`).then(r => r.json())
    return result
}

export default async function CrearFeedbackSupervisorPage() {
    const supervisores = await fetchSupervisores()
    return (
        <>
            <GoBackLink/>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-gray-100">Creacion de evaluacion de supervisor</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Ingrese los resultados de objetivos y desempeno operativo</p>
            
            <CrearFbSupervisorForm 
                supervisores={supervisores}
            />
        </>
    );
}

