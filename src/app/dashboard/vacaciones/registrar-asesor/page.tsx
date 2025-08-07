"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Search, User } from "lucide-react"
import { format, addDays, differenceInDays, isWeekend } from "date-fns"
import { es } from "date-fns/locale"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { LoadingModal } from "@/components/loading-modal"
import { SuccessModal } from "@/components/success-modal"

const asesores = [
  "Juan Pérez",
  "María García",
  "Carlos López",
  "Ana Martínez",
  "Pedro Rodríguez",
  "Laura Sánchez",
  "Miguel Torres",
  "Carmen Ruiz",
]

export default function RegistrarVacacionesAsesor() {
  const [formData, setFormData] = useState({
    asesor: "",
    fechaInicio: undefined as Date | undefined,
    fechaFin: undefined as Date | undefined,
  })
  const [filteredAsesores, setFilteredAsesores] = useState<string[]>([])
  const [showAsesores, setShowAsesores] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleAsesorChange = (value: string) => {
    setFormData((prev) => ({ ...prev, asesor: value }))
    if (value) {
      const filtered = asesores.filter((asesor) => asesor.toLowerCase().includes(value.toLowerCase()))
      setFilteredAsesores(filtered)
      setShowAsesores(true)
    } else {
      setShowAsesores(false)
    }
  }

  const selectAsesor = (asesor: string) => {
    setFormData((prev) => ({ ...prev, asesor }))
    setShowAsesores(false)
  }

  const calculateDays = () => {
    if (!formData.fechaInicio || !formData.fechaFin) return { total: 0, laborables: 0, noLaborables: 0 }

    const total = differenceInDays(formData.fechaFin, formData.fechaInicio) + 1
    let laborables = 0
    let noLaborables = 0

    for (let d = new Date(formData.fechaInicio); d <= formData.fechaFin; d = addDays(d, 1)) {
      if (isWeekend(d)) {
        noLaborables++
      } else {
        laborables++
      }
    }

    return { total, laborables, noLaborables }
  }

  const dayStats = calculateDays()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.asesor || !formData.fechaInicio || !formData.fechaFin) return
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
        setFormData({
          asesor: "",
          fechaInicio: undefined,
          fechaFin: undefined,
        })
      }, 2000)
    }, 3000)
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
          <h1 className="text-3xl font-bold text-[#001529] dark:text-white mb-2">Registrar Vacaciones Asesor</h1>
          <p className="text-slate-600 dark:text-slate-400">Registra el período de vacaciones para un asesor</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Datos del Asesor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Asesor */}
                <div className="space-y-2 relative">
                  <Label htmlFor="asesor">Asesor</Label>
                  <div className="relative">
                    <Input
                      id="asesor"
                      placeholder="Buscar asesor..."
                      value={formData.asesor}
                      onChange={(e) => handleAsesorChange(e.target.value)}
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>

                  {showAsesores && filteredAsesores.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-40 overflow-y-auto"
                    >
                      {filteredAsesores.map((asesor) => (
                        <button
                          key={asesor}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          onClick={() => selectAsesor(asesor)}
                        >
                          {asesor}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Fecha Inicio */}
                <div className="space-y-2">
                  <Label>Fecha de Inicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.fechaInicio
                          ? format(formData.fechaInicio, "PPP", { locale: es })
                          : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.fechaInicio}
                        onSelect={(date) => setFormData((prev) => ({ ...prev, fechaInicio: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Fecha Fin */}
                <div className="space-y-2">
                  <Label>Fecha de Fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.fechaFin ? format(formData.fechaFin, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.fechaFin}
                        onSelect={(date) => setFormData((prev) => ({ ...prev, fechaFin: date }))}
                        disabled={(date) => (formData.fechaInicio ? date < formData.fechaInicio : false)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#001529] hover:bg-[#002040] dark:bg-slate-700 dark:hover:bg-slate-600"
                  disabled={!formData.asesor || !formData.fechaInicio || !formData.fechaFin}
                >
                  Registrar Vacaciones
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Registro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.asesor && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Asesor seleccionado:</div>
                  <div className="font-semibold text-[#001529] dark:text-white">{formData.asesor}</div>
                </div>
              )}

              {formData.fechaInicio && formData.fechaFin && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Período:</div>
                  <div className="font-semibold text-[#001529] dark:text-white">
                    {format(formData.fechaInicio, "PPP", { locale: es })}
                    <br />
                    hasta
                    <br />
                    {format(formData.fechaFin, "PPP", { locale: es })}
                  </div>
                </div>
              )}

              {dayStats.total > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dayStats.total}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Total</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{dayStats.laborables}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Laborables</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {dayStats.noLaborables}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">No Laborables</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmSubmit}
        title="Confirmar Registro"
        message={`¿Estás seguro de que deseas registrar ${dayStats.total} días de vacaciones para ${formData.asesor}?`}
      />

      <LoadingModal isOpen={showLoading} message="Registrando vacaciones..." />

      <SuccessModal isOpen={showSuccess} message="¡Vacaciones registradas exitosamente!" />
    </DashboardLayout>
  )
}
