// src/hooks/useEmpleados.ts
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/Provider/UserProvider";
import { getMisSolicitudes } from "../services/vacaciones";
import { ArraySolicitudes } from "../types/Vacaciones";

export const useSolicitudes = () => {
    const { user } = useUser()
    const [solicitudes, setSolicitudes] = useState<ArraySolicitudes>([])
    const [isloadingSolicitudes, setIsloadingSolicitudes] = useState(false)
    const fetchSolicitudes = useCallback(async () => {
        setIsloadingSolicitudes(true);
        const { data } = await getMisSolicitudes({ id: user?.idEmpleado });
        setSolicitudes(data);
        setIsloadingSolicitudes(false);
    }, [user]);
    useEffect(() => {
        if (!user?.idEmpleado) return
        fetchSolicitudes()
    }, [fetchSolicitudes, user]);
    return { solicitudes, isloadingSolicitudes, fetchSolicitudes };
};