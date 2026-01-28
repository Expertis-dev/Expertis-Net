export const getColaboradores = async (user: string | undefined) => {
    if (!user) return []; // Validación preventiva
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerListaColaboradores`, {
            method: "POST",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ usuario: user }),
        });
        if (!res.ok) throw new Error("Error al obtener Colaboradores");
        return await res.json();
    } catch (error) {
        console.error("Error en getColaboradores:", error);
        return [];
    }
};
