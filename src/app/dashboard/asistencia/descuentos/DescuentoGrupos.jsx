"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { 
  Users, 
  Search, 
  FileSpreadsheet, 
  TrendingDown,
  Building2,
  DollarSign,
  Loader2,
  AlertCircle,
  ArrowUpDown,
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
  const [agenciaFilter, setAgenciaFilter] = useState('TODAS')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        // Endpoint proporcionado por el usuario
        const response = await axios.get('http://localhost:5000/api/reporteDescuentos/4')
        
        // Mapeo flexible para asegurar compatibilidad con el backend
        const mappedData = response.data.map((item) => ({
          id: item.documento,
          name: item.alias || 'Sin nombre',
          agencia: item.agencia || 'EXPERTIS',
          tardanzas: parseFloat(item.totalMinutosTardanza || 0),
          faltas: parseFloat(item.totalDiasFalta || 0),
          permisos: parseFloat(item.totalMinutosPermiso || 0),
          sueldo: 1200 // Default 1200 como pidió el usuario
        }))
        
        setData(mappedData)
      } catch (err) {
        console.error("Error al obtener descuentos:", err)
        setError("No se pudo conectar con el servidor. Verifica que el API esté corriendo.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Cálculos dinámicos
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
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, sueldo: value } : item
    ))
  }

  const filteredData = useMemo(() => {
    // 1. Filtrar
    const filtered = data.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesAgencia = agenciaFilter === 'TODAS' || item.agencia === agenciaFilter
      return matchesSearch && matchesAgencia
    })

    // 2. Calcular totales para ordenamiento
    const enriched = filtered.map(item => ({
      ...item,
      computedTotal: parseFloat(calculateDiscounts(item).total)
    }))

    // 3. Ordenar por total
    return enriched.sort((a, b) => {
      if (sortOrder === 'asc') return a.computedTotal - b.computedTotal
      return b.computedTotal - a.computedTotal
    })
  }, [data, searchTerm, agenciaFilter, sortOrder])

  const totalDescuentos = useMemo(() => {
    return filteredData.reduce((acc, row) => acc + row.computedTotal, 0).toFixed(2)
  }, [filteredData])

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Cargando reporte de descuentos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <AlertCircle className="h-16 w-16 text-rose-500 opacity-20" />
        <div className="space-y-1">
          <p className="text-lg font-bold text-slate-900 dark:text-white">{error}</p>
          <p className="text-sm text-slate-500 italic">Endpoint: http://localhost:5000/api/reporteDescuentos/4</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Reintentar conexión
        </Button>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header & Filter Area */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
            <Building2 className="text-indigo-600 dark:text-indigo-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              Descuentos por Grupo
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Datos obtenidos en tiempo real del sistema.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 justify-end">
          {/* Total Summary Card (Small Version) */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-3 px-5 rounded-xl border border-slate-800 flex items-center gap-4 shadow-lg min-w-[200px]">
            <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Descuentos</p>
              <p className="text-lg font-bold text-white tracking-tight">S/ {totalDescuentos}</p>
            </div>
            <TrendingDown className="text-rose-500 ml-auto opacity-50" size={18} />
          </div>

          <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Select value={agenciaFilter} onValueChange={setAgenciaFilter}>
              <SelectTrigger className="h-11 rounded-xl w-full sm:w-44 bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20">
                <SelectValue placeholder="Filtrar Agencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas las Agencias</SelectItem>
                <SelectItem value="EXPERTIS">EXPERTIS</SelectItem>
                <SelectItem value="EXPERTIS BPO">EXPERTIS BPO</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder="Buscar asesor..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-5 gap-2 shadow-lg shadow-emerald-500/20 transition-all font-bold">
              <FileSpreadsheet size={18} />
              <span className="hidden sm:inline">Exportar Excel</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm">
                <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100 py-6 px-6">Asesor / Empleado</TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100">Agencia</TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-center">Tardanzas (min)</TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-center">Faltas (días)</TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-center">Permisos (min)</TableHead>
                  <TableHead className="font-bold text-slate-900 dark:text-slate-100 w-32">Sueldo Base</TableHead>
                  <TableHead className="font-bold text-rose-500 text-right">Dscto. Tard</TableHead>
                  <TableHead className="font-bold text-rose-500 text-right">Dscto. Falt</TableHead>
                  <TableHead className="font-bold text-rose-500 text-right">Dscto. Perm</TableHead>
                  <TableHead 
                    className="font-bold text-indigo-600 dark:text-indigo-400 text-right pr-6 cursor-pointer hover:text-indigo-700 transition-colors select-none"
                    onClick={toggleSort}
                  >
                    <div className="flex items-center justify-end gap-2">
                      TOTAL
                      {sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row) => {
                  const dsctos = calculateDiscounts(row)
                  return (
                    <TableRow key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 border-slate-50 dark:border-slate-900 transition-colors group">
                      <TableCell className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-400 flex items-center justify-center text-[11px] text-white font-bold shadow-sm">
                            {row.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-200">{row.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-full border-none px-3 py-1 text-[10px] font-bold ${
                          row.agencia === 'EXPERTIS' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 
                          'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                        }`}>
                          {row.agencia}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium text-slate-500">{row.tardanzas}</TableCell>
                      <TableCell className="text-center font-medium text-slate-500">{row.faltas}</TableCell>
                      <TableCell className="text-center font-medium text-slate-500">{row.permisos}</TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={row.sueldo}
                          onChange={(e) => handleSueldoChange(row.id, e.target.value)}
                          className="h-9 w-24 text-sm font-bold bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 text-center focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-slate-500">S/ {dsctos.tardanzas}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-slate-500">S/ {dsctos.faltas}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-slate-500">S/ {dsctos.permisos}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-none px-3 font-bold text-sm shadow-sm h-8">
                          S/ {row.computedTotal.toFixed(2)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {filteredData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 dark:bg-slate-900/20">
                <Users size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-400 font-medium">No se encontraron empleados con los filtros actuales</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default DescuentoGrupos
