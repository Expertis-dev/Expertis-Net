// src/hooks/useEmpleados.ts
import { useEffect, useState } from "react";
import { ArrayJefe } from "../types/Empleado";
import { useUser } from "@/Provider/UserProvider";
import { getJefes } from "@/services/jefes";

export const useJefes = () => {
    const [jefes, setJefes] = useState<ArrayJefe>([])
    
    const [loading, setLoading] = useState(true);
    const {user} = useUser()
    useEffect(() => {
        const fetchJefes = async () => {
            setLoading(true);
            const data = await getJefes();
            console.log(data)
            setJefes(data);
            setLoading(false);
        };
        fetchJefes();
    }, [user]);
    return { jefes, loading };
};
