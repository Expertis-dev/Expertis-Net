"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { LoadingModal } from "@/components/loading-modal"

import { useUser } from "@/Provider/UserProvider"
import { AutoComplete } from "@/components/autoComplete"
import { Asesores } from "../../../../types/Asesores"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { useAsesores } from "@/hooks/useAsesores"



// NIVEL 1
const nivel1Options = [
  { value: "FALTA", label: "Falta" },
  { value: "TARDANZA", label: "Tardanza" },
  { value: "PERMISO", label: "Permiso" },
]

// NIVEL 2 (subtipos según el nivel1)
// NIVEL 2 (subtipos según el nivel1)
const nivel2Options = {
  FALTA: [
    { value: "FALTA JUSTIFICADA", label: "Falta Justificada" },
    { value: "FALTA INJUSTIFICADA", label: "Falta Injustificada" },
  ],
  TARDANZA: [
    { value: "TARDANZA JUSTIFICADA", label: "Tardanza Justificada" },
  ],
  PERMISO: [
    { value: "PERMISO JUSTIFICADO", label: "Permiso Justificado" },
    { value: "PERMISO INJUSTIFICADO", label: "Permiso Injustificado" },
  ],
}

// NIVEL 3 (detalles según el nivel2)
const nivel3Options = {
  "FALTA JUSTIFICADA": [
    { value: "LICENCIA CON GH- CERTIFICADO DE INCAPACIDAD (DM mayor a 21 dias)", label: "LICENCIA CON GH - CERTIFICADO DE INCAPACIDAD (DM mayor a 21 días)" },
    { value: "LICENCIA CON GH- VARIAS", label: "LICENCIA CON GH - VARIAS" },
    { value: "LICENCIAS SIN GH", label: "LICENCIAS SIN GH" },
    { value: "MATERNIDAD (PRE Y POST)", label: "Maternidad (Pre y Post)" },
    { value: "DESCANSO MEDICO", label: "Descanso Médico" },
  ],
  "FALTA INJUSTIFICADA": [
    { value: "Presenta documentos de denuncias por el día que faltó.", label: "Presenta documentos de denuncias por el día que faltó." },
    { value: "Presenta documentación de atención médica (Boleta comprade medicamentos y receta medica) pero no cuenta con DM  (UNA VEZ AL MES)", label: "Documentación médica sin DM (UNA VEZ AL MES)" },
    { value: "Presenta documentación de atención medica de familiar dependiente.", label: "Atención médica de familiar dependiente" },
    { value: "Exámenes, trámites estudiantiles presentando pruebas (cronograma de exámenes, documentos con el sello de la U o Instituto)", label: "Exámenes / trámites estudiantiles con pruebas" },
    { value: "OTRO- colocar el motivo en observación", label: "Otro (colocar en observación)" },
  ],
  "TARDANZA JUSTIFICADA": [
    { value: "Inconvenientes con las herramientas de trabajo- Se debe evidenciar que el supervisor lo  a TI", label: "Inconvenientes con herramientas de trabajo (con evidencia TI)" },
    { value: "No tiene usuario o presentó problemas con su usuario", label: "No tiene usuario o problemas con su usuario" },
    { value: "Primer día laborando (En observación colocar fecha de ingreso)", label: "Primer día laborando (colocar fecha en observación)" },
    { value: "Problemas femeninos y/o problemas de salud al iniciar sus labores", label: "Problemas de salud al iniciar labores" },
    { value: "OTRO- colocar el motivo en observación", label: "Otro (colocar en observación)" },
    { value: "Problemas familiares presentando pruebas (conversaciones por WhatsApp, llamadas grabadas, confirmación de vulnerabilidad del colaborador)", label: "Problemas familiares con pruebas (WhatsApp, llamadas...)" },
    { value: "Colaborador tiene cita médica -muestra evidencias", label: "Cita médica con evidencia" },
    { value: "Exámenes, trámites estudiantiles presentando pruebas (cronograma de exámenes, documentos con el sello de la U o Instituto)", label: "Exámenes / trámites estudiantiles con pruebas" },
    { value: "Presenta documentación de atención medica de familiar dependiente.", label: "Atención médica de familiar dependiente" },
    { value: "Tiene tres a + motivos de tardanza justificada sin descuento", label: "Tres o más motivos de tardanza justificada" },
  ],
  "PERMISO JUSTIFICADO": [
    { value: "Colaborador tiene cita médica -muestra evidencias ", label: "Cita médica con evidencia" },
    { value: "Problemas femeninos y/o problemas de salud durante sus labores", label: "Problemas de salud durante labores" },
    { value: "OTRO- colocar el motivo en observación ", label: "Otro (colocar en observación)" },
    { value: "Colaborador se retira antes de tiempo porque decidió renunciar", label: "Se retira antes de tiempo por renuncia" },
    { value: "Tiene tres a + motivos de permiso", label: "Tres o más motivos de permiso" },
    { value: "Colaborador tiene una emergencia medica o familiar ", label: "Emergencia médica o familiar" },
  ],
  "PERMISO INJUSTIFICADO": [
    { value: "OTRO- colocar el motivo en observación ", label: "Otro (colocar en observación)" },
  ],
}


export default function NuevaJustificacion() {
  const { user } = useUser()
  const { asesores } = useAsesores(user?.grupo)
  const [asesor, setasesor] = useState<Asesores | null>(null)
  const [formData, setFormData] = useState({
    nivel1: "",
    nivel2: "",
    nivel3: "",
    hora: 0,
    fecha: "",
    observacion: "",
  })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

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
    const cuerpo = {
      fecha: formData.fecha,
      asesor: asesor?.usuario,
      grupo: user?.grupo,
      nivel1: formData.nivel1,
      nivel2: (formData.nivel2).toUpperCase().replace(/\s+/g, "_"),
      nivel3: formData.nivel3,
      observacion: formData.observacion,
      minutos_permiso: formData.hora,
      id_empleado: asesor?.id
    }
    console.log(cuerpo)
    setShowConfirmation(false)
    setShowLoading(true)
    setTimeout(() => {
      setShowLoading(false)
      toast.success("¡Justificación enviada exitosamente!")
      setTimeout(() => {
        // Reset form
        setFormData({
          nivel1: "",
          nivel2: "",
          nivel3: "",
          fecha: "",
          observacion: "",
          hora: 0
        })
        setasesor(null)
      }, 2000)
    }, 3000)
  }
  function parseLocalDate(str: string) {
    const [year, month, day] = str.split("-").map(Number)
    return new Date(year, month - 1, day) // <- evita problema de zona horaria
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
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="asesor">Asesor</Label>
                  <AutoComplete
                    employees={asesores}
                    onSelect={setasesor}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.fecha ? format(parseLocalDate(formData.fecha), "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.fecha ? parseLocalDate(formData.fecha) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            console.log(format(date, "yyyy-MM-dd"))
                            setFormData((prev) => ({ ...prev, fecha: format(date, "yyyy-MM-dd") }))
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {formData.nivel1 === "PERMISO" && (
                  <div className="space-y-2">
                    <Label>Minutos de Permiso</Label>
                    <Input
                      type="number"
                      value={formData.hora}
                      min={0}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hora: Number(e.target.value) }))}
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Nivel 1 */}
                <div className="space-y-2">
                  <Label>Tipo (Nivel 1)</Label>
                  <Select
                    value={formData.nivel1}
                    onValueChange={handleNivel1Change}
                  >
                    <SelectTrigger className="w-full">
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
                  <Select
                    value={formData.nivel2}
                    onValueChange={handleNivel2Change}
                    disabled={!formData.nivel1}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar subtipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.nivel1 &&
                        nivel2Options[formData.nivel1 as keyof typeof nivel2Options]?.map(
                          (option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          )
                        )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nivel 3 */}
                <div className="space-y-2">
                  <Label>Detalle (Nivel 3)</Label>
                  <Select
                    value={formData.nivel3}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, nivel3: value }))
                    }
                    disabled={!formData.nivel2}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar detalle" />
                    </SelectTrigger>
                    <SelectContent className="w-full overflow-hidden">
                      {formData.nivel2 &&
                        nivel3Options[formData.nivel2 as keyof typeof nivel3Options]?.map(
                          (option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          )
                        )}
                    </SelectContent>
                  </Select>
                </div>
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
              <div className="w-full flex justify-center">
                <Button
                  type="submit"
                  disabled={!asesor || !formData.fecha || !formData.nivel1 || !formData.nivel2 || !formData.nivel3 || !formData.observacion}
                  className={`
                              w-2/3 
                              bg-[#1d3246] 
                              hover:bg-[#0e2031] 
                              dark:bg-slate-400 
                              dark:text-neutral-900 
                              dark:hover:bg-slate-600 
                              dark:hover:text-white 
                              text-white 
                              rounded-xl
                              shadow-md
                              transition 
                              duration-300 
                              ease-in-out 
                              transform 
                              hover:scale-105 
                              active:scale-95 
                              hover:shadow-xl
                            `}>
                  Enviar Justificación
                </Button>

              </div>
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
    </DashboardLayout>
  )
}
