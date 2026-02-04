"use client"
import { useUser } from "@/Provider/UserProvider";
import { useTodosLosEmpleados } from "@/hooks/useTodosLosEmpleados";
import { Loader2 } from "lucide-react";
import ReporteMensualStaff from "./ReporteMensualStaff";
import { useEffect } from "react";

export default function Page() {
    const { user } = useUser();
    const { empleados, loading } = useTodosLosEmpleados();
    useEffect(() => {

        console.log("Empleados")
        console.log(empleados)
    })
    if (!user || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <Loader2 className="h-10 w-10 text-cyan-600 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Cargando reporte mensual...</p>
            </div>
        );
    }

    return <ReporteMensualStaff colaboradores={empleados} />;
}
