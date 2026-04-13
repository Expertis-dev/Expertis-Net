"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Calendar,
  Download,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  LayoutGrid,
  List,
  Filter,
  Award,
  X,
  Check,
  MinusCircle,
  ChevronLeft,
  Save,
  MessageSquare,
  Timer,
  AlertTriangle,
  Info
} from 'lucide-react'

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

const ADVISORS = [
  { id: 'AS-001', name: 'Marco Sanchez' },
  { id: 'AS-002', name: 'Lucía Alarcón' },
  { id: 'AS-003', name: 'Carlos Pérez' },
  { id: 'AS-004', name: 'Ana Martínez' },
  { id: 'AS-005', name: 'Roberto Valdivia' }
]

// Mock de asesores que ya tuvieron acompañamiento hoy
const HAS_ACCOMPANIMENT_TODAY = ['AS-002', 'AS-004']

const MOCK_LOGS = [
  {
    id: 1,
    date: '24 de Oct, 2023',
    registros: 3,
    errors: 1,
    status: '66% Parc.',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    icon: <AlertCircle className="w-5 h-5" />,
    details: [
      { id: '1-1', name: 'Marco S.', time: '09:12', status: 'OK', color: 'text-emerald-600 bg-emerald-500/10', note: 'Completada.' },
      { id: '1-2', name: 'Lucía A.', time: '01:45', status: 'PARC.', color: 'text-amber-600 bg-amber-500/10', note: 'Corte de llamada.' },
      { id: '1-3', name: 'S/D', time: '--:--', status: 'FAIL', color: 'text-destructive bg-destructive/10', note: 'Sin registro.' }
    ]
  },
  {
    id: 2,
    date: '23 de Oct, 2023',
    registros: 4,
    errors: 0,
    status: '100% OK',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    icon: <CheckCircle2 className="w-5 h-5" />,
    details: [
      { id: '2-1', name: 'Carlos P.', time: '10:00', status: 'OK', color: 'text-emerald-600 bg-emerald-500/10', note: 'Excelente desempeño.' },
      { id: '2-2', name: 'Ana M.', time: '11:30', status: 'OK', color: 'text-emerald-600 bg-emerald-500/10', note: 'Todo en orden.' },
      { id: '2-3', name: 'Roberto V.', time: '02:15', status: 'OK', color: 'text-emerald-600 bg-emerald-500/10', note: 'Sin observaciones.' },
      { id: '2-4', name: 'Sofia K.', time: '04:00', status: 'OK', color: 'text-emerald-600 bg-emerald-500/10', note: 'Correcto.' }
    ]
  }
]

export default function AcompanamientoPage() {
  const [view, setView] = useState<'dashboard' | 'form'>('dashboard')
  const [expandedRows, setExpandedRows] = useState<number[]>([1])
  const [selectedLogDetail, setSelectedLogDetail] = useState<any>(null)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  
  // Form State
  const [timeLeft, setTimeLeft] = useState(20 * 60)
  const [startTime, setStartTime] = useState('')
  const [currentAdvisorId, setCurrentAdvisorId] = useState('')
  const [formAnswers, setFormAnswers] = useState<Record<number, string>>({})
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (view === 'form') {
      const now = new Date()
      setStartTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setTimeLeft(20 * 60)
      setFormAnswers({})
      setCurrentAdvisorId('')
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [view])

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
    if (HAS_ACCOMPANIMENT_TODAY.includes(id)) {
      setValidationError(`El asesor ${ADVISORS.find(a => a.id === id)?.name} ya tuvo un acompañamiento el día de hoy. No se permite duplicar el registro diario.`)
      return
    }
    setCurrentAdvisorId(id)
  }

  const handleFinalize = () => {
    const elapsedSeconds = (20 * 60) - timeLeft
    const minRequiredSeconds = 17 * 60

    if (!currentAdvisorId) {
      setValidationError("Debes seleccionar un asesor para poder finalizar.")
      return
    }

    if (elapsedSeconds < minRequiredSeconds) {
      const remainingSeconds = minRequiredSeconds - elapsedSeconds
      const minLeft = Math.ceil(remainingSeconds / 60)
      setValidationError(`No puedes finalizar todavía. Faltan al menos ${minLeft} minuto(s) para cumplir con el tiempo mínimo de 17 minutos de sesión requerido.`)
      return
    }

    if (Object.keys(formAnswers).length < FORM_ITEMS.length) {
      setValidationError("Por favor, completa todos los criterios de evaluación (Sí/No) antes de finalizar.")
      return
    }

    // Proceso de guardado exitoso
    alert("¡Acompañamiento registrado correctamente!")
    setView('dashboard')
  }

  const toggleRow = (id: number) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  const renderDashboard = () => (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      {/* Header Dashboard */}
      <motion.section
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm"
      >
        <div className="flex items-center gap-2">
          <div className="bg-muted p-1 rounded-lg flex items-center">
            <button className="px-3 py-1.5 bg-background shadow-xs rounded-md text-xs font-bold flex items-center gap-1.5 cursor-default">
              <Calendar className="w-3.5 h-3.5" />
              Este Mes
            </button>
            <button className="px-3 py-1.5 text-muted-foreground text-xs font-medium hover:text-foreground">
              Trimes.
            </button>
          </div>
          <button className="p-2 bg-background border border-border text-primary rounded-lg hover:bg-muted shadow-xs">
            <Download className="w-4 h-4" />
          </button>
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
            <h2 className="text-2xl font-black text-primary mt-1">94.2%</h2>
            <p className="text-[10px] text-emerald-600 flex items-center mt-1 gap-1 font-semibold">
              <TrendingUp className="w-2.5 h-2.5" />
              +2.1%
            </p>
          </div>
          <Award className="absolute -bottom-2 -right-2 w-16 h-16 text-primary/5 group-hover:text-primary/10 transition-colors" />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="md:col-span-2 bg-card p-4 rounded-2xl shadow-sm border border-border grid grid-cols-2 gap-2"
        >
          {[
            { label: 'Hecho', value: '22', color: 'bg-emerald-500' },
            { label: 'Error', value: '1', color: 'bg-destructive' }
          ].map((kpi, i) => (
            <div key={i} className={`flex flex-col justify-center items-center text-center ${i === 0 ? 'border-r border-border' : ''}`}>
              <p className="text-[9px] font-bold text-muted-foreground uppercase">{kpi.label}</p>
              <span className="text-xl font-black mt-1">{kpi.value}</span>
              <div className="w-8 h-1 bg-muted rounded-full mt-2">
                <div className={`h-full ${kpi.color} rounded-full`} style={{ width: '60%' }}></div>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="border border-border p-5 rounded-2xl shadow-md flex flex-col justify-between dark:bg-zinc-900 overflow-hidden relative"
        >
          <div className="flex justify-between items-start z-10 text-foreground">
            <p className="text-[11px] font-bold uppercase">Feedback</p>
            <span className="bg-primary/10 text-primary px-1.5 rounded text-[9px] font-black">3 PEND.</span>
          </div>
          <button 
            className="w-full py-2 bg-green-600 text-white rounded-xl text-[11px] font-extrabold mt-2 hover:bg-green-500 transition-all cursor-pointer shadow-lg active:scale-95 z-10"
            onClick={() => setView('form')}
          >
            Revisar Ahora
          </button>
        </motion.div>
      </section>

      {/* Logs Table */}
      <section className="bg-card rounded-2xl shadow-sm border border-border p-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Logs de Desempeño
          </h3>
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="bg-muted p-0.5 rounded-lg flex text-primary">
              <button className="p-1.5 bg-background shadow-xs rounded-md"><LayoutGrid className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 text-muted-foreground"><List className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 sidebar-scroll">
          {MOCK_LOGS.map((log) => (
            <div
              key={log.id}
              className={`group border border-border rounded-xl overflow-hidden transition-all ${expandedRows.includes(log.id) ? 'bg-muted/10' : ''}`}
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
                            <th className="pb-2 px-2">Hora</th>
                            <th className="pb-2 px-2">Estado</th>
                            <th className="pb-2 px-2 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="text-[12px]">
                          {log.details.map((item) => (
                            <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                              <td className="py-2 px-2 font-semibold">{item.name}</td>
                              <td className="py-2 px-2 text-muted-foreground">{item.time}</td>
                              <td className="py-2 px-2">
                                <span className={`px-1.5 py-0.5 rounded-sm font-black text-[9px] ${item.color}`}>{item.status}</span>
                              </td>
                              <td className="py-2 px-2 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLogDetail(item);
                                  }}
                                  className="px-2 py-1 bg-primary text-primary-foreground rounded-md text-[10px] font-bold hover:scale-105 transition-all"
                                >
                                  Ver detalle
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
          ))}
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
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
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[9px] font-black border border-primary/20">
                TURNO: 1
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
            onClick={handleFinalize}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-md active:scale-95"
          >
            <Save className="w-4 h-4" />
            Finalizar
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
            >
              <option value="">-- Buscar Asesor en el equipo --</option>
              {ADVISORS.map(adv => (
                <option key={adv.id} value={adv.id}>{adv.name} ({adv.id})</option>
              ))}
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
                {ADVISORS.find(a => a.id === currentAdvisorId)?.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-tighter leading-none">SELECCIONADO</p>
                <h4 className="text-sm font-bold mt-0.5">{ADVISORS.find(a => a.id === currentAdvisorId)?.name}</h4>
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
                style={{ width: `${(Object.keys(formAnswers).length / FORM_ITEMS.length) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-emerald-600">{Object.keys(formAnswers).length}/{FORM_ITEMS.length}</span>
          </div>
        </div>
        
        <div className="divide-y divide-border/50">
          {FORM_ITEMS.map((item, idx) => (
            <div key={idx} className="p-4 hover:bg-muted/10 transition-colors space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <p className="text-[13px] font-semibold text-foreground max-w-2xl leading-tight">{item}</p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name={`item-${idx}`} 
                      className="hidden peer" 
                      onChange={() => setFormAnswers(prev => ({ ...prev, [idx]: 'si' }))}
                      checked={formAnswers[idx] === 'si'}
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
                      onChange={() => setFormAnswers(prev => ({ ...prev, [idx]: 'no' }))}
                      checked={formAnswers[idx] === 'no'}
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
                  className="w-full bg-muted/20 border border-border rounded-xl pl-10 pr-4 py-2 text-[12px] min-h-[50px] focus:ring-1 ring-primary/20 transition-all outline-none placeholder:text-muted-foreground/30 font-medium"
                />
              </div>
            </div>
          ))}
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
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <h3 className="text-[11px] font-black uppercase text-primary tracking-widest mb-3">Formulario del Supervisor</h3>
                  <div className="space-y-4">
                    {FORM_ITEMS.map((item, idx) => (
                      <div key={idx} className="space-y-2 pb-3 border-b border-border/50 last:border-0">
                        <div className="flex justify-between gap-4">
                          <p className="text-[13px] font-medium leading-snug">{item}</p>
                          <div className="flex gap-1.5 shrink-0">
                            <div className={`p-1 rounded-md border flex items-center justify-center ${idx % 3 !== 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-muted border-border text-muted-foreground/50'}`}>
                              <Check className="w-3.5 h-3.5" />
                              <span className="text-[9px] font-bold ml-1">SÍ</span>
                            </div>
                            <div className={`p-1 rounded-md border flex items-center justify-center ${idx % 3 === 0 ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-muted border-border text-muted-foreground/50'}`}>
                              <X className="w-3.5 h-3.5" />
                              <span className="text-[9px] font-bold ml-1">NO</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-background/80 rounded-lg p-2 border border-border">
                          <p className="text-[11px] text-muted-foreground italic flex items-center gap-1.5">
                            <MinusCircle className="w-3 h-3" />
                            {idx % 2 === 0 ? 'Observación: El asesor reaccionó correctamente pero con dudas.' : 'Sin observaciones adicionales.'}
                          </p>
                        </div>
                      </div>
                    ))}
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
