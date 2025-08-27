export const getURLs = async ({ id }: { id: number | undefined }) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerPruebas/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        const json = await res.json();
        if (!res.ok) throw new Error("Error al obtener justificaciones");
        return json;
    } catch (error) {
        console.error("Error en getJustificaciones:", error);
        return [];
    }
};