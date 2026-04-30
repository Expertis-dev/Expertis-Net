"use server";

export const getTimeFormServer = async () => {
    const tiempo = new Date();
    const horaPeru = tiempo.toLocaleString("es-PE", {
        timeZone: "America/Lima",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    return horaPeru;
};

// Helper para convertir "HH:mm" a un objeto Date con el día de hoy
const crearFecha = (horaString: string) => {
    const [horas, minutos] = horaString.split(":").map(Number);
    const d = new Date();
    d.setHours(horas, minutos, 0, 0);
    return d;
};

export const checkTurnoPermitido = async (
    durationForm: number,
): Promise<boolean> => {
    const ahora = new Date();

    // Solo permitimos iniciar si aun quedan `durationForm` minutos antes del fin del turno.
    const estaEnRango = (await CONFIG()).TURNOS_PERMITIDOS.some((turno) => {
        const inicio = crearFecha(turno.inicio);
        const fin = crearFecha(turno.fin);
        const limiteInicioFormulario = new Date(
            fin.getTime() - durationForm * 60 * 1000,
        );

        return ahora >= inicio && ahora <= limiteInicioFormulario;
    });

    return estaEnRango;
};

const getTurnoActual = async (): Promise<{ id: number; inicio: string; fin: string; nombre: string } | null> => {
    const ahora = new Date();
    const turnos = (await CONFIG()).TURNOS_PERMITIDOS;

    return (
        turnos.find((turno) => {
            const inicio = crearFecha(turno.inicio);
            const fin = crearFecha(turno.fin);

            return ahora >= inicio && ahora <= fin;
        }) ?? null
    );
};

export const getTurno = async (): Promise<string> => {
    const turno = await getTurnoActual();
    return turno?.nombre ?? "";
};

export const getTurnoFin = async (): Promise<string | null> => {
    const turno = await getTurnoActual();
    return turno?.fin ?? null;
};

export const CONFIG = async () => ({
    TURNOS_PERMITIDOS: [
        { id: 1, inicio: "08:45", fin: "10:45", nombre: "09:45-10:45" },
        { id: 2, inicio: "13:30", fin: "14:30", nombre: "13:30-14:30" },
    ]
});