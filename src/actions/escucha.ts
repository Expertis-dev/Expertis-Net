'use server'

const CONFIG = {
    TURNOS_PERMITIDOS: [
        { id: 1, inicio: "09:45", fin: "10:45", nombre: 'Turno 1' },
        // { id: 1, inicio: "09:45", fin: "15:28", nombre: 'Turno 1' },
        { id: 2, inicio: "13:30", fin: "17:30", nombre: 'Turno 2' }
    ]
};

export const getTimeFormServer = async () => {
    const tiempo = new Date();
    const horaPeru = tiempo.toLocaleString('es-PE', {timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', second: '2-digit'})
    return horaPeru;
}

// Helper para convertir "HH:mm" a un objeto Date con el día de hoy
const crearFecha = (horaString: string) => {
    const [horas, minutos] = horaString.split(':').map(Number);
    const d = new Date();
    d.setHours(horas, minutos, 0, 0);
    return d;
};

export const checkTurnoPermitido = async (durationForm: number): Promise<boolean> => {
    const ahora = new Date();
    
    // Solo permitimos iniciar si aun quedan `durationForm` minutos antes del fin del turno.
    const estaEnRango = CONFIG.TURNOS_PERMITIDOS.some(turno => {
        const inicio = crearFecha(turno.inicio);
        const fin = crearFecha(turno.fin);
        const limiteInicioFormulario = new Date(fin.getTime() - durationForm * 60 * 1000);
        
        return ahora >= inicio && ahora <= limiteInicioFormulario;
    });

    return estaEnRango;
}
