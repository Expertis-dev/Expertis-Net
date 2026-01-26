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

export default function Page() {
    const { user } = useUser();

    // Determinar si es administrador/staff
    const isStaff =
        user?.id_grupo === 1 ||
        user?.id_grupo === 16 ||
        SUPERVISORES_INTERNOS.includes(user?.usuario?.toUpperCase() || "");

    useEffect(() => {
        if (user) {
            console.log(`--- VISTA EQUIPO: Entrando como ${isStaff ? "STAFF" : "GRUPO"} ---`);
        }
    }, [isStaff, user]);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    return isStaff ? <ReporteStaff /> : <ReporteGrupal />;
}
