import { User } from "@/Context/UserContext";
import { format } from "date-fns"
import { es } from "date-fns/locale"
export const ObtenerInfo = async ({dateRange, user}: {dateRange: {from: Date | undefined, to: Date | undefined}, user: User}) => {
    if (!dateRange?.from || !dateRange?.to) {
        console.error("Debes seleccionar un rango de fechas para la vacación.");
        return;
    }
    const fecha = format(dateRange.to, "yyyy-MM-dd", { locale: es })
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/vacaciones/obtenerInfoVacacionesEmpleado`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    idEmpleado: user?.idEmpleado,
                    FechaCorte: fecha,
                }),
            }
        );
        if (!response.ok) {
            throw new Error("Error al VALIDAR la solicitud de vacaciones");
        }
        const data = await response.json();
        console.log("Respuesta backend:", data.data[0]);
        return data.data[0];
    } catch (error) {
        console.error("Error al VALIDAR la solicitud:", error);
    }
}