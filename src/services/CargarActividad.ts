export function CargarActividad({ usuario, titulo, descripcion, estado }: { usuario : string, titulo: string, descripcion: string, estado: string }) {
    const actividad = localStorage.getItem("actividadesRecientes")
    const nuevasActividades = actividad ? JSON.parse(actividad) : []
    const nuevaActividad = {
        usuario,
        titulo,
        descripcion,
        tiempo: new Date().toLocaleString(),
        estado,
    }
    nuevasActividades.unshift(nuevaActividad)
    localStorage.setItem("actividadesRecientes", JSON.stringify(nuevasActividades))
    return ({nuevasActividades}
    )
}