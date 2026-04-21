'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  Calendar,
  Download,
  Eye,
  UserCheck,
  Filter,
  Loader2,
  X,
  Clock,
  ClipboardCheck,
  MessageSquare,
  Check,
  MinusCircle
} from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

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

export default function JefeOperacionesView() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('TODOS')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedSupervisor, setSelectedSupervisor] = useState<any>(null)
  const [selectedFormDetail, setSelectedFormDetail] = useState<any>(null)

  const fetchTotalAcompanamientos = async (startDate: string, endDate: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/detalle-acompanamientos-total`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fechaInicio: startDate, fechaFin: endDate })
      })

      if (res.ok) {
        const result = await res.json()
        setData(result.data || [])
      } else {
        toast.error("Error al cargar datos maestros.")
      }
    } catch (error) {
      console.error("Error fetching total details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTotalAcompanamientos(startDate, endDate)
  }, [startDate, endDate])

  const groups = ['TODOS', ...Array.from(new Set(data.map(item => item.supervisor.split(" ")[0] || 'S/G')))]

  const filteredData = data.filter(item => {
    console.log(item)
    const matchesSearch = item.sombra.some((v: any) => (v.asesor || '').toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesGroup = selectedGroup === 'TODOS' || item.supervisor.startsWith(selectedGroup)

    // Filtro de fecha usando comparación de strings (ISO YYYY-MM-DD)
    let matchesDate = true
    const itemDate = item.fecha // Asumimos formato YYYY-MM-DD del backend

    if (startDate && itemDate < startDate) matchesDate = false
    if (endDate && itemDate > endDate) matchesDate = false

    return matchesSearch && matchesGroup && matchesDate
  })

  const SombraTable = ({ title, sombras }: { title: string, sombras: any[] }) => (
    <div className="space-y-3">
      <h3 className="text-xs font-black uppercase text-primary flex items-center gap-2 px-1">
        <Clock className="w-3.5 h-3.5" />
        {title} ({sombras.length})
      </h3>
      <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="bg-muted text-[10px] uppercase font-bold text-muted-foreground border-b border-border">
            <tr>
              <th className="py-2.5 px-4 text-center">Hora</th>
              <th className="py-2.5 px-4">Asesor</th>
              <th className="py-2.5 px-4 text-center">Duración</th>
              <th className="py-2.5 px-4 text-right">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {sombras.length > 0 ? sombras.map((s, idx) => (
              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                <td className="py-2 px-4 text-center font-bold text-primary">{s.hora_inicio || '--:--'}</td>
                <td className="py-2 px-4 font-bold uppercase">{s.asesor || 'S/N'}</td>
                <td className="py-2 px-4 text-center text-muted-foreground font-medium">{Math.floor((s.tiempo_duracion || 0) / 60)}m {s.tiempo_duracion % 60}s</td>
                <td className="py-2 px-4 text-right">
                  <button onClick={() => setSelectedFormDetail(s)} className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-all">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-5 text-center text-muted-foreground italic text-[11px]">Sin registros en este turno</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <motion.div
      key="jefe-view-vFinal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground uppercase flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-primary" />
            Cumplimiento Supervisores
          </h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest pl-8 -mt-1 opacity-70">
            Auditoría Maestra • Exportación de Datos
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-56 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar supervisor..."
              className="w-full bg-card border border-border rounded-xl pl-10 pr-3 py-2 text-xs focus:ring-1 ring-primary/20 outline-none transition-all font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full sm:w-44">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              className="w-full bg-card border border-border rounded-xl pl-10 pr-3 py-2 text-[10px] font-black outline-none appearance-none cursor-pointer uppercase"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border">
            <input
              type="date"
              className="bg-transparent text-[10px] font-black outline-none px-2 cursor-pointer"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <div className="w-px h-3 bg-border" />
            <input
              type="date"
              className="bg-transparent text-[10px] font-black outline-none px-2 cursor-pointer"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button
            className={`p-2.5 bg-card border border-border rounded-xl hover:bg-muted transition-all shadow-sm ${isLoading ? 'animate-spin' : ''}`}
            title="Sincronizar Datos"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden min-h-[400px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/60 backdrop-blur-[2px] z-10">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Analizando Big Data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-muted text-[10px] text-muted-foreground uppercase font-black tracking-widest border-b border-border">
                <tr>
                  <th className="py-3.5 px-6">Supervisor</th>
                  <th className="py-3.5 px-6">Grupo</th>
                  <th className="py-3.5 px-6 text-center">Fecha</th>
                  <th className="py-3.5 px-6 text-center">Turno 1</th>
                  <th className="py-3.5 px-6 text-center">Turno 2</th>
                  <th className="py-3.5 px-6 text-center">Total</th>
                  <th className="py-3.5 px-6 text-center">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredData.length > 0 ? filteredData.map((item) => {
                  const initials = (item.supervisor || 'S N').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                  const sombras = item.sombra || []
                  const countT1 = sombras.filter((s: any) => s.turno == 1 || s.turno === '1').length
                  const countT2 = sombras.filter((s: any) => s.turno == 2 || s.turno === '2').length
                  const realizados = item.registros || 0
                  const esperados = item.num_esperado || 6
                  const metaAlcanzada = realizados >= esperados

                  let status = metaAlcanzada ? 'CUMPLIDO' : realizados > 0 ? 'PARCIAL' : 'PENDIENTE'
                  let statusColor = metaAlcanzada ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : realizados > 0 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'

                  return (
                    <tr key={item.id_acom} className="hover:bg-muted/10 transition-colors group">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">{initials}</div>
                          <span className="font-bold text-foreground uppercase">{item.supervisor}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 font-bold text-muted-foreground uppercase">{item.supervisor.split(" ")[0] || 'S/G'}</td>
                      <td className="py-3 px-6 text-center font-medium opacity-60 uppercase">{item.fecha}</td>
                      <td className="py-3 px-6 text-center font-black text-muted-foreground/30"><span className={countT1 > 0 ? 'text-foreground' : ''}>{countT1}/3</span></td>
                      <td className="py-3 px-6 text-center font-black text-muted-foreground/30"><span className={countT2 > 0 ? 'text-foreground' : ''}>{countT2}/3</span></td>
                      <td className="py-3 px-6 text-center font-black"><span className={metaAlcanzada ? 'text-primary' : 'text-destructive/70'}>{realizados}/{esperados}</span></td>
                      <td className="py-3 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border ${statusColor}`}>{status}</span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <button onClick={() => setSelectedSupervisor(item)} className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-all active:scale-90">
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <p className="text-[10px] font-black uppercase text-muted-foreground opacity-40 tracking-[0.3em]">No se han encontrado registros</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal supervisor shifts */}
      <AnimatePresence>
        {selectedSupervisor && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedSupervisor(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="fixed inset-y-12 inset-x-6 md:inset-x-[15%] lg:inset-x-[25%] bg-card border border-border rounded-[2rem] shadow-2xl z-[70] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    {selectedSupervisor.supervisor}
                  </h2>
                  <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase mt-1">
                    {selectedSupervisor.agencia} • {selectedSupervisor.fecha} • {selectedSupervisor.num_realizado}/{selectedSupervisor.num_esperado} Realizados
                  </p>
                </div>
                <button onClick={() => setSelectedSupervisor(null)} className="p-2 hover:bg-muted bg-background border border-border rounded-xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 sidebar-scroll bg-[radial-gradient(circle_at_top_right,var(--primary-rgb)/3,transparent)]">
                <SombraTable title="Turno 1 -" sombras={(selectedSupervisor.sombra || []).filter((s: any) => s.turno == 1 || s.turno === '1')} />
                <SombraTable title="Turno 2 - " sombras={(selectedSupervisor.sombra || []).filter((s: any) => s.turno == 2 || s.turno === '2')} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Evaluation sub-drawer */}
      <AnimatePresence>
        {selectedFormDetail && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedFormDetail(null)}
              className="fixed inset-0 bg-background/20 z-[80] backdrop-blur-[1px]"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-border shadow-2xl z-[90] overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-border flex justify-between items-center bg-muted/20">
                <div>
                  <h2 className="text-sm font-black flex items-center gap-2 uppercase">
                    <ClipboardCheck className="w-5 h-5 text-primary" />
                    Hoja de Evaluación
                  </h2>
                  <p className="text-[10px] font-black text-muted-foreground uppercase mt-0.5">Asesor: <span className="text-foreground">{selectedFormDetail.asesor}</span></p>
                </div>
                <button onClick={() => setSelectedFormDetail(null)} className="p-2.5 hover:bg-muted rounded-full">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 sidebar-scroll">
                <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                  <h3 className="text-[10px] font-black uppercase text-primary tracking-widest mb-4">Criterios de Sesión</h3>
                  <div className="space-y-4">
                    {FORM_ITEMS.map((item, idx) => {
                      const key = `p${idx + 1}`
                      const answer = selectedFormDetail.formulario?.[key]
                      return (
                        <div key={idx} className="space-y-2 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                          <div className="flex justify-between gap-4">
                            <p className="text-[11px] font-bold leading-snug text-foreground/80">{item}</p>
                            <div className="flex gap-1 shrink-0">
                              {answer?.check === 'SI' ? (
                                <span className="p-1.5 bg-emerald-500 rounded-lg text-white"><Check className="w-3 h-3" /></span>
                              ) : answer?.check === 'NO' ? (
                                <span className="p-1.5 bg-red-500 rounded-lg text-white"><MinusCircle className="w-3 h-3" /></span>
                              ) : (
                                <span className="p-1.5 bg-muted rounded-lg text-muted-foreground"><MinusCircle className="w-3 h-3" /></span>
                              )}
                            </div>
                          </div>
                          {answer?.detalle && (
                            <div className="bg-muted/60 rounded-xl p-3 border border-border/40 flex items-start gap-2.5 shadow-inner">
                              <MessageSquare className="w-3 h-3 text-primary/60 mt-0.5" />
                              <p className="text-xs text-muted-foreground leading-relaxed italic">{answer.detalle}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border">
                <button onClick={() => setSelectedFormDetail(null)} className="w-full py-3 bg-primary text-primary-foreground font-black text-xs uppercase rounded-2xl hover:opacity-90 transition-all shadow-md">
                  Finalizar Revisión
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
