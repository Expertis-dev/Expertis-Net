import { getColaboradores } from "./asesoresService";
export const ListaColaboradores = async (user: string | undefined) => {
    try {
        const asesores = await getColaboradores(user)
        const idColaboradores = asesores
                .map((c: { idEmpleado: number }) => c.idEmpleado)
                .join(",")
        return idColaboradores;
    } catch (error) {
        console.error("Error en ListaColaboradores:", error);
        return "";
    }
}