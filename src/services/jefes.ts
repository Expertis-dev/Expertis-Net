export const getJefes = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerListaJefes`, {
            method: "GET",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) throw new Error("Error al obtener jefes");
        return await res.json();
    } catch (error) {
        console.error("Error en getJefes:", error);
        return [];
    }
};
