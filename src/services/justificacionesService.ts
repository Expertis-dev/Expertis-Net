export const getJustificaciones = async ({idUsuario , usuario}: {idUsuario: number | undefined, usuario: string | undefined}) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/justificaciones/${(usuario==="MAYRA LLIMPE" || usuario==="CAROLINA PICHILINGUE")? "obtenerJustificacionesTodas":"obtenerJustsPorUsuario"}`, {
            method: "POST",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({idUsuario}),
        });
        console.log(res)
        const json = await res.json();
        
        if (!res.ok) throw new Error("Error al obtener justificaciones");
        return json;
    } catch (error) {
        console.error("Error en getJustificaciones:", error);
        return [];
    }
};