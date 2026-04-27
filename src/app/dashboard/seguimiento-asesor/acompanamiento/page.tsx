"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronDown,
  LayoutGrid,
  List,
  Filter,
  Award,
  X,
  Check,
  ChevronLeft,
  Save,
  MessageSquare,
  Timer,
  AlertTriangle,
  Info,
  Search,
  Eye,
  ClipboardCheck,
  NotebookPenIcon,
} from 'lucide-react'
import { useUser } from '@/Provider/UserProvider'
import { useColaboradores } from '@/hooks/useColaboradores'
import { toast } from 'sonner'
import JefeOperacionesView from './JefeOperacionesView'
import { ObservacionSombrasModal } from '@/components/seguimientos/observacion/ObservacionSombra'

export interface FetchNumeroSombrasRealizadas {
  id_acom:                   number;
  supervisor:                string;
  numeroDeSombrasRealizadas: number;
  numeroDeSombrasFaltantes:  number;
  agencia:                   string;
}


export interface FetchDetalleAcompanamiento {
  id_acom:   string;
  fecha:     string;
  registros: number;
  num_realizado: number;
  num_esperado: number;
  observacion: string;
  sombra:    Sombra[];
}

export interface Sombra {
  id_sombra:  number;
  name:       string;
  startTime:  string;
  endTime:    string;
  turno:      string;
  formulario: Formulario;
}

export interface Formulario {
  [key: string]: ResponseForm
}

export interface ResponseForm {
  check:    string;
  detalle?: string;
}

export interface LogDetail {
  id:         number;
  name:       string;
  startTime:  string;
  endTime:    string;
  turno:      string;
  status:     string;
  color:      string;
  formulario: Formulario;
  time?: string;
}

export interface MappedLogs {
  id:        string;
  date:      string;
  registros: number;
  color:     string;
  bgColor:   string;
  icon:      React.ReactNode;
  status:    string;
  observacion: string;
  details:   Detail[];
}

export interface Detail {
  id:         number;
  name:       string;
  startTime:  string;
  endTime:    string;
  turno:      string;
  status:     string;
  color:      string;
  formulario: Formulario;
}

export interface Props {
  className: string;
}

export interface FetchValidarAccesoTurno {
  permitido:         boolean;
  razon:             string;
  hora:              string;
  dia:               string;
  mensaje:           string;
  turnosDisponibles: TurnosDisponible[];
  turnoId?: number;
  turno: string,
  minutosRestantes: number;
  puedesLlenar: number,
}

export interface TurnosDisponible {
  id:     number;
  inicio: string;
  fin:    string;
  nombre: string;
}



const FORM_ITEMS = [
  "Atiende la llamada de manera inmediata",
  "Buena fluidez (sin tiempos muertos)",
  "Explica la deuda claramente",
  "Registra la gestión de manera correcta",
  "Uso del corporativo (SMS, llamadas)",
  "Proactividad con el ingreso de gestiones",
  "Distracciones frecuentes",
  "Navega de forma ágil en herramientas",
  "No realiza actividades personales (comer, distraerse, etc.)"
]

export default function AcompanamientoPage() {
  const { user } = useUser()
  const { colaboradores, loading: loadingColab } = useColaboradores()
  const [view, setView] = useState<'dashboard' | 'form'>('dashboard')
  const [selectedLogDetail, setSelectedLogDetail] = useState<LogDetail | null>(null)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [observacionSombra, setObservacionSombra] = useState<{
        isOpen: boolean;
        observacion: string;
        id_seguimiento: number;
    }>({
      id_seguimiento: -1,
      isOpen: false,
      observacion: "",
    });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let rol = localStorage.getItem('rol')
      console.log("Rol detectado en localStorage (bruto):", rol)

      // Si el rol tiene comillas adicionales (porque se guardó como JSON.stringify)
      if (rol && rol.startsWith('"') && rol.endsWith('"')) {
        rol = rol.slice(1, -1)
      }

      console.log("Rol procesado:", rol)
      setUserRole(rol)
    }
  }, [])

  // Form State
  const [timeLeft, setTimeLeft] = useState(20 * 60)
  const [startTime, setStartTime] = useState('')

  const [currentAdvisorId, setCurrentAdvisorId] = useState('')
  const [sombrasData, setSombrasData] = useState({ realizadas: 0, faltantes: 6, id_acom: '', supervisor: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid')
  const [datosValidacion, setDatosValidacion] = useState<FetchValidarAccesoTurno | null>(null)
  const [formulario, setFormulario] = useState<Record<string, { check: string; detalle: string }>>({})

  const [logs, setLogs] = useState<MappedLogs[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedRows, setExpandedRows] = useState<string[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const endTimeRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const finalizeInFlightRef = useRef(false)
  const warningShownRef = useRef(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

  const fetchSombras = async (fechaInicio?: string, fechaFin?: string) => {
    if (!user?.usuario) return
    setIsLoading(true)
    try {
      const hoy = new Date().toISOString().split('T')[0]
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/numero-de-sombras-realizadas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha: hoy, usuario: user.usuario })
      })
      if (res.ok) {
        const data: FetchNumeroSombrasRealizadas = await res.json()
        setSombrasData({
          realizadas: data.numeroDeSombrasRealizadas,
          faltantes: data.numeroDeSombrasFaltantes,
          id_acom: String(data.id_acom),
          supervisor: data.supervisor
        })

        if (data.id_acom) {
          await fetchDetalleAcompanamientos(fechaInicio, fechaFin)
        } else {
          setLogs([])
        }
      }
    } catch (error) {
      console.error("Error fetching sombras:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSombras(startDate, endDate)
  }, [user?.usuario, startDate, endDate])

  const fetchDetalleAcompanamientos = async (fechaInicio?: string, fechaFin?: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/detalle-acompanamientos`, {
        method: 'POST', // Aseguramos que sea POST para que el backend lea req.body
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grupo: user?.usuario, fechaInicio: fechaInicio || undefined, fechaFin: fechaFin || undefined})
      })

      if (res.ok) {
        const result = await res.json()
        const rawData: FetchDetalleAcompanamiento[] = result.data

        if (rawData) {
          const sessions = Array.isArray(rawData) ? rawData : [rawData]
          const mappedLogs = sessions.map((data) => ({
            id: data.id_acom,
            date: data.fecha || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
            registros: data.registros,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-500/10',
            icon: <CheckCircle2 className="w-5 h-5" />,
            status: `${data.num_realizado || 0}/${data.num_esperado || 6} Realizados`,
            observacion: data.observacion,
            details: data.registros !== 0 ? data.sombra.map((s) => ({
              id: s.id_sombra,
              name: s.name || 'Asesor sin nombre',
              startTime: s.startTime || '--:--',
              endTime: s.endTime || '--:--',
              turno: s.turno || 'N/A',
              status: 'OK',
              color: 'text-emerald-600 bg-emerald-500/10',
              formulario: s.formulario || {}
            })) : []
          }))
          setLogs(mappedLogs)

          // if (mappedLogs.length > 0) {
          //   setExpandedRows(mappedLogs.map(l => l.id))
          // }
        } else {
          setLogs([])
        }
      }
    } catch (error) {
      console.error("Error fetching details:", error)
    }
  }

  useEffect(() => {
    if (view === 'form') {
      finalizeInFlightRef.current = false
      setIsFinalizing(false)
      warningShownRef.current = false
      
      // Pre-cargar el audio para que el navegador lo permita en segundo plano
      if (!audioRef.current) {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2976/2976-preview.mp3')
        audioRef.current.load()
      }

      const now = new Date()
      const startTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      setStartTime(startTimeStr)
      
      // Establecer el tiempo final (20 minutos desde ahora)
      const duration = 20 * 60 * 1000
      const endTime = Date.now() + duration
      endTimeRef.current = endTime
      
      setTimeLeft(20 * 60)
      setFormulario({})
      setCurrentAdvisorId('')

      // Usamos el tiempo real para calcular lo que queda, así no se pausa en segundo plano
      timerRef.current = setInterval(() => {
        if (endTimeRef.current) {
          const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
          setTimeLeft(remaining)
          if (remaining === 0 && timerRef.current) {
            clearInterval(timerRef.current)
          }
        }
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      endTimeRef.current = null
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [view])

  // Efecto adicional para sincronizar inmediatamente al volver a la pestaña
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && view === 'form' && endTimeRef.current) {
        const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
        setTimeLeft(remaining)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [view])

  useEffect(() => {
    if (view === 'form') {
      if (timeLeft <= 60 && timeLeft > 0 && !warningShownRef.current) {
        warningShownRef.current = true
        
        // Intentar reproducir el audio pre-cargado
        if (audioRef.current) {
          audioRef.current.play().catch(e => {
            console.log("Audio play deferred or blocked by browser policy:", e)
          })
        }

        toast.warning("¡Aviso!", {
          description: "Queda solo 1 minuto para que termine la sesión. El formulario se guardará automáticamente al finalizar el tiempo."
        })
      }

      if (timeLeft === 0) {
        toast.info("Tiempo agotado", {
          description: "Registrando acompañamiento automáticamente..."
        })
        handleFinalize(true)
      }
    }
  }, [timeLeft, view])

  const filteredLogs = logs.filter(log => {
    // Filtro por nombre
    const matchesSearch = searchTerm === '' || (log.details || []).some((detail) =>
      detail.name && detail.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtro por fecha (comparación ISO string YYYY-MM-DD)
    let matchesDate = true;
    const itemDate = log.date;

    if (startDate && itemDate < startDate) matchesDate = false;
    if (endDate && itemDate > endDate) matchesDate = false;

    return matchesSearch && matchesDate;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const allFilteredRecords = filteredLogs.flatMap(log =>
    (log.details || [])
      .filter((d) => d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((item) => ({ ...item, date: log.date, observacion: log.observacion }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleBack = () => {
    setShowExitConfirm(true)
  }

  const confirmExit = () => {
    setShowExitConfirm(false)
    setView('dashboard')
  }

  const handleAdvisorChange = (id: string) => {
    setCurrentAdvisorId(id)
  }

  const handleFinalize = async (wasAutoSave = false) => {
    console.log("DATOS A ENVIAR:", {
      id_acom: sombrasData.id_acom,
      turno: datosValidacion?.turnoId || 1,
      supervisor: sombrasData.supervisor,
      asesor: currentAdvisorId,
      horaInicio: datosValidacion?.hora,
      formulario: formulario
    })

    const elapsedSeconds = (20 * 60) - timeLeft
    const minRequiredSeconds = 60 * 17

    if (!currentAdvisorId) {
      if (wasAutoSave) {
        setView('dashboard')
        return
      }
      setValidationError("Debes seleccionar un asesor para poder finalizar.")
      return
    }

    if (!wasAutoSave && elapsedSeconds < minRequiredSeconds) {
      setValidationError(`Debes esperar al menos 17 minutos (Llevas ${Math.floor(elapsedSeconds / 60)} min).`);
      return;
    }

    if (!wasAutoSave && Object.keys(formulario).length < FORM_ITEMS.length) {
      setValidationError("Por favor, completa todos los criterios de evaluación (Sí/No) antes de finalizar.")
      return
    }

    if (finalizeInFlightRef.current) return
    finalizeInFlightRef.current = true
    setIsFinalizing(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/registrar-sombra`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_acom: sombrasData.id_acom,
          turno: datosValidacion?.turnoId || 1,
          supervisor: sombrasData.supervisor,
          asesor: currentAdvisorId,
          horaInicio: datosValidacion?.hora,
          formulario: formulario
        })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.mensaje || "No se pudo registrar la sombra.")
        finalizeInFlightRef.current = false
        setIsFinalizing(false)
        return
      }

      toast.success("¡Acompañamiento registrado correctamente!")
      // Refrescamos los datos completos (contadores e historial)
      fetchSombras()
      setView('dashboard')
    } catch (error) {
      finalizeInFlightRef.current = false
      setIsFinalizing(false)
      console.error("Error registering shadow:", error)
      toast.error("Error de conexión al registrar la sombra.")
    }
  }

  const handleStartForm = async () => {
    try {
      // Validamos acceso con el backend antes de entrar al form
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/validar-acceso-turno`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formulariosPendientes: sombrasData.faltantes,
          agencia: user?.id_grupo
        })
      })

      const data: FetchValidarAccesoTurno = await res.json()
      setDatosValidacion(data)

      if (!res.ok) {
        toast.error(data.mensaje || "No se pudo validar el acceso al turno.", {
          description: data.razon === 'turno' ? "Fuera de horario permitido" : "Tiempo insuficiente"
        })
        return
      }

      toast.success(data.mensaje)
      // Si permite el acceso, cambiamos la vista
      setView('form')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error desconocido"
      setValidationError("Error de conexión al validar el turno: " + message)
    }
  }

  const toggleRow = (id: string) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
  }

  const renderDashboard = () => (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      {/* Header Dashboard - Search & Filters */}
      <motion.section
        className="flex flex-col md:flex-row items-center gap-3 bg-card p-3 rounded-2xl border border-border shadow-sm"
      >
        {/* Search Input */}
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Buscar asesor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-muted/50 border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50 font-medium"
          />
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-xl border border-border flex-1 md:flex-initial">
            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              />
            </div>
            <div className="w-px h-4 bg-border hidden md:block" />
            <div className="flex items-center gap-1.5 px-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-card p-4 rounded-2xl shadow-sm border border-border flex flex-col justify-between relative overflow-hidden group"
        >
          <div>
            <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider">Cumplimiento</p>
            <h2 className="text-2xl font-black text-primary mt-1">{((sombrasData.realizadas / 6) * 100).toFixed(2)}%</h2>

          </div>
          <Award className="absolute -bottom-2 -right-2 w-16 h-16 text-primary/5 group-hover:text-primary/10 transition-colors" />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="md:col-span-2 bg-card p-4 rounded-2xl shadow-sm border border-border grid grid-cols-2 gap-2"
        >
          {[
            { label: 'Hecho', value: sombrasData.realizadas.toString(), color: 'bg-emerald-500' },
            { label: 'Faltante', value: sombrasData.faltantes.toString(), color: 'bg-amber-500' }
          ].map((kpi, i) => (
            <div key={i} className={`flex flex-col justify-center items-center text-center ${i === 0 ? 'border-r border-border' : ''}`}>
              <p className="text-[9px] font-bold text-muted-foreground uppercase">{kpi.label}</p>
              <span className="text-xl font-black mt-1">{kpi.value}</span>
              <div className="w-8 h-1 bg-muted rounded-full mt-2">
                <div
                  className={`h-full ${kpi.color} rounded-full`}
                  style={{ width: `${(parseInt(kpi.value) / 6) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="border border-border p-5 rounded-2xl shadow-md flex flex-col justify-between dark:bg-zinc-900 overflow-hidden relative"
        >
          <div className="flex justify-between items-start z-10 text-foreground">
            <p className="text-[11px] font-bold uppercase">Acompañamientos  </p>
            <span className="bg-primary/10 text-primary px-1.5 rounded text-[11px] font-black">{sombrasData.faltantes} PEND.</span>
          </div>
          <button
            className="w-full py-2 bg-green-600 text-white rounded-xl text-[11px] font-extrabold mt-2 hover:bg-green-500 transition-all cursor-pointer shadow-lg active:scale-95 z-10"
            onClick={handleStartForm}
          >
            REALIZAR
          </button>
        </motion.div>
      </section>

      {/* Logs Table */}
      <section className="bg-card rounded-2xl shadow-sm border border-border p-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Historial de Acompañamientos
          </h3>
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="bg-muted p-0.5 rounded-lg flex items-center">
              <button
                onClick={() => setDisplayMode('grid')}
                className={`p-1.5 rounded-md transition-all ${displayMode === 'grid' ? 'bg-background shadow-xs text-primary' : 'text-muted-foreground'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                className={`p-1.5 rounded-md transition-all ${displayMode === 'list' ? 'bg-background shadow-xs text-primary' : 'text-muted-foreground'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 sidebar-scroll">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-muted-foreground">Cargando historial...</p>
            </div>
          ) : allFilteredRecords.length > 0 ? (
            displayMode === 'grid' ? (
              filteredLogs.map((log) => (
                <div key={log.id} className='flex flex-row gap-2'>
                  <div
                    className={`group border border-border rounded-xl overflow-hidden transition-all flex-10/12 ${expandedRows.includes(log.id) ? 'bg-muted/10' : ''}`}
                  >
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer select-none"
                      onClick={() => toggleRow(log.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${log.bgColor} ${log.color}`}>
                          {log.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-none">{log.date}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">{log.registros} Registros</p>
                        </div>
                      </div>
                      <motion.div animate={{ rotate: expandedRows.includes(log.id) ? 180 : 0 }}>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {expandedRows.includes(log.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-background/50 border-t border-border"
                        >
                          <div className="p-3">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="text-[9px] text-muted-foreground uppercase font-black tracking-widest border-b border-border">
                                  <th className="pb-2 px-2">Asesor</th>
                                  <th className="pb-2 px-2">H. Inicio</th>
                                  <th className="pb-2 px-2">H. Fin</th>
                                  <th className="pb-2 px-2">Turno</th>
                                  <th className="pb-2 px-2">% completado</th>
                                  <th className="pb-2 px-2 text-right">Acción</th>
                                </tr>
                              </thead>
                              <tbody className="text-[12px]">
                                {log.details
                                  .filter((d) => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                  .map((item: Detail) => (
                                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                      <td className="py-2 px-2 font-semibold text-primary">{item.name}</td>
                                      <td className="py-2 px-2 text-muted-foreground font-mono">{item.startTime}</td>
                                      <td className="py-2 px-2 text-muted-foreground font-mono">{item.endTime}</td>
                                      <td className="py-2 px-2">
                                        <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold">T-{item.turno}</span>
                                      </td>
                                      <td className="py-2 px-2 text-muted-foreground font-mono">{(Object.keys(item.formulario).length / FORM_ITEMS.length * 100).toFixed(2)}%</td>
                                      <td className="py-2 px-2 text-right">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedLogDetail(item);
                                          }}
                                          className="px-2 py-1 bg-primary text-primary-foreground rounded-md text-[10px] font-bold hover:scale-105 transition-all"
                                        >
                                          Detalle
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div 
                    className="content-center p-2 rounded-2xl border border-sky-400 dark:border-sky-700 flex-1/12 hover:bg-sky-400 dark:hover:bg-sky-700 hover:text-sky-100 text-sky-600 cursor-pointer max-h-16"
                    onClick={() => setObservacionSombra({id_seguimiento: +log.id, isOpen: true, observacion: log.observacion})}
                    >
                    <NotebookPenIcon className="mx-auto"/>
                  </div>
                    <ObservacionSombrasModal
                      observacionModal={observacionSombra}
                      setObservacionModal={setObservacionSombra}
                    />
                </div>
              ))
            ) : (
              <div className="border border-border rounded-xl overflow-hidden bg-background">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 text-[10px] text-muted-foreground uppercase font-black tracking-widest border-b border-border">
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Asesor</th>
                      <th className="py-3 px-4">Hora Inicio</th>
                      <th className="py-3 px-4">Hora Fin</th>
                      <th className="py-3 px-4">Turno</th>
                      <th className="py-3 px-4">% completado</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-sm">
                    {allFilteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-muted/20 transition-colors group">
                        <td className="py-3 px-4 font-medium text-muted-foreground">{record.date}</td>
                        <td className="py-3 px-4 font-bold text-primary">{record.name}</td>
                        <td className="py-3 px-4 font-mono text-xs">{record.startTime}</td>
                        <td className="py-3 px-4 font-mono text-xs">{record.endTime}</td>
                        <td className="py-3 px-4">
                          <span className="bg-muted px-2 py-1 rounded-lg text-[10px] font-black uppercase">Turno {record.turno}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{(Object.keys(record.formulario).length / FORM_ITEMS.length * 100).toFixed(2)}%</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedLogDetail(record)}
                            className="p-2 hover:bg-primary/10 text-primary rounded-full transition-all active:scale-90"
                            title="Ver detalle"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <div className="bg-muted p-4 rounded-full">
                <Search className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-bold">No se encontraron resultados</p>
                <p className="text-xs text-muted-foreground italic">Intenta ajustar tu búsqueda o filtros.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  )

  const renderForm = () => (
    <motion.div
      key="form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-5 pb-10"
    >
      {/* Form Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm sticky -top-4 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold">Registro de Acompañamiento</h2>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="px-2 py-1 bg-muted text-muted-foreground rounded-lg text-[9px] font-black border border-border flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                FECHA: {new Date().toLocaleDateString()}
              </span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[9px] font-black border border-primary/20 uppercase">
                {datosValidacion?.turno || 'TURNO: 1'}
              </span>
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[9px] font-black border border-emerald-500/20 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                INICIO: {startTime}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-muted/40 px-4 py-2 rounded-xl border border-border relative group">
            <Timer className={`w-5 h-5 ${timeLeft < (3 * 60) ? 'text-destructive animate-pulse' : 'text-primary'}`} />
            <span className={`text-xl font-mono font-black ${timeLeft < (3 * 60) ? 'text-destructive' : 'text-foreground'}`}>
              {formatTime(timeLeft)}
            </span>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
              Mínimo requerido: 17:00
            </div>
          </div>
          <button
            onClick={() => handleFinalize()}
            disabled={isFinalizing}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <Save className="w-4 h-4" />
            {isFinalizing ? "Guardando..." : "Finalizar"}
          </button>
        </div>
      </div>

      {/* Advisor Selector */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1 space-y-1.5">
          <label className="text-[11px] font-black uppercase text-muted-foreground tracking-widest pl-1">Seleccionar Asesor</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={currentAdvisorId}
              onChange={(e) => handleAdvisorChange(e.target.value)}
              className="w-full bg-muted border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 ring-primary transition-all outline-none appearance-none cursor-pointer font-semibold"
              disabled={loadingColab}
            >
              <option value="">{loadingColab ? "-- Cargando asesores... --" : "-- Buscar Asesor en el equipo --"}</option>
              {colaboradores.map(adv =>
                <option key={adv.idEmpleado} value={adv.usuario}>{adv.usuario}</option>
              )}
            </select>
          </div>
        </div>

        <AnimatePresence>
          {currentAdvisorId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-3 bg-primary/5 p-3 rounded-xl border border-primary/10 shadow-sm min-w-[200px]"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {colaboradores.find(a => a.usuario === currentAdvisorId)?.usuario.split(' ')[0][0]}
                {colaboradores.find(a => a.usuario === currentAdvisorId)?.usuario.split(' ')[1][0]}
              </div>
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-tighter leading-none">SELECCIONADO</p>
                <h4 className="text-sm font-bold mt-0.5">
                  {colaboradores.find(a => a.usuario === currentAdvisorId)?.usuario.split(' ')[0]} {colaboradores.find(a => a.usuario === currentAdvisorId)?.usuario.split(' ')[1]}
                </h4>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Checklist items */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Criterios de Evaluación
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Progreso:</span>
            <div className="w-24 h-1.5 bg-muted rounded-full">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(Object.keys(formulario).length / FORM_ITEMS.length) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-emerald-600">{Object.keys(formulario).length}/{FORM_ITEMS.length}</span>
          </div>
        </div>

        <div className="divide-y divide-border/50">
          {FORM_ITEMS.map((item, idx) => {
            const key = `p${idx + 1}`
            return (
              <div key={idx} className="p-4 hover:bg-muted/10 transition-colors space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <p className="text-[13px] font-semibold text-foreground max-w-2xl leading-tight">{item}</p>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name={`item-${idx}`}
                        className="hidden peer"
                        onChange={() => setFormulario(prev => ({
                          ...prev,
                          [key]: { ...prev[key], check: 'SI' }
                        }))}
                        checked={formulario[key]?.check === 'SI'}
                      />
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center border border-border peer-checked:bg-emerald-500 peer-checked:text-white peer-checked:border-emerald-500 shadow-sm transition-all active:scale-90">
                        <Check className="w-5 h-5 opacity-40 peer-checked:opacity-100" />
                      </div>
                      <span className="text-[11px] font-black text-muted-foreground uppercase peer-checked:text-emerald-600 tracking-tighter">Sí</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name={`item-${idx}`}
                        className="hidden peer"
                        onChange={() => setFormulario(prev => ({
                          ...prev,
                          [key]: { ...prev[key], check: 'NO' }
                        }))}
                        checked={formulario[key]?.check === 'NO'}
                      />
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center border border-border peer-checked:bg-destructive peer-checked:text-white peer-checked:border-destructive shadow-sm transition-all active:scale-90">
                        <X className="w-5 h-5 opacity-40 peer-checked:opacity-100" />
                      </div>
                      <span className="text-[11px] font-black text-muted-foreground uppercase peer-checked:text-destructive tracking-tighter">No</span>
                    </label>
                  </div>
                </div>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/40" />
                  <textarea
                    placeholder="Nota sobre este criterio..."
                    value={formulario[key]?.detalle || ''}
                    onChange={(e) => setFormulario(prev => ({
                      ...prev,
                      [key]: { ...prev[key], detalle: e.target.value }
                    }))}
                    className="w-full bg-muted/20 border border-border rounded-xl pl-10 pr-4 py-2 text-[12px] min-h-[50px] focus:ring-1 ring-primary/20 transition-all outline-none placeholder:text-muted-foreground/30 font-medium"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Confirmation Exit Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border p-6 rounded-3xl shadow-2xl max-w-sm w-full relative z-10 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold italic">¿Deseas salir?</h3>
              <p className="text-sm text-muted-foreground">Se perderán todos los datos registrados en el formulario actual.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-2.5 bg-muted font-bold rounded-xl border border-border">Continuar</button>
                <button onClick={confirmExit} className="flex-1 py-2.5 bg-destructive text-white font-bold rounded-xl shadow-lg">Sí, Salir</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Validation Error Modal */}
      <AnimatePresence>
        {validationError && (
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setValidationError(null)}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="bg-card border-2 border-primary/20 p-6 rounded-3xl shadow-2xl max-w-md w-full relative z-10 space-y-4"
            >
              <div className="flex items-center gap-3 text-primary border-b border-border pb-3">
                <Info className="w-6 h-6" />
                <h3 className="text-lg font-black uppercase tracking-tight">Validación necesaria</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed text-foreground/80">
                {validationError}
              </p>
              <button
                onClick={() => setValidationError(null)}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg active:scale-[0.98] transition-all"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  if (userRole?.trim().toUpperCase().startsWith('JEFE DE OPERACIONES')) {
    return (
      <div className="min-h-screen bg-transparent text-foreground p-2 lg:p-4 relative">
        <div className="max-w-7xl mx-auto">
          <JefeOperacionesView />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground p-2 lg:p-4 relative">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'dashboard' ? renderDashboard() : renderForm()}
        </AnimatePresence>
      </div>

      {/* Side Panel (Drawer) Detail */}
      <AnimatePresence>
        {selectedLogDetail && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLogDetail(null)}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-border flex justify-between items-center bg-muted/20">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Detalle de Acompañamiento
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Asesor: <span className="text-foreground font-semibold">{selectedLogDetail.name}</span> • {selectedLogDetail.time}</p>
                </div>
                <button
                  onClick={() => setSelectedLogDetail(null)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 sidebar-scroll">
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 shadow-sm">
                  <h3 className="text-[10px] font-black uppercase text-primary tracking-widest mb-4 flex items-center gap-2 justify-between">
                    <div className='flex flex-row gap-1'>
                      <ClipboardCheck className="w-4 h-4" />
                      <p className='self-center'>Evaluación de Criterios</p>
                    </div>
                    <span className='text-right text-lg'>{(Object.keys(selectedLogDetail.formulario).length / FORM_ITEMS.length * 100).toFixed(2)}%</span>
                  </h3>

                  <div className="space-y-3">
                    {FORM_ITEMS.map((item, idx) => {
                      const key = `p${idx + 1}`
                      const answer = selectedLogDetail.formulario?.[key]
                      return (
                        <div key={idx} className="space-y-2 pb-3 border-b border-border/50 last:border-0">
                          <div className="flex justify-between gap-4">
                            <p className="text-[12px] font-semibold leading-snug text-foreground/90">{item}</p>
                            <div className="flex gap-1 shrink-0">
                              <div className={`px-2 py-1 rounded-md border flex items-center justify-center transition-all ${answer?.check === 'SI' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 font-bold' : 'bg-muted border-border text-muted-foreground/30'}`}>
                                <Check className="w-3 h-3" />
                                <span className="text-[8px] ml-1">SÍ</span>
                              </div>
                              <div className={`px-2 py-1 rounded-md border flex items-center justify-center transition-all ${answer?.check === 'NO' ? 'bg-destructive/10 border-destructive/20 text-destructive font-bold' : 'bg-muted border-border text-muted-foreground/30'}`}>
                                <X className="w-3 h-3" />
                                <span className="text-[8px] ml-1">NO</span>
                              </div>
                            </div>
                          </div>
                          {answer?.detalle && (
                            <div className="bg-muted/40 rounded-xl p-2 border border-border/40 flex items-start gap-2">
                              <MessageSquare className="w-3 h-3 text-primary/60 mt-0.5" />
                              <p className="text-[11px] text-muted-foreground italic leading-normal">
                                {answer.detalle}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border bg-muted/10">
                <button
                  onClick={() => setSelectedLogDetail(null)}
                  className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  Cerrar Detalle
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

