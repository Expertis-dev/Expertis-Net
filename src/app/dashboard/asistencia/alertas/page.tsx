"use client"
import React, { useEffect, useState, useMemo, useRef } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Clock, CalendarX2, AlertTriangle, Info, Search, ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/Loading" 
import { getPermisosFromStorage, tienePermiso } from "@/components/dashboard-layout"

export interface AsistenciaRecord {
  fecha: string;
  alias: string;
  documento: string;
  grupo: string;
  agencia: string;
  horaIngreso: string | null;
  horaSalida: string | null;
  esFalta: number;
  esDiaLaborable: number;
  esVacaciones: number;
  esAusenciaLaborable: number;
  tipoAusencia: string | null;
  tipo: string | null;
  tipoSubsidio: string | null;
  tipoGoce: string | null;
  hayJustificacion: number;
  tipoJustificacion: string | null;
  minutos_permiso: number;
  descuento: number;
  fechaInicioGestion: string | null;
  fechaFinGestion: string | null;
  horario: string | null;
  esTardanza: number;
  minutosTardanza: number;
  esUltimoSabadoDelMes: number;
}

export default function AlertasPage() {
    const [tardanzas, setTardanzas] = useState<AsistenciaRecord[]>([]);
    const [faltas, setFaltas] = useState<AsistenciaRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [filtroAgencia, setFiltroAgencia] = useState("TODAS");
    const [filtroGrupo, setFiltroGrupo] = useState("TODOS");
    const [filtroNombre, setFiltroNombre] = useState("");
    const [filtroColor, setFiltroColor] = useState("TODOS");
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    
    const autocompleteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
                setShowAutocomplete(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const [sortTardanzas, setSortTardanzas] = useState<{ field: "fecha" | "alias" | "incidencia" | "minutosTardanza", order: "asc" | "desc" }>({ field: "fecha", order: "desc" });
    const [sortFaltas, setSortFaltas] = useState<{ field: "fecha" | "alias" | "incidencia", order: "asc" | "desc" }>({ field: "fecha", order: "desc" });

    useEffect(() => {
        const permisos = getPermisosFromStorage();
        const canSee = tienePermiso(permisos, "Asistencia", "Alertas-ver");
        setHasPermission(canSee);

        if (!canSee) {
            setLoading(false);
            return;
        }

        const URL_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/api/alertaIncidencias/?codMes=3`;
        
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(URL_ENDPOINT);
                if (response.ok) {
                    const data = await response.json();
                    
                    const listTardanzas = data.data?.tardanzas || data.tardanzas || [];
                    const listFaltas = data.data?.faltas || data.faltas || [];
                    
                    setTardanzas(listTardanzas);
                    setFaltas(listFaltas);
                }
            } catch (error) {
                console.error("Error obteniendo alertas del endpoint", error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchData(); 
    }, []);

    // Función auxiliar transformar "DD-MM-YYYY" a milisegundos y ordenar
    const parseFecha = (fechaStr: string) => {
        if (!fechaStr) return 0;
        const parts = fechaStr.split("-"); // [DD, MM, YYYY]
        if (parts.length === 3) {
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`).getTime();
        }
        return new Date(fechaStr).getTime();
    };

    // --- PROCESAMIENTO TARDANZAS ---
    const tardanzasProcesadas = useMemo(() => {
        // Calcular incidencia global PRIMERO, antes de aplicar filtros
        const ordenadoTotal = [...tardanzas].sort((a, b) => parseFecha(a.fecha) - parseFecha(b.fecha));
        const contadores: Record<string, number> = {};
        
        type RecordWithIncidence = AsistenciaRecord & { incidencia: number };
        
        const conIncidenciaTotal: RecordWithIncidence[] = ordenadoTotal.map((item) => {
            contadores[item.alias] = (contadores[item.alias] || 0) + 1;
            return {
                ...item,
                incidencia: contadores[item.alias]
            };
        });

        // Aplicar filtros sobre el total ya procesado
        let resultado = conIncidenciaTotal;

        if (filtroAgencia !== "TODAS") {
            resultado = resultado.filter(item => item.agencia === filtroAgencia);
        }
        if (filtroGrupo !== "TODOS") {
            resultado = resultado.filter(item => item.grupo === filtroGrupo);
        }

        // Filtrar por Nombre
        if (filtroNombre.trim() !== "") {
            const lowerQuery = filtroNombre.toLowerCase();
            resultado = resultado.filter(r => r.alias.toLowerCase().includes(lowerQuery));
        }

        // Filtrar por Color (Severidad)
        if (filtroColor !== "TODOS") {
            if (filtroColor === "VERDE") {
                resultado = resultado.filter(r => r.incidencia >= 1 && r.incidencia <= 3);
            } else if (filtroColor === "NARANJA") {
                resultado = resultado.filter(r => r.incidencia >= 4 && r.incidencia <= 6);
            } else if (filtroColor === "ROJO") {
                resultado = resultado.filter(r => r.incidencia >= 7);
            }
        }

        return resultado.sort((a, b) => {
            if (sortTardanzas.field === "fecha") {
                return sortTardanzas.order === "asc" ? parseFecha(a.fecha) - parseFecha(b.fecha) : parseFecha(b.fecha) - parseFecha(a.fecha);
            } else if (sortTardanzas.field === "alias") {
                const res = sortTardanzas.order === "asc" ? a.alias.localeCompare(b.alias) : b.alias.localeCompare(a.alias);
                if (res !== 0) return res;
                // Si tienen el mismo nombre, desempatamos en orden de su frecuencia
                return a.incidencia - b.incidencia;
            } else if (sortTardanzas.field === "incidencia") {
                const res = sortTardanzas.order === "asc" ? (a.incidencia - b.incidencia) : (b.incidencia - a.incidencia);
                if (res !== 0) return res;
                // Si tienen la misma frecuencia (ej. ambos son su "1ra" tardanza), los ordenamos alfabéticamente
                return a.alias.localeCompare(b.alias);
            } else if (sortTardanzas.field === "minutosTardanza") {
                const res = sortTardanzas.order === "asc" ? (a.minutosTardanza - b.minutosTardanza) : (b.minutosTardanza - a.minutosTardanza);
                if (res !== 0) return res;
                return a.alias.localeCompare(b.alias);
            }
            return 0;
        });
    }, [tardanzas, filtroAgencia, filtroGrupo, filtroNombre, filtroColor, sortTardanzas]);

    // --- PROCESAMIENTO FALTAS ---
    const faltasProcesadas = useMemo(() => {
        // Calcular incidencia global PRIMERO, antes de aplicar filtros
        const ordenadoTotal = [...faltas].sort((a, b) => parseFecha(a.fecha) - parseFecha(b.fecha));
        const contadores: Record<string, number> = {};
        
        type RecordWithIncidence = AsistenciaRecord & { incidencia: number };
        
        const conIncidenciaTotal: RecordWithIncidence[] = ordenadoTotal.map((item) => {
            contadores[item.alias] = (contadores[item.alias] || 0) + 1;
            return {
                ...item,
                incidencia: contadores[item.alias]
            };
        });

        // Aplicar filtros sobre el total ya procesado
        let resultado = conIncidenciaTotal;

        if (filtroAgencia !== "TODAS") {
            resultado = resultado.filter(item => item.agencia === filtroAgencia);
        }
        if (filtroGrupo !== "TODOS") {
            resultado = resultado.filter(item => item.grupo === filtroGrupo);
        }

        // Filtrar por Nombre
        if (filtroNombre.trim() !== "") {
            const lowerQuery = filtroNombre.toLowerCase();
            resultado = resultado.filter(r => r.alias.toLowerCase().includes(lowerQuery));
        }

        // Filtrar por Color en Faltas (Severidad)
        if (filtroColor !== "TODOS") {
            if (filtroColor === "VERDE") {
                resultado = []; // no hay verde en faltas
            } else if (filtroColor === "NARANJA") {
                resultado = resultado.filter(r => r.incidencia < 3);
            } else if (filtroColor === "ROJO") {
                resultado = resultado.filter(r => r.incidencia >= 3);
            }
        }

        return resultado.sort((a, b) => {
            if (sortFaltas.field === "fecha") {
                return sortFaltas.order === "asc" ? parseFecha(a.fecha) - parseFecha(b.fecha) : parseFecha(b.fecha) - parseFecha(a.fecha);
            } else if (sortFaltas.field === "alias") {
                const res = sortFaltas.order === "asc" ? a.alias.localeCompare(b.alias) : b.alias.localeCompare(a.alias);
                if (res !== 0) return res;
                return a.incidencia - b.incidencia;
            } else if (sortFaltas.field === "incidencia") {
                const res = sortFaltas.order === "asc" ? (a.incidencia - b.incidencia) : (b.incidencia - a.incidencia);
                if (res !== 0) return res;
                return a.alias.localeCompare(b.alias);
            }
            return 0;
        });
    }, [faltas, filtroAgencia, filtroGrupo, filtroNombre, filtroColor, sortFaltas]);

    // Handlers para Ordenamiento
    const toggleSortTardanzas = (field: "fecha" | "alias" | "incidencia" | "minutosTardanza") => {
        setSortTardanzas(prev => ({
            field,
            order: prev.field === field && prev.order === "desc" ? "asc" : "desc"
        }));
    }

    const toggleSortFaltas = (field: "fecha" | "alias" | "incidencia") => {
        setSortFaltas(prev => ({
            field,
            order: prev.field === field && prev.order === "desc" ? "asc" : "desc"
        }));
    }

    // --- LISTA DE AGENCIAS, GRUPOS Y NOMBRES ---
    const agenciasList = useMemo(() => {
        const todas = [...tardanzas, ...faltas].map(item => item.agencia).filter(Boolean);
        return Array.from(new Set(todas)).sort();
    }, [tardanzas, faltas]);

    const gruposList = useMemo(() => {
        const todos = [...tardanzas, ...faltas].map(item => item.grupo).filter(Boolean);
        return Array.from(new Set(todos)).sort();
    }, [tardanzas, faltas]);

    const nombresList = useMemo(() => {
        const todos = [...tardanzas, ...faltas].map(item => item.alias).filter(Boolean);
        return Array.from(new Set(todos)).sort();
    }, [tardanzas, faltas]);

    // Regla de estilos de color para tardanzas (1-3 Verde, 4-6 Naranja, 7+ Rojo)
    const getRowClassByIncidence = (incidencia: number) => {
        if (incidencia <= 3) {
            return "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 border-l-4 border-l-emerald-500"
        } else if (incidencia <= 6) {
            return "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-900/30 border-l-4 border-l-amber-500"
        } else {
            return "bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 border-l-4 border-l-red-500"
        }
    }

    const getBadgeByIncidence = (incidencia: number) => {
        if (incidencia <= 3) {
            return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">{incidencia}º Tardanza</Badge>
        } else if (incidencia <= 6) {
            return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0">{incidencia}º Tardanza</Badge>
        } else {
            return <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 flex items-center gap-1 w-max"><AlertTriangle className="w-3 h-3" /> {incidencia}º Tardanza</Badge>
        }
    }

    // Regla de estilos de color para faltas (<3 Naranja, >=3 Rojo)
    const getFaltaRowClassByIncidence = (incidencia: number) => {
        if (incidencia < 3) {
            return "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-900/30 border-l-4 border-l-amber-500"
        } else {
            return "bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 border-l-4 border-l-red-500"
        }
    }

    const getFaltaBadgeByIncidence = (incidencia: number) => {
        if (incidencia < 3) {
            return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0">{incidencia}º Falta</Badge>
        } else {
            return <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 flex items-center gap-1 w-max"><AlertTriangle className="w-3 h-3" /> {incidencia}º Falta</Badge>
        }
    }

    if (hasPermission === null || loading) {
        return (
            <div className="h-[72vh] -translate-x-10">
                <Loading />
            </div>
        )
    }

    if (hasPermission === false) {
        return (
            <div className="p-8 text-center text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-200 dark:border-rose-900 mx-4 mt-8 flex flex-col items-center justify-center space-y-4">
                <AlertTriangle className="w-12 h-12" />
                <p>No tienes los permisos necesarios para acceder al módulo de Alertas.</p>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 md:p-4 space-y-4"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground leading-tight">Panel de Alertas</h1>
                    <p className="text-sm text-muted-foreground">Monitorea y visualiza incidencias de asistencia como tardanzas y faltas.</p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                    <Card className="bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900 shadow-none">
                        <CardContent className="p-3 flex items-center gap-3">
                            <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full">
                                <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-red-600/80 dark:text-red-400/80 uppercase tracking-wider">Tardanzas Encontradas</p>
                                <p className="text-2xl font-bold text-red-700 dark:text-red-300 leading-none">{tardanzasProcesadas.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 bg-muted/40 p-3 rounded-xl border w-full shadow-sm dark:bg-muted/10">
                <div className="flex items-center w-full md:w-auto md:flex-1 relative" ref={autocompleteRef}>
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar empleado por nombre..." 
                        value={filtroNombre}
                        onChange={e => {
                            setFiltroNombre(e.target.value);
                            setShowAutocomplete(true);
                        }}
                        onFocus={() => setShowAutocomplete(true)}
                        className="h-10 w-full pl-9 bg-background shadow-sm text-base md:text-sm"
                        autoComplete="off"
                    />
                    
                    {/* Lista Flotante Personalizada */}
                    {showAutocomplete && filtroNombre.trim().length > 0 && (
                        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-background border rounded-lg shadow-xl max-h-[220px] overflow-auto flex flex-col p-1 animate-in fade-in slide-in-from-top-2">
                            {nombresList.filter(nombre => nombre.toLowerCase().includes(filtroNombre.toLowerCase())).length > 0 ? (
                                nombresList.filter(nombre => nombre.toLowerCase().includes(filtroNombre.toLowerCase())).map(nombre => (
                                    <div 
                                        key={nombre}
                                        className="px-3 py-2 cursor-pointer hover:bg-muted/70 rounded-md text-sm text-foreground transition-colors"
                                        onClick={() => {
                                            setFiltroNombre(nombre);
                                            setShowAutocomplete(false);
                                        }}
                                    >
                                        {nombre}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-4 text-sm text-muted-foreground text-center">No se encontraron empleados</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                    <span className="text-sm font-medium text-foreground whitespace-nowrap hidden md:inline-block">Agencia:</span>
                    <Select value={filtroAgencia} onValueChange={setFiltroAgencia}>
                        <SelectTrigger className="h-10 w-full md:w-[160px] bg-background border-input shadow-sm">
                            <SelectValue placeholder="Seleccionar Agencia" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TODAS" className="font-semibold text-blue-600 dark:text-blue-400">TODAS LAS AGENCIAS</SelectItem>
                            {agenciasList.map(agencia => (
                                <SelectItem key={agencia} value={agencia}>{agencia}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                    <span className="text-sm font-medium text-foreground whitespace-nowrap hidden md:inline-block">Grupo:</span>
                    <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
                        <SelectTrigger className="h-10 w-full md:w-[160px] bg-background border-input shadow-sm">
                            <SelectValue placeholder="Seleccionar Grupo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TODOS" className="font-semibold text-blue-600 dark:text-blue-400">TODOS LOS GRUPOS</SelectItem>
                            {gruposList.map(grupo => (
                                <SelectItem key={grupo} value={grupo}>{grupo}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                    <span className="text-sm font-medium text-foreground whitespace-nowrap hidden md:inline-block">Color:</span>
                    <Select value={filtroColor} onValueChange={setFiltroColor}>
                        <SelectTrigger className="h-10 w-full md:w-[130px] bg-background border-input shadow-sm">
                            <SelectValue placeholder="Color" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TODOS">TODOS</SelectItem>
                            <SelectItem value="VERDE" className="font-semibold text-emerald-600 dark:text-emerald-400">Verde (1-3)</SelectItem>
                            <SelectItem value="NARANJA" className="font-semibold text-amber-600 dark:text-amber-400">Naranja (4-6)</SelectItem>
                            <SelectItem value="ROJO" className="font-semibold text-red-600 dark:text-red-400">Rojo (7+)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="tardanzas" className="w-full">
                <TabsList className="grid w-full mb-6 max-w-md grid-cols-2">
                    <TabsTrigger value="tardanzas" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Tardanzas
                        <Badge className="ml-2 h-5 w-5 bg-black/10 text-foreground border-none p-0 flex items-center justify-center flex-shrink-0 dark:bg-white/10">{tardanzasProcesadas.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="faltas" className="flex items-center gap-2">
                        <CalendarX2 className="w-4 h-4" />
                        Faltas
                        <Badge className="ml-2 h-5 w-5 bg-black/10 text-foreground border-none p-0 flex items-center justify-center flex-shrink-0 dark:bg-white/10">{faltasProcesadas.length}</Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tardanzas" className="space-y-4 animate-in fade-in-50 duration-500">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Tardanzas</CardTitle>
                            <CardDescription>
                                Listado estructurado con regla de color por severidad (Verde: 1-3, Naranja: 4-6, Rojo: 7+).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead 
                                                className="font-semibold cursor-pointer hover:bg-muted/70 transition-colors select-none group"
                                                onClick={() => toggleSortTardanzas("fecha")}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Fecha
                                                    <ArrowUpDown className={`w-3 h-3 ${sortTardanzas.field === "fecha" ? "text-foreground" : "text-transparent group-hover:text-muted-foreground"}`} />
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="font-semibold cursor-pointer hover:bg-muted/70 transition-colors select-none group"
                                                onClick={() => toggleSortTardanzas("alias")}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Empleado
                                                    <ArrowUpDown className={`w-3 h-3 ${sortTardanzas.field === "alias" ? "text-foreground" : "text-transparent group-hover:text-muted-foreground"}`} />
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold">Grupo</TableHead>
                                            <TableHead className="font-semibold">Hora de Ingreso</TableHead>
                                            <TableHead 
                                                className="font-semibold cursor-pointer hover:bg-muted/70 transition-colors select-none group"
                                                onClick={() => toggleSortTardanzas("minutosTardanza")}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Minutos Tarde
                                                    <ArrowUpDown className={`w-3 h-3 ${sortTardanzas.field === "minutosTardanza" ? "text-foreground" : "text-transparent group-hover:text-muted-foreground"}`} />
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="font-semibold cursor-pointer hover:bg-muted/70 transition-colors select-none group"
                                                onClick={() => toggleSortTardanzas("incidencia")}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Frecuencia
                                                    <ArrowUpDown className={`w-3 h-3 ${sortTardanzas.field === "incidencia" ? "text-foreground" : "text-transparent group-hover:text-muted-foreground"}`} />
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tardanzasProcesadas.length > 0 ? tardanzasProcesadas.map((item, id) => (
                                            <TableRow 
                                                key={id} 
                                                className={`transition-colors h-14 ${getRowClassByIncidence(item.incidencia)}`}
                                            >
                                                <TableCell className="font-medium">
                                                    {item.fecha}
                                                </TableCell>
                                                <TableCell className="font-bold text-foreground">
                                                    {item.alias}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground w-1/6">
                                                    {item.grupo}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-mono">
                                                    {item.horaIngreso || '---'}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-bold text-red-500 dark:text-red-400">
                                                        {item.minutosTardanza} min
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {getBadgeByIncidence(item.incidencia)}
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                    No hay registros de tardanzas.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="faltas" className="space-y-4 animate-in fade-in-50 duration-500">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Faltas</CardTitle>
                            <CardDescription>
                                Listado de inasistencias detectadas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead 
                                                className="font-semibold cursor-pointer hover:bg-muted/70 transition-colors select-none group"
                                                onClick={() => toggleSortFaltas("fecha")}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Fecha
                                                    <ArrowUpDown className={`w-3 h-3 ${sortFaltas.field === "fecha" ? "text-foreground" : "text-transparent group-hover:text-muted-foreground"}`} />
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="font-semibold cursor-pointer hover:bg-muted/70 transition-colors select-none group"
                                                onClick={() => toggleSortFaltas("alias")}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Empleado
                                                    <ArrowUpDown className={`w-3 h-3 ${sortFaltas.field === "alias" ? "text-foreground" : "text-transparent group-hover:text-muted-foreground"}`} />
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold">Grupo</TableHead>
                                            <TableHead className="font-semibold">Estado</TableHead>
                                            <TableHead 
                                                className="font-semibold cursor-pointer hover:bg-muted/70 transition-colors select-none group"
                                                onClick={() => toggleSortFaltas("incidencia")}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Frecuencia
                                                    <ArrowUpDown className={`w-3 h-3 ${sortFaltas.field === "incidencia" ? "text-foreground" : "text-transparent group-hover:text-muted-foreground"}`} />
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {faltasProcesadas.length > 0 ? faltasProcesadas.map((item, id) => (
                                            <TableRow 
                                                key={id}
                                                className={`transition-colors h-14 ${getFaltaRowClassByIncidence(item.incidencia)}`}
                                            >
                                                <TableCell className="font-medium">
                                                    {item.fecha}
                                                </TableCell>
                                                <TableCell className="font-bold text-foreground">
                                                    {item.alias}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground w-1/6">
                                                    {item.grupo}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {item.hayJustificacion ? (
                                                        <span className="text-amber-600 font-medium">{item.tipoJustificacion}</span>
                                                    ) : (
                                                        <span className="text-red-600 dark:text-red-400 font-medium font-mono text-sm inline-flex items-center gap-1">
                                                            <Info className="w-3 h-3" />
                                                            Sin justificar
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getFaltaBadgeByIncidence(item.incidencia)}
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                    No hay registros de faltas.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    )
}
