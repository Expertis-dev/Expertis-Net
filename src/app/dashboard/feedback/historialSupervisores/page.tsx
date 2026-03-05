import { Button } from "@/components/ui/button";
import { Edit2Icon } from "lucide-react";

export default function HistorialSupervisoresPage() {
    return (
        <>
            <div className="-mt-3">
                <h1 className="font-semibold text-x"><span className="text-orange-700 font-semibold">!</span> Acción Pendiente</h1>
                <div>
                    <h2>Enero 2026</h2>
                    <p>Evaluacion disponible. Se requiere compromiso de mejora basado en el feedback de jefatura de operaciones</p>
                </div>
                <Button>
                    Redactar compromiso
                    <Edit2Icon className=""/>
                </Button>
            </div>
        </>
    );
}