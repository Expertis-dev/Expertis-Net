// src/hooks/useEmpleados.ts
import { useEffect, useState } from "react";
import { useUser } from "@/Provider/UserProvider";
import { getSolicitudesAprobadasTodas } from "../services/vacaciones";
import { ArraySolicitudesAprobadas } from "../types/Vacaciones";

export const useSolicitudesTotales = () => {
    const { user } = useUser()
    const [solicitudesTotales, setSolicitudesTotales] = useState<ArraySolicitudesAprobadas>([])
    const [isloadingSolicitudesTotales, setIsloadingSolicitudesTotales] = useState(false)
    useEffect(() => {
        const fetchSolicitudesTotales = async () => {
            setIsloadingSolicitudesTotales(true);
            const data = await getSolicitudesAprobadasTodas();
            console.log("*****************",data.data)
            setSolicitudesTotales(data.data);
            setIsloadingSolicitudesTotales(false);
        };
        fetchSolicitudesTotales()
    }, [user]);
    return { solicitudesTotales, isloadingSolicitudesTotales };
};