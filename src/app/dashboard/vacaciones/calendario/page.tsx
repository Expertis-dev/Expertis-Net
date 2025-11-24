"use client"
import { VacationCalendar } from "@/components/vacation-calendar"
import { useEffect, useState } from "react"
interface Fecha {
    alias: string
    cantDias: number
    codMes: string
    estado: string
    fecFinal: string
    fecInicial: string
    fecSolicitud: string
}
export default function Page() {
    const [fechas, setFechas] = useState<Fecha[]>([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerSolicitudesCalendarioJefes`)
                const data = await response.json()
                setFechas(data.data)
            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])
    return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Calendario de Vacaciones</h1>
                    <p className="text-muted-foreground">Visualiza los días ocupados por los jefes de Área</p>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <VacationCalendar fechas={fechas} />
                )}
            </div>
    )
}
