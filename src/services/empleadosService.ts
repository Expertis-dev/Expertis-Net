export interface TiemposDia {
    horaIngreso: string;
    horaSalida: string;
}

export interface PersonalGlobal {
    Nombre: string;
    id: number;
    Area: string;
    tiempos: Record<string, TiemposDia | null>;
}

export const getTodosLosEmpleados = async (): Promise<PersonalGlobal[]> => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerAsistenciaGlobalStaff`, {
            method: "GET",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Error al obtener todos los empleados");
        const result = await res.json();
        return result.data || [];
    } catch (error) {
        console.error("Error en getTodosLosEmpleados:", error);
        return [];
    }
};
