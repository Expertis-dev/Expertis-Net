
import { CrearFbSupervisorForm } from "@/components/feedback/supervisor/crear/CrearFbSupervisorForm";
import { HeaderCrearFbSupervisor } from "@/components/feedback/supervisor/crear/HeaderCrearFbSupervisor";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Empleado } from "@/types/feedback/interfaces";

const fetchSupervisores = async (): Promise<Array<Empleado>> => {
    const result = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/supervisores`).then(r => r.json())
    return result
}

export default async function CrearFeedbackSupervisorPage() {
    const supervisores = await fetchSupervisores()
    return (
        <>
            <Link className="flex flex-row text-gray-500 dark:text-gray-400 cursor-pointer" href={"/dashboard/feedback/supervisores"}>
                <ArrowLeft size={15} className="self-center" />
                <p className="text-xs font-light">Volver a feedbacks supervisor</p>
            </Link>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-gray-100">Creacion de evaluacion de supervisor</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Ingrese los resultados de objetivos y desempeno operativo</p>
            
            <CrearFbSupervisorForm 
                supervisores={supervisores}
            />
        </>
    );
}

