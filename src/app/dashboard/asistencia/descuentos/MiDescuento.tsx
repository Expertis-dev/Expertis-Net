"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BadgePercent, 
  Search, 
  FileDown, 
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertCircleIcon,
  TimerOff,
  TimerIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUser } from '@/Provider/UserProvider'
import { LoadingModal } from '@/components/loading-modal'

export interface HistorialDescuentos {
  fecha:  string;
  motivo: string;
  monto:  number;
  estado: string;
  minutos: number;
}

const MiDescuento = () => {
  const {user} = useUser()
  const [data, setData] = useState<HistorialDescuentos[]>([])
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const getDataMisDescuentos = async (): Promise<HistorialDescuentos[]> => {
      const today = new Date();
      const monthNumber = today.getMonth() + 1
      const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reporteDescuentos/${monthNumber}/${user?.usuario || ""}`).then(r => r.json())
      console.log(data)
      return data;
    }

    setIsLoading(true)
    getDataMisDescuentos().then((res) => {
      setData(res)
      setIsLoading(false)
    }).finally(() => setIsLoading(false))
  }, [user?.usuario])

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


  const historial = {
    'Confirmado': {icon: AlertCircle, color: 'text-amber-500' },
    'EnRevision': {icon: Clock, color: 'text-blue-500' },
    'Justificado': {icon: CheckCircle2, color: 'text-emerald-500' },
  }

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
        {/* <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Descargar PDF
          </Button>
          <Button className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white shadow-lg shadow-cyan-500/20">
            Justificar Reciente
          </Button>
        </div> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total descuento</p>
                    <h3 className="text-2xl font-bold mt-1">S/ {data.reduce((acc, curr) => acc += curr.monto, 0).toFixed(2)}</h3>
                  </div>
                  <div className={`p-3 rounded-2xl bg-rose-50 text-rose-500 group-hover:scale-110 transition-transform dark:bg-zinc-900`}>
                    <BadgePercent size={24}/>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants} className=''>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Tardanzas Injustificadas Mes</p>
                    <h3 className="text-2xl font-bold mt-1">{data.reduce((acc, curr) => curr.motivo === "Tardanza injustificada" ? acc + 1 : acc, 0)} Días</h3>
                  </div>
                  <div className={`p-3 rounded-2xl bg-amber-50 text-amber-500 group-hover:scale-110 transition-transform dark:bg-zinc-900`}>
                    <TimerIcon size={24}/>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants} className=''>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Faltas Injustificadas Mes</p>
                    <h3 className="text-2xl font-bold mt-1">{data.reduce((acc, curr) => curr.motivo === "Falta injustificada" ? acc + 1 : acc, 0)} Días</h3>
                  </div>
                  <div className={`p-3 rounded-2xl bg-red-50 text-red-500 group-hover:scale-110 transition-transform dark:bg-zinc-900`}>
                    <TimerOff size={24}/>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/5 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Historial de Descuentos</CardTitle>
            <CardDescription>Detalle por fecha y motivo.</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input placeholder="Buscar..." className="pl-9 w-64 bg-white dark:bg-slate-700/30" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Fecha</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Motivo</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Minutos</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm">{row.fecha}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-self-center">
                        {row.motivo === "Tardanza Justificada" ? <historial.Justificado.icon className={historial.Confirmado.color}/> : <></>}
                        {row.motivo === "Tardanza injustificada" ? <historial.EnRevision.icon className={historial.Confirmado.color}/> : <></>}
                        {row.motivo === "Falta injustificada" ? <AlertCircleIcon className="text-red-500"/> : <></>}
                        <span className="text-sm font-medium">{row.motivo}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{row.minutos + "'"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-rose-600 dark:text-rose-400">S/. {row.monto.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div> */}
      <LoadingModal
        isOpen={isLoading}
        message='Cargando'
      />
    </motion.div>
  )
}

export default MiDescuento
