"use client"
import { Loading } from "@/components/Loading"
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
    const [loading, setLoading] = useState(true)
    const [fechas, setFechas] = useState<Fecha[]>([])
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerSolicitudesCalendarioJefes`)
                const data = await response.json()
                setFechas(data.data)
                setLoading(false)
            } catch (error) {
                console.error("Error fetching data:", error)
            }
        }
        fetchData()
    }, [])
    if (loading || fechas === undefined ) {
        return (
            <div className="h-[72vh] -translate-x-10">
                <Loading />
            </div>
        )
    }
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Calendario de Vacaciones</h1>
                <p className="text-muted-foreground">Visualiza los días ocupados por los jefes de Área</p>
            </div>
                <VacationCalendar fechas={fechas} />
        </div>
    )
}
