"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Fecha {
    alias: string
    cantDias: number
    codMes: string
    estado: string
    fecFinal: string
    fecInicial: string
    fecSolicitud: string
}

interface VacationCalendarProps {
    readonly fechas: readonly Fecha[]
}

const MONTHS = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
]

const DAYS_OF_WEEK = ["lun.", "mar.", "mié.", "jue.", "vie.", "sáb.", "dom."]

const ALIAS_COLORS = [
    "bg-blue-500 text-white",
    "bg-purple-500 text-white",
    "bg-green-500 text-white",
    "bg-orange-500 text-white",
    "bg-pink-500 text-white",
    "bg-teal-500 text-white",
    "bg-indigo-500 text-white",
    "bg-red-500 text-white",
    "bg-cyan-500 text-white",
    "bg-amber-500 text-white",
    "bg-emerald-500 text-white",
    "bg-violet-500 text-white",
    "bg-rose-500 text-white",
    "bg-sky-500 text-white",
    "bg-lime-500 text-white",
    "bg-fuchsia-500 text-white",
]

const hashString = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convertir a 32bit integer
    }
    return Math.abs(hash)
}

const getAliasColor = (alias: string): string => {
    const hash = hashString(alias)
    const colorIndex = hash % ALIAS_COLORS.length
    return ALIAS_COLORS[colorIndex]
}

// Función para sumar días a una fecha
const addDays = (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

// Función para parsear fechas y ajustar por zona horaria
const parseAndAdjustDate = (dateString: string): Date => {
    if (!dateString) return new Date()
    
    // Parsear la fecha
    let date: Date;
    if (dateString.includes('T')) {
        // Si es una fecha ISO, extraemos la parte de la fecha
        const datePart = dateString.split('T')[0]
        const [year, month, day] = datePart.split('-').map(Number)
        date = new Date(year, month - 1, day)
    } else {
        // Para fechas simples YYYY-MM-DD
        const [year, month, day] = dateString.split('-').map(Number)
        date = new Date(year, month - 1, day)
    }
    
    // Ajustar por zona horaria sumando 1 día
    return addDays(date, 0)
}

export function VacationCalendar({ fechas }: VacationCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    // Obtener el primer día del mes y cuántos días tiene
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()
    const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7 // Ajustar para que lunes sea 0

    // Crear array de días del mes
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    // Procesar las fechas para el mes actual
    const vacationsInMonth = useMemo(() => {
        return fechas
            .filter((fecha) => {
                const startDate = parseAndAdjustDate(fecha.fecInicial)
                const endDate = parseAndAdjustDate(fecha.fecFinal)
                const monthStart = new Date(currentYear, currentMonth, 1)
                const monthEnd = new Date(currentYear, currentMonth + 1, 0)

                return startDate <= monthEnd && endDate >= monthStart
            })
            .map((fecha) => {
                const startDate = parseAndAdjustDate(fecha.fecInicial)
                const endDate = parseAndAdjustDate(fecha.fecFinal)

                return {
                    ...fecha,
                    startDay: startDate.getDate(),
                    endDay: endDate.getDate(),
                    startDate,
                    endDate,
                }
            })
    }, [fechas, currentMonth, currentYear])

    const navigateMonth = (direction: "prev" | "next") => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev)
            if (direction === "prev") {
                newDate.setMonth(prev.getMonth() - 1)
            } else {
                newDate.setMonth(prev.getMonth() + 1)
            }
            return newDate
        })
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    const getDayVacations = (day: number) => {
        const currentDayDate = new Date(currentYear, currentMonth, day)
        return vacationsInMonth.filter((vacation) => {
            return currentDayDate >= vacation.startDate && currentDayDate <= vacation.endDate
        })
    }

    return (
        <div className="w-full max-w-4xl mx-auto bg-card rounded-lg border shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToToday}>
                        Hoy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <h2 className="text-lg font-semibold">
                    {MONTHS[currentMonth].toLocaleUpperCase()} {currentYear}
                </h2>
            </div>
            
            {/* Calendar Grid */}
            <div className="p-4">
                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className="p-2 text-sm font-medium text-muted-foreground text-center">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: startingDayOfWeek }, (_, i) => (
                        <div key={`empty-${i}`} className="h-24 border border-border/50" />
                    ))}

                    {/* Days of the month */}
                    {daysArray.map((day) => {
                        const dayVacations = getDayVacations(day)
                        const currentDayDate = new Date(currentYear, currentMonth, day)
                        const today = new Date()
                        const isToday = 
                            currentDayDate.getDate() === today.getDate() &&
                            currentDayDate.getMonth() === today.getMonth() &&
                            currentDayDate.getFullYear() === today.getFullYear()
                        
                        return (
                            <div
                                key={day}
                                className={cn(
                                    "h-24 border border-border/50 p-1 relative overflow-hidden",
                                    isToday && "bg-primary/10 border-primary",
                                )}
                            >
                                <div className={cn("text-sm font-medium mb-1", isToday ? "text-primary font-bold" : "text-foreground")}>
                                    {day}
                                </div>

                                {/* Vacation bars */}
                                <div className="space-y-1">
                                    {dayVacations.slice(0, 3).map((vacation, index) => (
                                        <div
                                            key={`${vacation.alias}-${index}`}
                                            className={cn("text-xs px-1 py-0.5 rounded text-center truncate", getAliasColor(vacation.alias))}
                                            title={`${vacation.alias} - ${vacation.estado}`}
                                        >
                                            {vacation.alias.split(" ")[0]} - {vacation.estado}
                                        </div>
                                    ))}
                                    {dayVacations.length > 3 && (
                                        <div className="text-xs text-muted-foreground text-center">+{dayVacations.length - 3} más</div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}