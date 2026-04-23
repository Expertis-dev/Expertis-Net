"use client";

import { checkTurnoPermitido, getTurno } from "@/actions/escucha";
import { toast } from 'sonner'
import { Filtro } from "@/components/seguimiento-asesor/escuchas/Filtro";
import { ValidationErrorModal } from "@/components/seguimiento-asesor/escuchas/formulario/ValidationErrorModal";
import { TableEscuchas } from "@/components/seguimiento-asesor/escuchas/TableEscuchas";
import { motion } from "framer-motion";
import {
    Award,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formTime } from "./formulario/page";
import { useUser } from "@/Provider/UserProvider";

type FiltersState = {
    searchTerm: string;
    startDate: string;
    endDate: string;
};

export interface CantidadEscucha {
    id_rep:                    number | undefined;
    supervisor:                string | undefined;
    numeroDeEscuchasRealizadas: number;
    numeroDeEscuchasFaltantes:  number;
    agencia:                   string;
}


export const EscuchasClientPage = () => {
    const router = useRouter();
    const [validationError, setValidationError] = useState<string | null>(null)
    const [filters, setFilters] = useState<FiltersState>({
        searchTerm: "",
        startDate: "",
        endDate: "",
    });
    const [turno, setTurno] = useState<string>()

    const [escuchasRealizadas, setEscuchasRealizadas] = useState<CantidadEscucha>({
        id_rep: undefined,
        supervisor: undefined,
        numeroDeEscuchasRealizadas: 0,
        numeroDeEscuchasFaltantes: 4,
        agencia: "EXPERTIS"
    })
    
    const {user} = useUser()
    const fecha = useMemo(() => {
        const date = (new Date()).toISOString();
        const formattedDate = date.split('T')[0];
        return formattedDate
    }, [])

    useEffect(() => {
        const fetchNumeroEscuchas = async (): Promise<CantidadEscucha> => {
            const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/numero-de-escuchas-realizadas`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({usuario: user?.usuario || ''})
            }).then(r => r.json())
            return data
        }
        getTurnoActual()
        fetchNumeroEscuchas()
            .then(r => setEscuchasRealizadas(r))
    }, [])

    const onClickRealizar = async () => {
        if (escuchasRealizadas.id_rep === -1){
            toast.error("No se encontrado modulo de escucha")
            return;
        }
        if (await checkTurnoPermitido(formTime / 60)){
            router.push(`/dashboard/seguimiento-asesor/escuchas/formulario?id_reporte=${escuchasRealizadas.id_rep}`)
        }else {
            toast.error("No estas dentro del plazo permitido")
        }
    }

    const getTurnoActual = async () => {
        setTurno((await getTurno()))
    }

    return (
        <div className="space-y-4 max-w-[90%] mx-auto">
            <Filtro filters={filters} setFilters={setFilters} />
            <div className="px-6 pb-6 space-y-4">
                <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="bg-card p-4 rounded-2xl shadow-sm border border-border flex flex-col justify-between relative overflow-hidden group"
                    >
                        <div>
                            <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                                Cumplimiento
                            </p>
                            <h2 className="text-2xl font-black text-primary mt-1">
                                {(escuchasRealizadas?.numeroDeEscuchasRealizadas / (escuchasRealizadas?.numeroDeEscuchasRealizadas + escuchasRealizadas?.numeroDeEscuchasFaltantes) * 100).toFixed(2)}%
                            </h2>
                        </div>
                        <Award className="absolute -bottom-2 -right-2 w-16 h-16 text-primary/5 group-hover:text-primary/10 transition-colors" />
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="md:col-span-2 bg-card py-3 rounded-2xl shadow-sm border border-border grid grid-cols-2 grid-rows-2"
                    >
                        <div className="col-span-2 text-center">
                            <h3 className="font-bold text-muted-foreground text-[14px]">{turno === "" ? "No estas en turno" : "Turno: " + turno}</h3>
                            <p className="text-[10px] text-gray-600">*Minimo 2 escuchas por turno</p>
                        </div>
                        {[
                            {
                                label: "Hecho",
                                value: escuchasRealizadas.numeroDeEscuchasRealizadas,
                                color: "bg-emerald-500",
                            },
                            {
                                label: "Faltante",
                                value: escuchasRealizadas.numeroDeEscuchasFaltantes >= 0 ? escuchasRealizadas.numeroDeEscuchasFaltantes : 0,
                                color: "bg-amber-500",
                            },
                        ].map((kpi, index) => (
                            <div
                            key={kpi.label}
                            className={`-mt-3 flex flex-col justify-center items-center text-center ${index === 0 ? "border-r border-border" : ""}`}
                            >
                                <p className="text-[9px] font-bold text-muted-foreground uppercase">
                                    {kpi.label}
                                </p>
                                <span className="text-xl font-black mt-1">
                                    {kpi.value}
                                </span>
                                <div className="w-8 h-1 bg-muted rounded-full mt-2">
                                    <div
                                        className={`h-full ${kpi.color} rounded-full`}
                                        style={{
                                            width: `${((kpi.value > 4 ? 4 : kpi.value) / 4) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="border border-border p-5 rounded-2xl shadow-md flex flex-col justify-between dark:bg-zinc-900 overflow-hidden relative"
                    >
                        <div className="flex justify-between items-start z-10 text-foreground">
                            <p className="text-[11px] font-bold uppercase">
                                Escuchas
                            </p>
                            <span className="bg-primary/10 text-primary px-1.5 rounded text-[11px] font-black">
                                {escuchasRealizadas.numeroDeEscuchasFaltantes < 0 ? 0 : escuchasRealizadas.numeroDeEscuchasFaltantes < 0} PEND.
                            </span>
                        </div>
                        <button
                            className="w-full py-2 bg-green-600 text-white rounded-xl text-[11px] font-extrabold mt-2 hover:bg-green-500 transition-all cursor-pointer shadow-lg active:scale-95 z-10"
                            onClick={onClickRealizar}
                        >
                            REALIZAR
                        </button>
                    </motion.div>
                </section>
                <TableEscuchas filters={filters} />
            </div>
            <ValidationErrorModal
                setValidationError={setValidationError}
                validationError={validationError}
            />
        </div>
    );
};
