// src/hooks/useEmpleados.ts
import { useEffect, useState } from "react";
import { getAsesores } from "../services/asesoresService";
import { ArrayAsesores } from "../types/Asesores";

export const useAsesores = (grupo: string | undefined) => {
    const [asesores, setAsesores] = useState<ArrayAsesores>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchAsesores = async () => {
            setLoading(true);
            const data = await getAsesores(grupo);
            console.log("ASESORES", data.data);
            setAsesores(data.data);
            setLoading(false);
        };
        fetchAsesores();
    }, [grupo]);
    return { asesores, loading };
};
