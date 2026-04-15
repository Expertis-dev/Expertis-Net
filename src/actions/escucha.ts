'use server'

const CONFIG = {
    TURNOS_PERMITIDOS: [
        { id: 1, inicio: "9:45", fin: "10:45", nombre: 'Turno 1' },
        { id: 2, inicio: "13:30", fin: "14:30", nombre: 'Turno 2' }
    ]
};

export const getTimeFormServer = async () => {
    const tiempo = new Date();
    const horaPeru = tiempo.toLocaleString('es-PE', {timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', second: '2-digit'})
    return horaPeru;
}