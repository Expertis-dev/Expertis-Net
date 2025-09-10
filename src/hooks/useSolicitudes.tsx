// src/hooks/useEmpleados.ts
import { useEffect, useState } from "react";
import { useUser } from "@/Provider/UserProvider";
import { getMisSolicitudes } from "../services/vacaciones";
import { ArraySolicitudes } from "../types/Vacaciones";

export const useSolicitudes = () => {
    const { user } = useUser()
    const [solicitudes, setSolicitudes] = useState<ArraySolicitudes>([])
    const [isloadingSolicitudes, setIsloadingSolicitudes] = useState(false)
    useEffect(() => {
        const fetchURLS = async () => {
            setIsloadingSolicitudes(true);
            const data = await getMisSolicitudes({ id: user?.idEmpleado });
            setSolicitudes(data.data);
            setIsloadingSolicitudes(false);
        };
        fetchURLS()
    }, [user]);
    return { solicitudes, isloadingSolicitudes };
};