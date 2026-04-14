"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  BarChart3, 
  MoreHorizontal,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useColaboradores } from '@/hooks/useColaboradores'
import { Detailmodal } from '@/components/descuentos/Detailmodal'
import { LoadingModal } from '@/components/loading-modal'

export interface Descuentos {
  fecha:  string;
  alias:  string;
  motivo: string;
  monto:  number;
  minutosTardanza?: number;
  minutosPermiso?: number;
}


const DescuentoEquipo = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  }

  const {colaboradores} = useColaboradores()
  const [data, setData] = useState<[string, Descuentos[] | undefined][]>()
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [detailIsOpen, setDetailModalIsOpen] = useState<{isOpen: boolean, info: Descuentos[]}>({
    isOpen: false,
    info: []
  })

  useEffect(() => {
    if (!colaboradores || colaboradores.length === 0) return;
    const getDescuentosPorEquipo = async () => {
      const today = new Date();
      const monthNumber = today.getMonth() + 1
      const data: Descuentos[] = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reporteDescuentosEquipo/${monthNumber}`, {
        method: "POST", 
        headers: {"Content-Type": "application/json"}, 
        body: JSON.stringify({aliasesEquipo: colaboradores.map(v => ({alias: v.usuario}))})
      }).then(r => r.json())
      
      const response = Object.groupBy(data, (v) => v.alias)
      return response
    }
    setIsLoading(true)
    getDescuentosPorEquipo().then(r => {
      setData(Object.entries(r))
    }).finally(() => setIsLoading(false));
  }, [colaboradores])

  const getPorcentajeEquipoConDescuento = useMemo<string>(() => {
    const porcentaje = data?.length === undefined ? 1 : data.length / colaboradores.length * 100
    return porcentaje.toFixed(2);
  }, [data])
  

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
            <div className="text-sm font-semibold">{colaboradores.length} Integrantes</div>
          </div>
          {/* <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 transition-all">
            Reporte Consolidado
          </Button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main List */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Colaboradores</CardTitle>
              <CardDescription>Resumen de descuentos del periodo actual.</CardDescription>
            </div>
            <Input placeholder="Filtrar por nombre..." className="max-w-[200px]" 
              name="nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </CardHeader>
          <CardContent className='overflow-y-scroll sm:h-100 md:h-200'>
            <div className="space-y-4 ">
              {colaboradores.filter(v => v.usuario.startsWith(name.toUpperCase())).map((member, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center bg-cyan-100 text-cyan-700 font-bold">
                      {member.usuario[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors">{member.usuario}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="font-bold text-rose-500 font-mono">S/ {(() => {
                        const montos = data
                          ?.filter(v => v[0] === member.usuario)
                          .map(v => v[1]?.reduce((prev, item) => prev + item.monto, 0)) || [];

                        return montos.length === 0 ? "--" : (+montos).toFixed(2);
                      })()}</p>
                      <div className="flex flex-col">
                        <div className="flex flex-row gap-2 justify-end">
                          {(() => {
                            const registros = data
                              ?.filter(v => v[0] === member.usuario)
                              .flatMap(v => v[1] || []) || [];

                            const conteo = registros.reduce(
                              (acc, curr) => {
                                if (curr.motivo.startsWith("Tardanza")) acc.tardanzas++;
                                else if (curr.motivo.startsWith("Falta")) acc.faltas++;
                                else if (curr.motivo.startsWith("Permiso")) acc.permisos++;
                                return acc;
                              },
                              { tardanzas: 0, faltas: 0, permisos: 0 }
                            );

                            return (
                              <>
                                <span className='text-sm text-stone-500'>Tardanzas: {conteo.tardanzas}</span>
                                <span className='text-sm text-stone-500'>Faltas: {conteo.faltas}</span>
                                <span className='text-sm text-stone-500'>Permisos: {conteo.permisos}</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    {
                      data?.some(v => v[0] === member.usuario) ?
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          onClick={() => {setDetailModalIsOpen({info: data?.filter(v => v[0] === member.usuario)[0][1] || [], isOpen: true})}}
                          >
                          <MoreHorizontal size={18}/>
                        </Button>
                      : <div className="h-8 w-8">
                        </div>
                    }
                  </div>
                  <Detailmodal
                    details={detailIsOpen.info}
                    isOpen={detailIsOpen.isOpen}
                    onClose={() => setDetailModalIsOpen({...detailIsOpen, isOpen: false})}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Analytics Card */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-gradient-to-br from-blue-900 to-sky-950 dark:from-slate-900 dark:to-slate-800 text-white overflow-hidden">
            <CardHeader>
              <CardTitle className="flex flex-row items-center gap-2">
                <BarChart3 className="text-cyan-400" size={20} />
                Analítica de Equipo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">Procentaje de equipo con descuento</span>
                  <span className="text-cyan-400">{getPorcentajeEquipoConDescuento}%</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${getPorcentajeEquipoConDescuento}%` }} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-3 col-span-2 rounded-lg border border-slate-700/50">
                  <p className="text-[12px] text-slate-400 uppercase font-bold">Total Descuentos</p>
                  <p className="text-2xl font-bold mt-1 tracking-tight">S/ {data?.map(v => v[1]).map(v => v?.reduce((prev, curr) => prev + curr.monto,0)).reduce((prev, curr) => prev! + curr!, 0)?.toFixed(2)}</p>
                </div>
              </div>
              
            </CardContent>
          </Card>
        </div>
      </div>
      <LoadingModal
        isOpen={isLoading}
        message='Cargando...'
      />
    </motion.div>
  )
}

export default DescuentoEquipo
