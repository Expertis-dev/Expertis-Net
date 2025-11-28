export const getMisSolicitudes = async (
    { id }: { id?: number }
) => {
    if (!id) {
        return { data: [], error: "ID no proporcionado" };
    }
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const [res1, res2] = await Promise.all([
            fetch(`${baseUrl}/api/obtenerSolicitudes/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }),
            fetch(`${baseUrl}/api/obtenerSolicitudesEnProceso/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }),
        ]);
        if (!res1.ok || !res2.ok) {
            throw new Error(
                `Error al obtener las solicitudes (codigos: ${res1.status}, ${res2.status})`
            );
        }
        const [json1, json2] = await Promise.all([res1.json(), res2.json()]);
        // Unión en un solo array
        const data= [
            ...(json2?.data ?? []),
            ...(json1?.data ?? []),
        ];
        return { data, error: null };
    } catch (error) {
        console.error("Error en getMisSolicitudes:", error);
        return { data: [], error: "Error al obtener las solicitudes" };
    }
};



export const getSolicitudesProceso = async ({ lista }: { lista: string | undefined }) => {
    try {
        if (lista) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vacaciones/listaSolicitudesDeVacacionesDelEquipo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lista }),
            })
            const json = await res.json();
            console.log("Respuesta de getSolicitudesProceso:", json);
            if (!res.ok) throw new Error("Error al obtener las solicitudes en proceso");
            return json;
        }
    } catch (error) {
        console.error("Error en getSolicitudesProceso", error);
        return [];
    }
};

export const getSolicitudesAprobadas = async ({ lista }: { lista: string | undefined }) => {
    try {
        if (lista) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vacaciones/listaVacacionesDelEquipo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lista }),
            })
            const json = await res.json();
            console.log("Respuesta de getSolicitudesAprobadas:", json);
            if (!res.ok) throw new Error("Error al obtener las solicitudes aprobadas");
            return json;
        }
    } catch (error) {
        console.error("Error en getSolicitudesAprobadas", error);
        return [];
    }
};


export const getSolicitudesAprobadasTodas = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerSolicitudesAprobadasTodas`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        const json = await res.json();
        if (!res.ok) throw new Error("Error al obtener las solicitudes aprobadas todas");
        return json;
    } catch (error) {
        console.error("Error en getSolicitudesAprobadasTodas", error);
        return [];
    }
};
export const getDetalleSolicitud = async () => {
    try {

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerSolicitudAprobada`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        const json = await res.json();
        if (!res.ok) throw new Error("Error al obtener las solicitudes aprobadas");
        return json;
    } catch (error) {
        console.error("Error en getDetalleSolicitud", error);
        return [];
    }
};