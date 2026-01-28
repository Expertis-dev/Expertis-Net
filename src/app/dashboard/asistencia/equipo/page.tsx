"use client"

import React, { useEffect } from "react";
import { useUser } from "@/Provider/UserProvider";
import ReporteGrupal from "./ReporteGrupal";
import ReporteStaff from "./ReporteStaff";

const SUPERVISORES_INTERNOS = [
    "JORDAN MAYA",
    "JOHAN MAYA",
    "MELINA AYRE",
    "KENNETH CUBA",
    "JORGE PALOMINO",
    "SANDY LOPEZ",
    "LEONOR NAVARRO",
    "JORGE VASQUEZ"
];

import { useColaboradores } from "@/hooks/useColaboradores";
import { Loader2 } from "lucide-react";

export default function Page() {
    const { user } = useUser();
    const { colaboradores, loading } = useColaboradores();

    // Determinar si es administrador/staff
    const isStaff =
        user?.id_grupo === 1 ||
        user?.id_grupo === 16;


    if (!user || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <Loader2 className="h-10 w-10 text-cyan-600 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Cargando equipo...</p>
            </div>
        );
    }



    return isStaff ? <ReporteStaff colaboradores={colaboradores} /> : <ReporteGrupal colaboradores={colaboradores} />;
}
