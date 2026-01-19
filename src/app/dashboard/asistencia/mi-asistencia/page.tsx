"use client";

import { useUser } from "@/Provider/UserProvider";
import ReporteMensual from "./ReporteMensual";
import ReporteAsistenciaStaff from "./ReporteAsistenciaStaff";

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

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    // Un usuario es staff si pertenece a los grupos 1 o 16, 
    // o si su nombre de usuario está en la lista de supervisores internos.
    const isStaff =
        user.id_grupo === 1 ||
        user.id_grupo === 16 ||
        SUPERVISORES_INTERNOS.includes(user.usuario?.toUpperCase());

    return isStaff ? <ReporteAsistenciaStaff /> : <ReporteMensual />;
}
