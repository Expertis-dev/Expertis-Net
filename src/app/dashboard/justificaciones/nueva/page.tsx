"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Search } from "lucide-react"
import { format } from "date-fns"
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

const nivel1Options = [
  { value: "falta", label: "Falta" },
  { value: "tardanza", label: "Tardanza" },
  { value: "permiso", label: "Permiso" },
]

const nivel2Options = {
  falta: [
    { value: "justificada", label: "Falta Justificada" },
    { value: "injustificada", label: "Falta Injustificada" },
  ],
  tardanza: [
    { value: "justificada", label: "Tardanza Justificada" },
    { value: "injustificada", label: "Tardanza Injustificada" },
  ],
  permiso: [
    { value: "medico", label: "Permiso Médico" },
    { value: "personal", label: "Permiso Personal" },
    { value: "familiar", label: "Permiso Familiar" },
  ],
}

const nivel3Options = {
  justificada: [
    { value: "enfermedad", label: "Enfermedad" },
    { value: "cita_medica", label: "Cita Médica" },
    { value: "emergencia", label: "Emergencia Familiar" },
  ],
  injustificada: [
    { value: "sin_aviso", label: "Sin Aviso Previo" },
    { value: "motivo_personal", label: "Motivo Personal No Justificado" },
  ],
  medico: [
    { value: "consulta", label: "Consulta Médica" },
    { value: "examenes", label: "Exámenes Médicos" },
    { value: "tratamiento", label: "Tratamiento" },
  ],
  personal: [
    { value: "tramites", label: "Trámites Personales" },
    { value: "cita_importante", label: "Cita Importante" },
  ],
  familiar: [
    { value: "emergencia_familiar", label: "Emergencia Familiar" },
    { value: "cuidado_familiar", label: "Cuidado de Familiar" },
  ],
}

export default function NuevaJustificacion() {
  const [formData, setFormData] = useState({
    asesor: "",
    nivel1: "",
    nivel2: "",
    nivel3: "",
    fecha: undefined as Date | undefined,
    observacion: "",
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

  const handleNivel1Change = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      nivel1: value,
      nivel2: "",
      nivel3: "",
    }))
  }

  const handleNivel2Change = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      nivel2: value,
      nivel3: "",
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
          nivel1: "",
          nivel2: "",
          nivel3: "",
          fecha: undefined,
          observacion: "",
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
          <h1 className="text-3xl font-bold text-[#001529] dark:text-white mb-2">Nueva Justificación</h1>
          <p className="text-slate-600 dark:text-slate-400">Registra una nueva justificación para un asesor</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulario de Justificación</CardTitle>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Nivel 1 */}
                <div className="space-y-2">
                  <Label>Tipo (Nivel 1)</Label>
                  <Select value={formData.nivel1} onValueChange={handleNivel1Change}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {nivel1Options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nivel 2 */}
                <div className="space-y-2">
                  <Label>Subtipo (Nivel 2)</Label>
                  <Select value={formData.nivel2} onValueChange={handleNivel2Change} disabled={!formData.nivel1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar subtipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.nivel1 &&
                        nivel2Options[formData.nivel1 as keyof typeof nivel2Options]?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nivel 3 */}
                <div className="space-y-2">
                  <Label>Detalle (Nivel 3)</Label>
                  <Select
                    value={formData.nivel3}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, nivel3: value }))}
                    disabled={!formData.nivel2}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar detalle" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.nivel2 &&
                        nivel3Options[formData.nivel2 as keyof typeof nivel3Options]?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fecha ? format(formData.fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.fecha}
                      onSelect={(date) => setFormData((prev) => ({ ...prev, fecha: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Observación */}
              <div className="space-y-2">
                <Label htmlFor="observacion">Observación</Label>
                <Textarea
                  id="observacion"
                  placeholder="Ingrese los detalles de la justificación..."
                  value={formData.observacion}
                  onChange={(e) => setFormData((prev) => ({ ...prev, observacion: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#001529] hover:bg-[#002040] dark:bg-slate-700 dark:hover:bg-slate-600"
                disabled={!formData.asesor || !formData.nivel1 || !formData.fecha}
              >
                Enviar Justificación
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmSubmit}
        title="Confirmar Justificación"
        message="¿Estás seguro de que deseas enviar esta justificación?"
      />

      <LoadingModal isOpen={showLoading} message="Procesando justificación..." />

      <SuccessModal isOpen={showSuccess} message="¡Justificación enviada exitosamente!" />
    </DashboardLayout>
  )
}
