// src/hooks/useEmpleados.ts
import { useEffect, useState } from "react";
import { getColaboradores } from "../services/asesoresService";
import { ArrayEmpleado } from "../types/Empleado";
import { useUser } from "@/Provider/UserProvider";

export const useColaboradores = () => {
    const [colaboradores, setColaboradores]=useState<ArrayEmpleado>([]);
    const [loading, setLoading] = useState(true);
    const {user} = useUser()
    useEffect(() => {
        const fetchColaboradores = async () => {
            setLoading(true);
            const data = await getColaboradores(user?.usuario);
            setColaboradores(data);
            setLoading(false);
        };
        fetchColaboradores();
    }, [user]);
    return { colaboradores, loading };
};
