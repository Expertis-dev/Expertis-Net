"use client";

import { CrearFbSupervisorForm } from "@/components/feedback/supervisor/crear/CrearFbSupervisorForm";
import { HeaderCrearFbSupervisor } from "@/components/feedback/supervisor/crear/HeaderCrearFbSupervisor";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CrearFeedbackSupervisorPage() {

    return (
        <>
            <Link className="flex flex-row text-gray-500 dark:text-gray-400 cursor-pointer" href={"/dashboard/feedback/supervisores"}>
                <ArrowLeft size={15} className="self-center" />
                <p className="text-xs font-light">Volver a feedbacks supervisor</p>
            </Link>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-gray-100">Creacion de evaluacion de supervisor</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Ingrese los resultados de objetivos y desempeno operativo</p>
            <HeaderCrearFbSupervisor/>
            <CrearFbSupervisorForm />

        </>
    );
}

