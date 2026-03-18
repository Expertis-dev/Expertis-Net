"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Incidencia } from "../alertaIncidencias/page";
import { CasosTable } from "@/components/amonestaciones/casos/CasosTable";
import { useEffect, useState } from "react";
import { DetalleIncidencia } from "@/components/amonestaciones/detalleIncidencias/DetalleIncidencia";
import { LoadingModal } from "@/components/loading-modal";

export default function CasosPage() {
    const [incidencias, setIncidencias] = useState<Incidencia[]>([])
    const [selectedAmo, setSelectedAmo] = useState<Incidencia[]>([])
    const [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
        setIsLoading(true)
        const getIncidenciasMes = async (): Promise<Incidencia[]> => {
            const now = new Date()
            const month = now.getMonth()
            const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reporteCruzado/${month + 1}`).then(res => res.json())
            return Array.isArray(data) ? data : []
        }
        getIncidenciasMes().then((r) => setIncidencias(r)).finally(() => setIsLoading(false))

    }, [])

    return (
        <>
            {
                selectedAmo.length === 0 ?
                    <>
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-col">

                                <h1 className="text-black text-xl font-semibold dark:text-gray-100">Casos Activos</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Gestione y supervise los procedimientos disciplinarios en cusro y su historial</p>
                            </div>
                            <Link href={"/dashboard/amonestaciones/registroAmonestacion"}>
                                <Button className="text-white hover:bg-blue-600 bg-blue-500">
                                    + Abrir nuevo caso
                                </Button>
                            </Link>
                        </div>
                        <CasosTable
                            setSelectedAmo={setSelectedAmo}
                            incidencias={incidencias.filter((j) => j.esFalta === 1 || j.esTardanza === 1)}
                        />
                    </>
                    :
                    <DetalleIncidencia
                        selectedAmo={selectedAmo}
                        setSelectedAmo={setSelectedAmo}
                    />
            }
            <LoadingModal
                isOpen={isLoading}
                message="Cargando casos"
            />
        </>
    );
}
