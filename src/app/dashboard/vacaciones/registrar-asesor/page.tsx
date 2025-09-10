"use client"
import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, User } from "lucide-react"
import { format, addDays, differenceInDays, isWeekend } from "date-fns"
import { es } from "date-fns/locale"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { LoadingModal } from "@/components/loading-modal"
import { SuccessModal } from "@/components/success-modal"
import { useUser } from "@/Provider/UserProvider"
import { Asesores } from "../../../../types/Asesores"
import { AutoComplete } from "@/components/autoComplete"
import { useAsesores } from "@/hooks/useAsesores"
export default function RegistrarVacacionesAsesor() {
  const { user } = useUser()
  const { asesores } = useAsesores(user?.grupo)
  const [asesor, setAsesor] = useState<Asesores | null>(null)
  const [formData, setFormData] = useState({
    asesor: "",
    fechaInicio: undefined as Date | undefined,
    fechaFin: undefined as Date | undefined,
  })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
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
    if (!asesor || !formData.fechaInicio || !formData.fechaFin) return
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
                  <AutoComplete
                    employees={asesores}
                    onSelect={setAsesor}
                  />
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
                        
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#001529] hover:bg-[#002040] dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white"
                  disabled={!asesor || !formData.fechaInicio || !formData.fechaFin}
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
              {asesor && (
                <div className="p-2 bg-slate-100 dark:bg-neutral-800 rounded-lg">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Asesor seleccionado:</div>
                  <div className="font-semibold text-[#001529] dark:text-white">{asesor?.nombre} {asesor?.apellido1}</div>
                </div>
              )}
              {formData.fechaInicio && formData.fechaFin && (
                <div className="p-4 bg-slate-100 dark:bg-neutral-800 rounded-lg">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Período:</div>
                  <div className="font-semibold text-[#001529] dark:text-white">
                    {format(formData.fechaInicio, "PPP", { locale: es })}
                    <br />
                    hasta el
                    <br />
                    {format(formData.fechaFin, "PPP", { locale: es })}
                  </div>
                </div>
              )}
              {dayStats.total > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dayStats.total}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Dias Totales</div>
                  </div>
                  <div className="text-center p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{dayStats.laborables}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Dias Habiles</div>
                  </div>
                  <div className="text-center p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {dayStats.noLaborables}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Dias No Habiles</div>
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
        message={`¿Estás seguro de que deseas registrar ${dayStats.total} días de vacaciones para ${asesor?.nombre} ${asesor?.apellido1}?`}
      />

      <LoadingModal isOpen={showLoading} message="Registrando vacaciones..." />

      <SuccessModal isOpen={showSuccess} message="¡Vacaciones registradas exitosamente!" />
    </DashboardLayout>
  )
}
