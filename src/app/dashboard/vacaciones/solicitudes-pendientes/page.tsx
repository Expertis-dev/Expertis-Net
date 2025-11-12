"use client"
import { DashboardLayout } from "@/components/dashboard-layout";
import { motion } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react";
import { SolicitudesAprobadas } from "@/types/Vacaciones";
import { BadgeStatus } from "@/components/BadgeStatus";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { ViewPendientesRevisar } from "@/components/ViewPendientesRevisar";
export default function SolicitudesPendientes() {
    const [isVer, setIsVer] = useState(false);
    const [SolicitudesPendientes, setSolicitudesPendientes] = useState<SolicitudesAprobadas[]>([]);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudesAprobadas>({} as SolicitudesAprobadas);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerSolicitudesAdmitidasTodas`);
                const data = await response.json();
                setSolicitudesPendientes(data.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        fetchData();
    }, [])
    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-[#001529] dark:text-white mb-2">Solicitudes Pendientes Por Revisar</h1>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-medium">Fecha de Solicitud</TableHead>
                            <TableHead className="font-medium">Fecha de Inicio</TableHead>
                            <TableHead className="font-medium">Fecha Final</TableHead>
                            <TableHead className="font-medium">Empleado</TableHead>
                            <TableHead className="font-medium">Estado</TableHead>
                            <TableHead className="font-medium">Cantidad de Días</TableHead>
                            <TableHead className="font-medium">Area</TableHead>
                            <TableHead className="font-medium">Ver</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {SolicitudesPendientes.map((solicitud, index) => (
                            <TableRow
                                key={`${solicitud.idSolicitudAprobada}`}
                                className="animate-in slide-in-from-left-5 duration-300"
                                style={{ animationDelay: `${index * 100} ms` }}
                            >
                                <TableCell className="font-medium">{solicitud.fecSolicitud.split("T")[0]}</TableCell>
                                <TableCell>{solicitud.fecInicial.split("T")[0]}</TableCell>
                                <TableCell>{solicitud.fecFinal.split("T")[0]}</TableCell>
                                <TableCell className="font-medium text-foreground">{solicitud.alias}</TableCell>
                                <TableCell>
                                    <BadgeStatus estado={solicitud.estado} />
                                </TableCell>
                                <TableCell className="font-medium">{solicitud.cantDias}</TableCell>
                                <TableCell className="font-medium">{solicitud.nombreArea}</TableCell>
                                <TableCell className="font-medium">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSolicitudSeleccionada(solicitud);
                                            setIsVer(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </motion.div>
            <ViewPendientesRevisar isOpen={isVer} onClose={() => setIsVer(false)} solicitud={solicitudSeleccionada} />
        </DashboardLayout>
    );
}