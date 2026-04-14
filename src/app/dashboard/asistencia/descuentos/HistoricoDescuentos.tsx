"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  History, 
  Download, 
  Search, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const HistoricoDescuentos = () => {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  }

  const logs = [
    { id: 'DSC-001', user: 'Juan Perez', fecha: '2026-04-01 08:15', monto: 'S/ 15.00', tipo: 'Tardanza', responsable: 'Sistema', estado: 'Finalizado' },
    { id: 'DSC-002', user: 'Maria Garcia', fecha: '2026-04-03 08:10', monto: 'S/ 15.00', tipo: 'Tardanza', responsable: 'Admin', estado: 'Revertido' },
    { id: 'DSC-003', user: 'Carlos Rodriguez', fecha: '2026-03-30 08:30', monto: 'S/ 30.00', tipo: 'Falta', responsable: 'Sistema', estado: 'Finalizado' },
    { id: 'DSC-004', user: 'Ana Martinez', fecha: '2026-03-28 08:05', monto: 'S/ 15.00', tipo: 'Tardanza', responsable: 'Admin', estado: 'Finalizado' },
    { id: 'DSC-005', user: 'Roberto Sanchez', fecha: '2026-03-25 09:00', monto: 'S/ 50.00', tipo: 'Sanción', responsable: 'RRHH', estado: 'Pendiente' }
  ]

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 dark:bg-white rounded-2xl shadow-lg shadow-slate-200 dark:shadow-none">
            <History className="text-white dark:text-slate-900" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Historial de Descuentos</h1>
            <p className="text-slate-500 font-medium">Auditoría y registro histórico de transacciones.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <Button variant="ghost" size="sm" className="rounded-lg h-9 gap-2">
            <Download size={16} />
            Exportar CSV
          </Button>
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
          <Button size="sm" className="rounded-lg h-9 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm hover:bg-slate-50 border border-slate-200 dark:border-slate-600">
            Filtrar por Fecha
            <CalendarIcon size={14} className="ml-2 text-slate-400" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs defaultValue="todos" className="w-full sm:w-auto">
          <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl h-11">
            <TabsTrigger value="todos" className="rounded-lg px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">Todos</TabsTrigger>
            <TabsTrigger value="revertidos" className="rounded-lg px-6">Revertidos</TabsTrigger>
            <TabsTrigger value="manuales" className="rounded-lg px-6">Manuales</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Buscar por ID, Usuario o Tipo..." 
            className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
          />
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">ID Registro</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Colaborador</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Fecha y Hora</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipo / Motivo</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Monto</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Responsable</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Estado</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                {logs.map((log, i) => (
                  <tr key={i} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/5 transition-colors group">
                    <td className="px-6 py-4">
                      <code className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                        {log.id}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{log.user}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{log.fecha}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium">{log.tipo}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-rose-600 dark:text-rose-400 font-mono text-sm">{log.monto}</td>
                    <td className="px-6 py-4 text-xs font-semibold uppercase text-slate-400">{log.responsable}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`rounded-full shadow-sm border-none px-3 py-1 text-[10px] font-bold ${
                        log.estado === 'Finalizado' ? 'bg-emerald-50 text-emerald-600' :
                        log.estado === 'Revertido' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {log.estado}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500">
            <p>Mostrando 5 de 1,240 registros de auditoría</p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800"><ChevronLeft size={16} /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800"><ChevronRight size={16} /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default HistoricoDescuentos
