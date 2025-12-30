import { useEffect, useState, useCallback } from "react"
import { ArrayJustificaciones, Justificaciones } from "../types/Justificaciones"
import { getJustificaciones } from "../services/justificacionesService";
import { useUser } from "@/Provider/UserProvider";


export const useJustificaciones = () => {
    const { user } = useUser()
    const [justificaciones, setJustificaciones] = useState<ArrayJustificaciones>([])
    const [isLoadingJustificaciones, setIsLoadingJustificaciones] = useState(true);
    const fetchJustificaciones = useCallback(async () => {
        setIsLoadingJustificaciones(true);
        const data = await getJustificaciones({ idUsuario: user?.idEmpleado });
        if (user?.usuario === "FERNANDO GARCIA") {
            const jutificacionesFiltradas = data.filter((justificacion: Justificaciones) =>
                justificacion.fecha >= "2025-11-01" && (justificacion.id_grupo === 14)
            );
            setJustificaciones(jutificacionesFiltradas);
        } else if (user?.usuario === "MAYRA LLIMPE") {
            const jutificacionesFiltradas = data.filter((justificacion: Justificaciones) => justificacion.id_grupo != 14);
            setJustificaciones(jutificacionesFiltradas);
        } else {
            setJustificaciones(data);
        }
        setIsLoadingJustificaciones(false);
        console.log("Justificaciones fetched:", data);
    }, [user]);
    useEffect(() => {
        fetchJustificaciones();
    }, [fetchJustificaciones]);
    return { justificaciones, fetchJustificaciones, isLoadingJustificaciones };
}
