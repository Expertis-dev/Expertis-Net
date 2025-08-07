"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { LoadingModal } from "@/components/loading-modal"
import { SuccessModal } from "@/components/success-modal"
import { addDays, isWeekend, format } from "date-fns"
import { es } from "date-fns/locale"

// Días no laborables (ejemplo)
const diasNoLaborables = [
  new Date(2024, 0, 1), // Año nuevo
  new Date(2024, 4, 1), // Día del trabajo
  new Date(2024, 11, 25), // Navidad
]

export default function SolicitarVacaciones() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [detalles, setDetalles] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    if (!dateRange.from || (dateRange.from && dateRange.to)) {
      setDateRange({ from: date, to: undefined })
      setSelectedDates([date])
    } else if (dateRange.from && !dateRange.to) {
      if (date < dateRange.from) {
        setDateRange({ from: date, to: dateRange.from })
      } else {
        setDateRange({ from: dateRange.from, to: date })
      }

      // Generar array de fechas en el rango
      const dates = []
      const start = dateRange.from < date ? dateRange.from : date
      const end = dateRange.from < date ? date : dateRange.from

      for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        dates.push(new Date(d))
      }
      setSelectedDates(dates)
    }
  }

  const calculateDays = () => {
    if (selectedDates.length === 0) return { total: 0, laborables: 0, noLaborables: 0 }

    const total = selectedDates.length
    let laborables = 0
    let noLaborables = 0

    selectedDates.forEach((date) => {
      const isHoliday = diasNoLaborables.some((holiday) => holiday.getTime() === date.getTime())
      const isWeekendDay = isWeekend(date)

      if (isHoliday || isWeekendDay) {
        noLaborables++
      } else {
        laborables++
      }
    })

    return { total, laborables, noLaborables }
  }

  const dayStats = calculateDays()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDates.length === 0) return
    setShowConfirmation(true)
  }

  const confirmSubmit = () => {
    setShowConfirmation(false)
    setShowLoading(true)

    setTimeout(() => {
      setShowLoading(false)
      setShowSuccess(true)

      setTimeout(() => {
        setShowSuccess(false)
        // Reset form
        setSelectedDates([])
        setDateRange({ from: undefined, to: undefined })
        setDetalles("")
      }, 2000)
    }, 3000)
  }

  const isDateDisabled = (date: Date) => {
    // Deshabilitar fechas pasadas
    return date < new Date()
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#001529] dark:text-white mb-2">Solicitar Vacaciones</h1>
          <p className="text-slate-600 dark:text-slate-400">Selecciona las fechas para tu período de vacaciones</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Seleccionar Fechas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange(range)
                    const dates = []
                    for (let d = new Date(range.from); d <= range.to; d = addDays(d, 1)) {
                      dates.push(new Date(d))
                    }
                    setSelectedDates(dates)
                  } else if (range?.from) {
                    setDateRange({ from: range.from, to: undefined })
                    setSelectedDates([range.from])
                  }
                }}
                disabled={isDateDisabled}
                className="rounded-md border"
                locale={es}
              />
            </CardContent>
          </Card>

          {/* Formulario y Resumen */}
          <div className="space-y-6">
            {/* Resumen de días */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Resumen de Días
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#001529] dark:text-white">{dayStats.total}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{dayStats.laborables}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Laborables</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{dayStats.noLaborables}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">No Laborables</div>
                  </div>
                </div>

                {dateRange.from && dateRange.to && (
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-sm">
                      <strong>Período seleccionado:</strong>
                      <br />
                      {format(dateRange.from, "PPP", { locale: es })} - {format(dateRange.to, "PPP", { locale: es })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Formulario */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Solicitud</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="detalles">Detalles de las Vacaciones</Label>
                    <Textarea
                      id="detalles"
                      placeholder="Describe el motivo o detalles de tus vacaciones..."
                      value={detalles}
                      onChange={(e) => setDetalles(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#001529] hover:bg-[#002040] dark:bg-slate-700 dark:hover:bg-slate-600"
                    disabled={selectedDates.length === 0}
                  >
                    Enviar Solicitud
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fechas seleccionadas */}
        {selectedDates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fechas Seleccionadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedDates.map((date, index) => {
                  const isHoliday = diasNoLaborables.some((holiday) => holiday.getTime() === date.getTime())
                  const isWeekendDay = isWeekend(date)

                  return (
                    <Badge
                      key={index}
                      variant={isHoliday || isWeekendDay ? "secondary" : "default"}
                      className={
                        isHoliday || isWeekendDay
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }
                    >
                      {format(date, "dd/MM/yyyy")}
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmSubmit}
        title="Confirmar Solicitud de Vacaciones"
        message={`¿Estás seguro de que deseas solicitar ${dayStats.total} días de vacaciones (${dayStats.laborables} laborables)?`}
      />

      <LoadingModal isOpen={showLoading} message="Procesando solicitud de vacaciones..." />

      <SuccessModal isOpen={showSuccess} message="¡Solicitud de vacaciones enviada exitosamente!" />
    </DashboardLayout>
  )
}
