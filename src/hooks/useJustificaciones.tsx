import { useEffect, useState } from "react"
import { ArrayJustificaciones } from "../types/Justificaciones"
import { getJustificaciones } from "../services/justificacionesService";
import { useUser } from "@/Provider/UserProvider";

export const useJustificaciones = () => {
    const {user} = useUser()
    const [justificaciones, setJustificaciones] = useState<ArrayJustificaciones>([])
    const [isLoadingJustificaciones, setIsLoadingJustificaciones] = useState(true);
    useEffect(() => {
        const fetchJustificaciones = async () => {
            setIsLoadingJustificaciones(true);
            const data = await getJustificaciones({grupo: user?.id_cargo, cargo: user?.id_cargo});
            setJustificaciones(data.data);
            setIsLoadingJustificaciones(false);
        };
        fetchJustificaciones();
    }, [user]);
    return { justificaciones, isLoadingJustificaciones };
}
