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
    "JORGE VASQUEZ",
    "ANTHONY TORRES"
];

const NO_ASISTENCIA = [
    "JULIO HIGA",
    "FERNANDO GARCIA",
    "CESAR MENACHO",
    "RAFAEL WONG"
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

    // SI ESTÁ EXCLUIDO DE ASISTENCIA
    if (user.usuario && NO_ASISTENCIA.includes(user.usuario.toUpperCase())) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 p-6">
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                    Control de Asistencia no requerido
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    El usuario <strong>{user.usuario}</strong> está exento del control de asistencia en esta plataforma.
                </p>
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
