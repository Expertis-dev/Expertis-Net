import { useEffect, useState } from "react";
import { getTodosLosEmpleados, PersonalGlobal } from "../services/empleadosService";

export const useTodosLosEmpleados = () => {
    const [empleados, setEmpleados] = useState<PersonalGlobal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchAll = async () => {
            setLoading(true);
            try {
                const data = await getTodosLosEmpleados();
                if (isMounted) {
                    setEmpleados(data);
                }
            } catch (err) {
                console.error("Error fetching all employees:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAll();

        return () => {
            isMounted = false;
        };
    }, []);

    return { empleados, loading };
};
