import { useEffect, useState } from "react"
import { ArrayJustificaciones } from "../types/Justificaciones"
import { getJustificaciones } from "../services/justificacionesService";
import { useUser } from "@/Provider/UserProvider";

export const useJustificaciones = () => {
    const {user} = useUser()
    const [justificaciones, setJustificaciones] = useState<ArrayJustificaciones>([])
    const [isLoadingJustificaciones, setIsLoadingJustificaciones] = useState(true);
    const fetchJustificaciones = async () => {
            setIsLoadingJustificaciones(true);
            const data = await getJustificaciones({idUsuario: user?.idEmpleado, usuario : user?.usuario});
            setJustificaciones(data);
            setIsLoadingJustificaciones(false);
            console.log("Justificaciones fetched:", data);
        };
    useEffect(() => {
        fetchJustificaciones();
    }, [user]);
    return { justificaciones,fetchJustificaciones, isLoadingJustificaciones };
}
