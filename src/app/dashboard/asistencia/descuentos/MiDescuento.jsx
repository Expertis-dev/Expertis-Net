"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  BadgePercent, 
  Calendar, 
  Search, 
  Filter, 
  FileDown, 
  ChevronRight,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const MiDescuento = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  }

  // Datos de ejemplo para el diseño "Premium"
  const stats = [
    { title: 'Total Descuentos Mes', value: 'S/ 45.00', icon: BadgePercent, color: 'text-rose-500', bg: 'bg-rose-50' },
    { title: 'Días Afectados', value: '3 Días', icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'Justificaciones Pendientes', value: '1', icon: Clock, color: 'text-sky-500', bg: 'bg-sky-50' },
  ]

  const historial = [
    { fecha: '2026-04-01', motivo: 'Tardanza injustificada', monto: 'S/ 15.00', estado: 'Confirmado', icon: AlertCircle, color: 'text-amber-500' },
    { fecha: '2026-04-03', motivo: 'Inasistencia', monto: 'S/ 30.00', estado: 'En Revisión', icon: Clock, color: 'text-blue-500' },
    { fecha: '2026-03-28', motivo: 'Tardanza injustificada', monto: 'S/ 15.00', estado: 'Justificado', icon: CheckCircle2, color: 'text-emerald-500' },
  ]

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Mis Descuentos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Visualiza y gestiona el detalle de tus descuentos aplicados.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Descargar PDF
          </Button>
          <Button className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white shadow-lg shadow-cyan-500/20">
            Justificar Reciente
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Historial de Descuentos</CardTitle>
            <CardDescription>Detalle por fecha y motivo.</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input placeholder="Buscar..." className="pl-9 w-64 bg-white dark:bg-slate-800" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Fecha</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Motivo</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Monto</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Estado</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                {historial.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm">{row.fecha}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <row.icon size={16} className={row.color} />
                        <span className="text-sm font-medium">{row.motivo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{row.monto}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`rounded-full px-3 ${
                        row.estado === 'Justificado' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        row.estado === 'En Revisión' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                        'bg-slate-50 text-slate-700 border-slate-100'
                      }`}>
                        {row.estado}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden relative">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <Info size={120} />
          </div>
          <CardHeader>
            <CardTitle>¿Sabías que?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-indigo-100">
              Puedes justificar tus tardanzas hasta 48 horas después de ocurrido el evento. Asegúrate de adjuntar el sustento correspondiente.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm hover:border-cyan-500/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">Resumen Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end gap-2 pb-2">
              {[40, 60, 30, 80, 50, 90, 20, 45, 70].map((h, i) => (
                <div key={i} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-t-sm relative group">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-teal-400 rounded-t-sm group-hover:from-cyan-600 group-hover:to-teal-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Sep</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

export default MiDescuento
