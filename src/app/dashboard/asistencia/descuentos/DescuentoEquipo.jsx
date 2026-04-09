"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  BarChart3, 
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Mail,
  UserX
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const DescuentoEquipo = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  }

  const teamMembers = [
    { name: 'Juan Perez', cargo: 'Asesor de Cobranzas', descuentos: 'S/ 30.00', status: 'High', trend: 'up' },
    { name: 'Maria Garcia', cargo: 'Lider de Equipo', descuentos: 'S/ 0.00', status: 'Optimal', trend: 'down' },
    { name: 'Carlos Rodriguez', cargo: 'Analista de Datos', descuentos: 'S/ 15.00', status: 'Normal', trend: 'stable' },
    { name: 'Ana Martinez', cargo: 'Soporte Tecnico', descuentos: 'S/ 45.00', status: 'Warning', trend: 'up' }
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Gestión de Descuentos - Equipo
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Supervisa los descuentos aplicados a los integrantes de tu equipo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
            <Users className="text-cyan-500 h-5 w-5" />
            <div className="text-sm font-semibold">12 Integrantes</div>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 transition-all">
            Reporte Consolidado
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main List */}
        <Card className="lg:col-span-2 border-none shadow-sm h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Colaboradores</CardTitle>
              <CardDescription>Resumen de descuentos del periodo actual.</CardDescription>
            </div>
            <Input placeholder="Filtrar por nombre..." className="max-w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center bg-cyan-100 text-cyan-700 font-bold">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.cargo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-500 font-mono">{member.descuentos}</p>
                      <div className="flex items-center justify-end text-[10px] text-slate-400 gap-1 font-medium">
                        {member.trend === 'up' && <ArrowUpRight size={12} className="text-rose-400" />}
                        {member.trend === 'down' && <ArrowDownRight size={12} className="text-emerald-400" />}
                        {member.trend === 'up' ? '+5%' : member.trend === 'down' ? '-12%' : '0%'}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                      <MoreHorizontal size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Card */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
            <CardHeader>
              <CardTitle className="flex flex-row items-center gap-2">
                <BarChart3 className="text-cyan-400" size={20} />
                Analítica de Equipo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">Puntualidad Global</span>
                  <span className="text-cyan-400">82%</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: '82%' }} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Total Descuentos</p>
                  <p className="text-xl font-bold mt-1 tracking-tight">S/ 480.50</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Alertas Críticas</p>
                  <p className="text-xl font-bold mt-1 tracking-tight text-amber-400">3</p>
                </div>
              </div>
              
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white border-none shadow-lg shadow-cyan-900/40">
                Ver Análisis Detallado
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={16} />
                Acciones Requeridas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Juan Perez</strong> ha superado el límite de 3 tardanzas injustificadas.
                </p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" className="h-7 text-[10px] py-0 border-amber-200">Enviar Correo</Button>
                  <Button size="sm" className="h-7 text-[10px] py-0 bg-amber-600 hover:bg-amber-700 border-none">Notificar RRHH</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

export default DescuentoEquipo
