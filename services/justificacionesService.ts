export const getJustificaciones = async ({grupo, cargo}: {grupo: number | undefined, cargo: number | undefined}) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerJustsPorSuper`, {
            method: "POST",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({grupo, cargo}),
        });
        const json = await res.json();
        if (!res.ok) throw new Error("Error al obtener justificaciones");
        return json;
    } catch (error) {
        console.error("Error en getJustificaciones:", error);
        return [];
    }
};