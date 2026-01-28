// src/hooks/useEmpleados.ts
import { useEffect, useState } from "react";
import { getColaboradores } from "../services/asesoresService";
import { ArrayEmpleado } from "../types/Empleado";
import { useUser } from "@/Provider/UserProvider";

export const useColaboradores = () => {
    const [colaboradores, setColaboradores] = useState<ArrayEmpleado>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        let isMounted = true;
        const currentUser = user?.usuario;

        if (!currentUser) {
            setLoading(false);
            return;
        }

        const storageKey = `colaboradores_${currentUser}`;

        // 1. Intentar cargar desde localStorage inmediatamente para velocidad
        const cached = localStorage.getItem(storageKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setColaboradores(parsed);
                    setLoading(false); // Carga aparente inmediata
                    console.log("Cargado desde LocalStorage:", parsed.length);
                }
            } catch (e) {
                console.error("Error parsing localstorage", e);
            }
        }

        // 2. Fetch de fondo para actualizar (Stale-While-Revalidate)
        const fetchColaboradores = async () => {
            console.log("Actualizando colaboradores desde backend...");
            // Solo mostramos loading si NO había caché previa
            if (!cached) {
                if (isMounted) setLoading(true);
            }

            try {
                const data = await getColaboradores(currentUser);
                if (isMounted) {
                    if (data && data.length > 0) {
                        setColaboradores(data);
                        localStorage.setItem(storageKey, JSON.stringify(data));
                    } else {
                        console.warn("Backend devolvió 0 colaboradores. Manteniendo caché si existe.");
                    }
                }
            } catch (err) {
                console.error("Error fetching colaboradores (usando caché si existe):", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        // Pequeño debounce para red
        const timeoutId = setTimeout(() => {
            fetchColaboradores();
        }, 500);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [user?.usuario]);

    return { colaboradores, loading };
};
