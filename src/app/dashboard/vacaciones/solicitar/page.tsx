"use client"
export type ISODateString = string;
import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { CalendarDays, Clock } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { LoadingModal } from "@/components/loading-modal"
import { SuccessModal } from "@/components/success-modal"
import { addDays, isWeekend, format } from "date-fns"
import { es } from "date-fns/locale"
import { useUser } from "@/Provider/UserProvider"
import { toast } from "sonner" // Ajusta según tu implementación de toast
import { CargarActividad } from "@/services/CargarActividad"
import { calcularSaldosVacaciones } from "@/lib/saldosVacaciones";
import { ObtenerInfo } from "@/lib/apiVacacionesInfo";
// Días no laborables (ejemplo)
const diasNoLaborables = [
  // ===== 2024 =====
  new Date(2024, 0, 1),   // Año Nuevo
  new Date(2024, 4, 1),   // Día del Trabajo
  new Date(2024, 11, 25), // Navidad
  // ===== 2025 =====
  new Date(2025, 0, 1),   // Año Nuevo
  new Date(2025, 3, 17),  // Jueves Santo
  new Date(2025, 3, 18),  // Viernes Santo
  new Date(2025, 4, 1),   // Día del Trabajo
  new Date(2025, 5, 29),  // San Pedro y San Pablo
  new Date(2025, 6, 28),  // Fiestas Patrias
  new Date(2025, 6, 29),  // Fiestas Patrias
  new Date(2025, 7, 30),  // Santa Rosa de Lima
  new Date(2025, 9, 8),   // Combate de Angamos
  new Date(2025, 10, 1),  // Todos los Santos
  new Date(2025, 11, 8),  // Inmaculada Concepción
  new Date(2025, 11, 9),  // Inmaculada Concepción
  new Date(2025, 11, 25), // Navidad
  new Date(2026, 0, 1),   // Año Nuevo
];

interface DiasDesabilitar {
  fecFinal: string,
  fecInicial: string
}
// Función para sumar días a una fecha
const addDaysToDate = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
// Función para normalizar fechas (ignorar la hora) y ajustar por zona horaria
const normalizeAndAdjustDate = (dateString: string): Date => {
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
  return addDaysToDate(date, 0)
}
export default function SolicitarVacaciones() {
  const { user } = useUser()
  //const [ayuda, setAyuda] = useState(false)
  const [diasDesabilitar, setDiasDesabilitar] = useState<DiasDesabilitar[]>([])
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [detalles, setDetalles] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vacaciones/obtenerDiasOcupadosEquipo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idJefe: user?.idJefe }),
        });
        const data = await response.json();
        console.log("Fetched data:", data);
        setDiasDesabilitar(data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [user?.idJefe])

  // Función para verificar si hay fechas deshabilitadas dentro del rango seleccionado
  const hasDisabledDatesInRange = (from: Date, to: Date): boolean => {
    for (const disabledRange of diasDesabilitar) {
      // Ajustar las fechas deshabilitadas sumando 1 día
      const disabledStart = normalizeAndAdjustDate(disabledRange.fecInicial)
      const disabledEnd = normalizeAndAdjustDate(disabledRange.fecFinal)
      // Verificar si el rango seleccionado se superpone con algún rango deshabilitado
      if (
        (from <= disabledEnd && to >= disabledStart) ||
        (disabledStart <= to && disabledEnd >= from)
      ) {
        return true
      }
    }
    return false
  }
  // Función para verificar si las fechas seleccionadas son válidas
  const isValidDateSelection = (from: Date, to: Date): boolean => {
    // Verificar si el rango seleccionado contiene fechas deshabilitadas
    if (hasDisabledDatesInRange(from, to)) {
      return false
    }
    // Aquí puedes agregar más validaciones si es necesario
    return true
  }
  const calculateDays = () => {
    if (selectedDates.length === 0) return { total: 0, laborables: 0, noLaborables: 0 }
    const total = selectedDates.length
    let laborables = 0
    let noLaborables = 0
    selectedDates.forEach((date) => {
      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const isHoliday = diasNoLaborables.some((holiday) => {
        const normalizedHoliday = new Date(holiday.getFullYear(), holiday.getMonth(), holiday.getDate())
        return normalizedHoliday.getTime() === normalizedDate.getTime()
      })
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

  function toDate(v: string | Date) {
    return v instanceof Date ? v : new Date(v);
  }

  function mesesYDiasUTC(desdeRaw: string | Date, hastaRaw: string | Date) {
    const desde = toDate(desdeRaw);
    const hasta = toDate(hastaRaw);

    if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime())) {
      throw new Error("Fecha inválida (desde/hasta).");
    }

    // 1) meses enteros
    let meses =
      (hasta.getUTCFullYear() - desde.getUTCFullYear()) * 12 +
      (hasta.getUTCMonth() - desde.getUTCMonth());

    if (hasta.getUTCDate() < desde.getUTCDate()) meses -= 1;

    // 2) fecha ancla = desde + meses
    const ancla = new Date(
      Date.UTC(
        desde.getUTCFullYear(),
        desde.getUTCMonth() + meses,
        desde.getUTCDate()
      )
    );

    // 3) días restantes
    const ms = hasta.getTime() - ancla.getTime();
    const dias = Math.floor(ms / (1000 * 60 * 60 * 24));

    return { meses, dias, anclaISO: ancla.toISOString() };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDates.length === 0) return
    // Validar las fechas seleccionadas
    if (dateRange.from && dateRange.to && !isValidDateSelection(dateRange.from, dateRange.to)) {
      toast.error("Las fechas seleccionadas contienen días no disponibles. Por favor, elige otro rango.")
      return
    }
    const info = await ObtenerInfo({ dateRange, user });
    const { meses, dias } = mesesYDiasUTC(info.fecIngreso, info.FECHA_CORTE);
    const { saldoH, saldoNH } = calcularSaldosVacaciones({ meses, dias, info, dayStats });
    // 3) Obtienes el ajuste óptimo (tu función)
    //const opt = ajusteOptimoProporcionSaldo(saldoH, saldoNH, dayStats.laborables, dayStats.noLaborables);
    // 4) Generas opciones (usando target de opt)
    if (!dateRange.from || !dateRange.to) {
      toast.error("Debes seleccionar un rango de fechas válido.");
      return;
    }
    //const result = sugerirDiasAdicionalesParaProporcion(saldoH, saldoNH, dayStats.laborables, dayStats.noLaborables)
    if (saldoNH - dayStats.noLaborables <= 0) {
      toast.error("Tu selección deja tu saldo de días no laborables en 0. Ajusta el rango para no descontar más días no laborables.");
      toast.warning(`Saldo días laborables: ${Math.floor(saldoH)}. Saldo días no laborables: ${Math.floor(saldoNH)}`);
      return;
    }
    if (saldoH - dayStats.laborables < 0) {
      toast.error("Tu selección deja tu saldo de días laborables en 0. Ajusta el rango para no descontar más días laborables.");
      toast.warning(`Saldo días laborables: ${Math.floor(saldoH)}. Saldo días no laborables: ${Math.floor(saldoNH)}`);
      return;
    }
    if (!info) {
      toast.error("No se pudo obtener la información de días del empleado.");
      return;
    }
    setShowConfirmation(true);
  }


  const confirmSubmit = async () => {
    setShowConfirmation(false);
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Debes seleccionar un rango de fechas para la vacación.");
      return;
    }
    const diasElejidos = [
      format(dateRange.from, "yyyy-MM-dd", { locale: es }),
      format(dateRange.to, "yyyy-MM-dd", { locale: es }),
    ];
    if (!user?.idArea || !user?.idEmpleado) {
      toast.error("Falta información del usuario (área o empleado).");
      return;
    }
    setShowLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/registrarSolicitudVacaciones`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            diasElejidos,
            detalle: detalles,
            idArea: user.idArea,
            idEmpleado: user.idEmpleado,
            usrInsert: user.usuario,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Error al registrar la solicitud de vacaciones");
      }
      const data = await response.json();
      console.log("Respuesta backend:", data);
      CargarActividad({
        usuario: user.usuario || "Desconocido",
        titulo: "Registrar solicitud de vacaciones",
        descripcion: `Se registró una solicitud de vacaciones del ${diasElejidos[0]} al ${diasElejidos[1]}`,
        estado: "completed",
      });
      toast.success("Solicitud de vacaciones registrada correctamente.");
      setShowLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedDates([]);
        setDateRange({ from: undefined, to: undefined });
        setDetalles("");
      }, 2000);
    } catch (error) {
      console.error("Error al registrar la solicitud:", error);
      setShowLoading(false);
      // ⚠️ Registrar actividad de error
      CargarActividad({
        usuario: user?.usuario || "Desconocido",
        titulo: "Error al registrar solicitud de vacaciones",
        descripcion: `No se pudo registrar la solicitud de vacaciones del ${diasElejidos[0]} al ${diasElejidos[1]}.`,
        estado: "error",
      });
      toast.error("Ocurrió un error al registrar la solicitud. Intenta nuevamente.");
    }
  };
  const isDateDisabled = (date: Date) => {
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    // Deshabilitar fechas que estén dentro de los rangos deshabilitados (ajustados)
    for (const disabledRange of diasDesabilitar) {
      const disabledStart = normalizeAndAdjustDate(disabledRange.fecInicial)
      const disabledEnd = normalizeAndAdjustDate(disabledRange.fecFinal)
      if (normalizedDate >= disabledStart && normalizedDate <= disabledEnd) {
        return true
      }
    }
    return false
  }
  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return
    if (range.from && range.to) {
      // Validar el rango seleccionado
      if (!isValidDateSelection(range.from, range.to)) {
        toast.error("El rango de fechas seleccionado contiene días no disponibles. Por favor, elige otro rango.")
        return
      }
      setDateRange({ from: range.from, to: range.to })
      const dates = []
      for (let d = new Date(range.from); d <= range.to; d = addDays(d, 1)) {
        dates.push(new Date(d))
      }
      setSelectedDates(dates)
      //toast.success("Rango de fechas seleccionado correctamente")
    } else if (range.from) {
      setDateRange({ from: range.from, to: undefined })
      setSelectedDates([range.from])
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-2"
    >
      <div>
        <h1 className="text-3xl font-bold text-[#001529] dark:text-white mb-2">Solicitar Vacaciones</h1>
        <p className="text-slate-600 dark:text-slate-400">Selecciona las fechas para tu período de vacaciones</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
        {/* Calendario */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Seleccionar Fechas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={dateRange}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              className="rounded-md border"
              locale={es}
            />
          </CardContent>
        </Card>
        {/* Formulario y Resumen */}
        <div className="col-span-2 space-y-2">
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
                <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm">
                    <strong>Período seleccionado:</strong>
                    <br />
                    <p>Fecha de inicio: {format(dateRange.from, "PPP", { locale: es })}</p>
                    <p>Fecha de fin: {format(dateRange.to, "PPP", { locale: es })}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Formulario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <p>Detalle de las Vacaciones</p>
                {/*<div className="flex  items-center justify-center gap-2"> 
                  <Label>Solicitar Ayuda</Label>
                  <Checkbox
                    checked={ayuda}
                    onCheckedChange={() => setAyuda(!ayuda)}
                  />
                </div>*/}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-2">
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
                  className="w-full bg-[#001529] hover:bg-[#002040] dark:bg-slate-700 dark:hover:bg-slate-600 text-white"
                  disabled={selectedDates.length === 0}
                >
                  Validar Solicitud
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmSubmit}
        title="Confirmar Solicitud de Vacaciones"
        message={`¿Estás seguro de que deseas solicitar ${dayStats.total} días de vacaciones (${dayStats.laborables} laborables)?`}
      />
      <LoadingModal isOpen={showLoading} message="Procesando solicitud de vacaciones..." />
      <SuccessModal isOpen={showSuccess} message="¡Solicitud de vacaciones enviada exitosamente!" />
    </motion.div>
  )
}