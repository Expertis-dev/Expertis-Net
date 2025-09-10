export const getMisSolicitudes = async ({ id }: { id: number | undefined }) => {
    try {
        if (id) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerSolicitudes/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })
            const json = await res.json();
            if (!res.ok) throw new Error("Error al obtener las solicitudes");
            return json;
        }
    } catch (error) {
        console.error("Error en getMisSolicitudes:", error);
        return [];
    }
};


export const getSolicitudesProceso = async ({ id }: { id: number | undefined }) => {
    try {
        if (id) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerSolicitudesEnProcesoEquipo/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })
            const json = await res.json();
            if (!res.ok) throw new Error("Error al obtener las solicitudes en proceso");
            return json;
        }
    } catch (error) {
        console.error("Error en getSolicitudesProceso", error);
        return [];
    }
};

export const getSolicitudesAprobadas = async ({ id }: { id: number | undefined }) => {
    try {
        if (id) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerSolicitudesAprobadasEquipo/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })
            const json = await res.json();
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
            console.log("SOLICITUDES TOTALTES", json)
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
            console.log("detalle solicitudes", json)
            return json;
    } catch (error) {
        console.error("Error en getDetalleSolicitud", error);
        return [];
    }
};