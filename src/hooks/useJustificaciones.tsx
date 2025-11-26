import { useEffect, useState, useCallback } from "react"
import { ArrayJustificaciones } from "../types/Justificaciones"
import { getJustificaciones } from "../services/justificacionesService";
import { useUser } from "@/Provider/UserProvider";


export const useJustificaciones = () => {
    const {user} = useUser()
    const [justificaciones, setJustificaciones] = useState<ArrayJustificaciones>([])
    const [isLoadingJustificaciones, setIsLoadingJustificaciones] = useState(true);
    const fetchJustificaciones = useCallback(async () => {
        setIsLoadingJustificaciones(true);
        const data = await getJustificaciones({idUsuario: user?.idEmpleado});
        setJustificaciones(data);
        setIsLoadingJustificaciones(false);
        console.log("Justificaciones fetched:", data);
    }, [user?.idEmpleado]);
    useEffect(() => {
        fetchJustificaciones();
    }, [fetchJustificaciones]);
    return { justificaciones, fetchJustificaciones, isLoadingJustificaciones };
}
