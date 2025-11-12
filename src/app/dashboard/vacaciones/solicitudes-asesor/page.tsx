"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "lucide-react"
import { AutoComplete } from "@/components/autoComplete"
import { ArraySolicitudes } from "../../../../types/Vacaciones"
import { BadgeStatus } from "@/components/BadgeStatus"
import { toast } from "sonner"
import { useColaboradores } from "@/hooks/useColaboradores"
import { Empleado } from "@/types/Empleado"

export default function SolicitudesAsesor() {
  const { colaboradores } = useColaboradores()
  const [asesor, setAsesor] = useState<Empleado | null>(null)
  const [historial, setHistorial] = useState<ArraySolicitudes>([])
  useEffect(() => {
    const ObtenerHistorial = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerIdEmpleadoPorAlias`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ asesor: asesor?.usuario }),
      });
      const json = await res.json();
      const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerVacacionesAsesor`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idEmpleado: json.data[0].idEmpleado }),
      });
      const json2 = await res2.json();
      if(json2.message){
        toast.error("No tiene historial de vacaciones")
        setHistorial([])
        return
      }
      setHistorial(json2.data)
    }
    if (asesor) {
      ObtenerHistorial()
    }
  }, [asesor])
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#001529] dark:text-white mb-2"> Solicitudes Asesor</h1>
          <p className="text-slate-600 dark:text-slate-400">Consulta el historial de vacaciones de los asesores</p>
        </div>
        {/* Búsqueda de Asesor */}
        <AutoComplete
          employees={colaboradores}
          onSelect={setAsesor}
        />
        {/* Tabla de Historial */}
        {asesor && (
          <Card>
            <CardHeader>
              <CardTitle>
                Historial de Vacaciones - {asesor.usuario} ({historial.length} registros)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historial.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cód. Mes</TableHead>
                        <TableHead>Fecha Inicio</TableHead>
                        <TableHead>Fecha Fin</TableHead>
                        <TableHead>Días Tomados</TableHead>
                        <TableHead>Días Hábiles</TableHead>
                        <TableHead>Días No Hábiles</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Solicitud</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historial.map((item) => (
                        <motion.tr
                          key={item.idVacacionesSolicitudes}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TableCell className="font-medium">{item.codMes.split("T")[0]}</TableCell>
                          <TableCell>{item.fecInicial.split("T")[0]}</TableCell>
                          <TableCell>{item.fecFinal.split("T")[0]}</TableCell>
                          <TableCell className="text-center">{item.cantDias}</TableCell>
                          <TableCell className="text-center">{item.cantDiasHabiles}</TableCell>
                          <TableCell className="text-center">{item.cantDiasNoHabiles}</TableCell>
                          <TableCell>
                            <BadgeStatus estado={item.estadoVacaciones} />
                          </TableCell>
                          <TableCell>{item.fecSolicitud.split("T")[0]}</TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">
                    {asesor
                      ? "No se encontraron registros para este asesor"
                      : "Selecciona un asesor para ver su historial"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
