export const getAsesores = async (grupo: string | undefined) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerAsesoresPorSuper`, {
            method: "POST",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({grupo}),
        });
        if (!res.ok) throw new Error("Error al obtener asesores");
        return await res.json();
    } catch (error) {
        console.error("Error en getAsesores:", error);
        return [];
    }
};
