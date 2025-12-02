"use client"

import { AutoComplete } from "@/components/autoComplete";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";
import { LoadingModal } from "@/components/loading-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useUser } from "@/Provider/UserProvider";
import { CargarActividad } from "@/services/CargarActividad";
import { Jefe } from "@/types/Empleado";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EliminarEmpleado() {
    const { user } = useUser()
    const [empleados, setEmpleados] = useState<Jefe[]>([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [empleado, setEmpleado] = useState<Jefe | null>(null);
    const [loading, setLoading] = useState(true);

    async function getListado() {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listarEmpleados`);
            const data = await response.json();
            setEmpleados(data);
        } catch (error) {
            console.error("Error obteniendo empleados:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getListado();
    }, []);

    const handleJefeSelect = (selectedEmpleado: Jefe | null) => {
        setEmpleado(selectedEmpleado);
    };

    const handleEliminar = async () => {
        setLoading(true);
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eliminarEmpleados`, {
                method: "POST",
                cache: "no-store",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ usuario: empleado?.usuario }),
            });
            toast.success("Empleado eliminado correctamente");
            CargarActividad({
                usuario: user?.usuario || "Desconocido",
                titulo: "Se elimino correctamente",
                descripcion: `Se elimino el empleado ${empleado?.usuario}`,
                estado: "completed",
            })
        } catch (error) {
            toast.error("Error al eliminar empleado");
            CargarActividad({
                usuario: user?.usuario || "Desconocido",
                titulo: "No se elimino un empleado",
                descripcion: `Se puedo eliminar al empleado ${empleado?.usuario}`,
                estado: "error",
            })
            console.error("Error obteniendo empleados:", error);
        } finally {
            getListado();
            setShowConfirmation(false);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl space-y-4 mx-auto px-4 sm:px-6 lg:px-8">

            <Card>
                <CardHeader>
                    <CardTitle>
                        <h1 className="text-3xl font-bold text-[#001529] dark:text-white mb-2">
                            Eliminar empleado
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Seleccione el empleado que desea dar de baja
                        </p>
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="space-y-2">
                        <Label>Seleccionar empleado</Label>

                        {
                            loading ? (
                                <p className="text-sm text-slate-500">Cargando lista de empleados...</p>
                            ) : (
                                <AutoComplete
                                    employees={empleados}
                                    onSelect={handleJefeSelect}
                                    placeholder="Buscar empleado por nombre..."
                                />
                            )
                        }
                    </div>

                    <div className="w-full flex items-center justify-center pt-8">
                        <Button
                            onClick={() => empleado && setShowConfirmation(true)}
                            disabled={!empleado}
                        >
                            Confirmar eliminación
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <DeleteConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleEliminar}
                title="Confirmar eliminación"
                message={`¿Desea eliminar al empleado "${empleado?.usuario}" de forma permanente?`}
            />

            <LoadingModal isOpen={loading} message="Procesando solicitud..." />
        </div>
    );
}
