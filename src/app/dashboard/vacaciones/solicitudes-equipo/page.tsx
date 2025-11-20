"use client"
import { DashboardLayout } from '@/components/dashboard-layout'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useUser } from '@/Provider/UserProvider'
import { getSolicitudesAprobadas, getSolicitudesProceso } from '../../../../services/vacaciones'
import { ArraySolicitudesAprobadas, ArraySolicitudesProceso } from '../../../../types/Vacaciones'
import { BadgeStatus } from '@/components/BadgeStatus'
import { ListaColaboradores } from '@/services/ListaColaboradores'
export default function SolicitudesEquipo() {
    const { user } = useUser()
    const [solicitudesPendientes, setSolicitudesPendientes] = useState<ArraySolicitudesProceso>([])
    const [solicitudesAprobadas, setSolicitudesAprobadas] = useState<ArraySolicitudesAprobadas>([])
    useEffect(() => {
        const ObtenerInfo = async () => {
            const idColaboradores = await ListaColaboradores(user?.usuario)
            const pendientes = await getSolicitudesProceso({ lista: idColaboradores })
            const aprobadas = await getSolicitudesAprobadas({ lista: idColaboradores })
            setSolicitudesPendientes(pendientes)
            setSolicitudesAprobadas(aprobadas)
        }
        ObtenerInfo()
    }, [user])
    return (
        <DashboardLayout>
            <div className="space-y-4 animate-in fade-in-50 duration-700">
                <Card className="animate-in fade-in-50 duration-500">
                    <CardHeader className="">
                        <CardTitle className="text-lg font-semibold text-foreground">Solicitudes en Proceso</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-medium">Fecha de Solicitud</TableHead>
                                    <TableHead className="font-medium">Fecha de Inicio</TableHead>
                                    <TableHead className="font-medium">Fecha Final</TableHead>
                                    <TableHead className="font-medium">Empleado</TableHead>
                                    <TableHead className="font-medium">Estado</TableHead>
                                    <TableHead className="font-medium">Cantidad de Días</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {solicitudesPendientes.length > 0 ? solicitudesPendientes.map((solicitud, index) => (
                                    <TableRow
                                        key={`${solicitud.id}`}
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
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={6} className="text-center">No hay solicitudes pendientes</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="animate-in fade-in-50 duration-500">
                    <CardHeader className="">
                        <CardTitle className="text-lg font-semibold text-foreground">Solicitudes Aprobadas</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-medium">Fecha de Solicitud</TableHead>
                                    <TableHead className="font-medium">Fecha de Inicio</TableHead>
                                    <TableHead className="font-medium">Fecha Final</TableHead>
                                    <TableHead className="font-medium">Empleado</TableHead>
                                    <TableHead className="font-medium">Estado</TableHead>
                                    <TableHead className="font-medium">Cantidad de Días</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {solicitudesAprobadas.length > 0 ? solicitudesAprobadas.map((solicitud, index) => (
                                    <TableRow
                                        key={`${solicitud.idVacacionesSolicitudes}`}
                                        className="animate-in slide-in-from-left-5 duration-300"
                                        style={{ animationDelay: `${index * 100} ms` }}
                                    >
                                        <TableCell className="font-medium">{solicitud.fecSolicitud.split("T")[0]}</TableCell>
                                        <TableCell>{solicitud.fecInicial.split("T")[0]}</TableCell>
                                        <TableCell>{solicitud.fecFinal.split("T")[0]}</TableCell>
                                        <TableCell className="font-medium text-foreground">{solicitud.alias}</TableCell>
                                        <TableCell>
                                            <BadgeStatus estado={solicitud.estadoVacaciones} />
                                        </TableCell>
                                        <TableCell className="font-medium">{solicitud.cantDias}</TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={6} className="text-center">No hay solicitudes aprobadas</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
