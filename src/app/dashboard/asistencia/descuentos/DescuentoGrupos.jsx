"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { 
  Users, 
  Search, 
  FileSpreadsheet, 
  Building2,
  DollarSign,
  Loader2,
  AlertCircle,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DescuentoGrupos = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [agenciaFilter, setAgenciaFilter] = useState('EXPERTIS')
  const [grupoFilter, setGrupoFilter] = useState('TODOS')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortOrder, setSortOrder] = useState('desc') 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get('http://localhost:5000/api/reporteDescuentos/4')
        const mappedData = response.data.map((item) => ({
          id: item.documento,
          name: item.alias || 'Sin nombre',
          agencia: item.agencia || 'EXPERTIS',
          grupo: item.grupo || 'Sin grupo',
          tardanzas: parseFloat(item.totalMinutosTardanza || 0),
          faltas: parseFloat(item.totalDiasFalta || 0),
          permisos: parseFloat(item.totalMinutosPermiso || 0),
          sueldo: 1200
        }))
        setData(mappedData)
      } catch (err) {
        setError("Error de red.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const calculateDiscounts = (row) => {
    const sueldo = parseFloat(row.sueldo) || 0
    const pagoPorDia = sueldo / 30
    const pagoPorHora = pagoPorDia / 8
    const pagoPorMinuto = pagoPorHora / 60
    const dsctoTardanzas = row.tardanzas * pagoPorMinuto
    const dsctoFaltas = row.faltas * pagoPorDia
    const dsctoPermisos = row.permisos * pagoPorMinuto
    const total = dsctoTardanzas + dsctoFaltas + dsctoPermisos
    return {
      tardanzas: dsctoTardanzas.toFixed(2),
      faltas: dsctoFaltas.toFixed(2),
      permisos: dsctoPermisos.toFixed(2),
      total: total.toFixed(2)
    }
  }

  const handleSueldoChange = (id, value) => {
    const cleanValue = value.replace(/[^0-9.]/g, '')
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, sueldo: cleanValue } : item
    ))
  }

  const filteredData = useMemo(() => {
    const filtered = data.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesAgencia = agenciaFilter === 'TODAS' || item.agencia === agenciaFilter
      const matchesGrupo = grupoFilter === 'TODOS' || item.grupo === grupoFilter
      return matchesSearch && matchesAgencia && matchesGrupo
    })
    const enriched = filtered.map(item => ({
      ...item,
      computedTotal: parseFloat(calculateDiscounts(item).total)
    }))
    return enriched.sort((a, b) => {
      if (sortOrder === 'asc') return a.computedTotal - b.computedTotal
      return b.computedTotal - a.computedTotal
    })
  }, [data, searchTerm, agenciaFilter, grupoFilter, sortOrder])

  const totalDescuentos = useMemo(() => {
    return filteredData.reduce((acc, row) => acc + row.computedTotal, 0).toFixed(2)
  }, [filteredData])

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  const uniqueGrupos = useMemo(() => {
    const grupos = data.map(item => item.grupo).filter(Boolean)
    return ['TODOS', ...new Set(grupos)].sort()
  }, [data])

  if (loading) return <div className="p-4 text-xs text-center">Cargando reporte...</div>
  if (error) return <div className="p-4 text-xs text-center text-rose-500">Error de conexión.</div>

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-3"
      style={{ zoom: '0.9' }}
    >
      {/* Balanced Compact Header */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
            <Building2 className="text-indigo-600" size={18} />
          </div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">Descuentos por Grupo</h1>
        </div>
        
        <div className="flex items-center gap-2 flex-1 justify-end">
          <div className="bg-slate-900 dark:bg-slate-800 px-3 py-1.5 rounded-md flex items-center gap-2 border border-slate-700 shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Descuentos:</span>
            <span className="text-sm font-bold text-white tracking-tight">S/ {totalDescuentos}</span>
          </div>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <Select value={agenciaFilter} onValueChange={setAgenciaFilter}>
              <SelectTrigger className="h-8 rounded-md w-32 bg-slate-50 border-slate-200 text-[10px] px-2">
                <SelectValue placeholder="Agencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS" className="text-[10px]">Agencias (Todas)</SelectItem>
                <SelectItem value="EXPERTIS" className="text-[10px]">EXPERTIS</SelectItem>
                <SelectItem value="EXPERTIS BPO" className="text-[10px]">EXPERTIS BPO</SelectItem>
              </SelectContent>
            </Select>

            <Select value={grupoFilter} onValueChange={setGrupoFilter}>
              <SelectTrigger className="h-8 rounded-md w-32 bg-slate-50 border-slate-200 text-[10px] px-2">
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent>
                {uniqueGrupos.map(grupo => (
                  <SelectItem key={grupo} value={grupo} className="text-[10px]">
                    {grupo === 'TODOS' ? 'Grupos (Todos)' : grupo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <Input 
                placeholder="Buscar asesor..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 rounded-md bg-slate-50 border-slate-200 text-[10px]"
              />
            </div>

            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md h-8 px-3 gap-1.5 text-[10px] font-bold shadow-sm">
              <FileSpreadsheet size={14} />
              <span className="hidden xl:inline">Exportar Excel</span>
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden rounded-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-slate-700 py-2 px-4 text-[10px] uppercase">Asesor / Empleado</TableHead>
                  <TableHead className="font-bold text-slate-700 text-[10px] uppercase">Agencia</TableHead>
                  <TableHead className="font-bold text-slate-700 text-[10px] uppercase">Grupo</TableHead>
                  <TableHead className="font-bold text-slate-700 text-center text-[10px] uppercase">Tar(m)</TableHead>
                  <TableHead className="font-bold text-slate-700 text-center text-[10px] uppercase">Fal(d)</TableHead>
                  <TableHead className="font-bold text-slate-700 text-center text-[10px] uppercase">Per(m)</TableHead>
                  <TableHead className="font-bold text-slate-700 w-24 text-[10px] uppercase">Sueldo Base</TableHead>
                  <TableHead className="font-bold text-rose-500 text-right text-[10px] uppercase">Dscto.Tard</TableHead>
                  <TableHead className="font-bold text-rose-500 text-right text-[10px] uppercase">Dscto.Falt</TableHead>
                  <TableHead className="font-bold text-rose-500 text-right text-[10px] uppercase">Dscto.Perm</TableHead>
                  <TableHead 
                    className="font-bold text-indigo-600 text-right pr-4 cursor-pointer hover:bg-slate-100/50 transition-colors select-none text-[10px] uppercase"
                    onClick={toggleSort}
                  >
                    <div className="flex items-center justify-end gap-1">
                      TOTAL
                      {sortOrder === 'asc' ? <SortAsc size={10} /> : <SortDesc size={10} />}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row) => {
                  const dsctos = calculateDiscounts(row)
                  return (
                    <TableRow key={row.id} className="hover:bg-slate-50/30 border-slate-50 transition-colors py-0 h-9">
                      <TableCell className="py-1 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] text-white font-bold">
                            {row.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                          </div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-[10px] whitespace-nowrap">{row.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-full border-none px-2 py-0 text-[8px] font-bold ${
                          row.agencia === 'EXPERTIS' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                        }`}>
                          {row.agencia === 'EXPERTIS' ? 'EXP' : 'BPO'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                          {row.grupo}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-slate-500 text-[10px]">{row.tardanzas}</TableCell>
                      <TableCell className="text-center text-slate-500 text-[10px]">{row.faltas}</TableCell>
                      <TableCell className="text-center text-slate-500 text-[10px]">{row.permisos}</TableCell>
                      <TableCell>
                        <Input 
                          type="text" 
                          inputMode="numeric"
                          value={row.sueldo}
                          onChange={(e) => handleSueldoChange(row.id, e.target.value)}
                          className="h-6 w-20 text-[10px] px-1 font-bold bg-white text-indigo-600 text-center rounded border-slate-200"
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono text-[9px] text-slate-400">-{dsctos.tardanzas}</TableCell>
                      <TableCell className="text-right font-mono text-[9px] text-slate-400">-{dsctos.faltas}</TableCell>
                      <TableCell className="text-right font-mono text-[9px] text-slate-400">-{dsctos.permisos}</TableCell>
                      <TableCell className="text-right pr-4">
                        <Badge className={`border-none px-2 font-bold text-[10px] h-6 min-w-[55px] justify-center ${
                          row.computedTotal <= 0 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          S/ {row.computedTotal.toFixed(2)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {filteredData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 bg-slate-50/20">
                <p className="text-[10px] text-slate-400 font-medium">No se encontraron resultados</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default DescuentoGrupos
