"use client";
import { motion, AnimatePresence } from "framer-motion";
import { parseISO, isValid, format } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// opcional si lo tienes:
// import { Badge } from "@/components/ui/badge";

import type { OpcionVacaciones } from "@/lib/logicDiasVacaOpciones";
import { useEffect, useState } from "react";

interface OpcionesVacacionesProps {
    readonly isOpen: boolean;
    readonly opciones: OpcionVacaciones[];

    // Cerrar modal
    readonly onClose: () => void;

    // Enviar opción elegida al padre
    readonly onSelect: (opcion: OpcionVacaciones) => void;

    // Opcional: mostrar lo que el usuario intentó seleccionar
    readonly intentoUsuario?: { from: string; to: string }; // "YYYY-MM-DD"
}

function safeFmtISOToHuman(iso?: string) {
    if (!iso) return "—";
    const d = parseISO(iso);
    if (!isValid(d)) return iso; // fallback si viene raro
    return format(d, "dd/MM/yyyy");
}

function safeFmtRange(from?: string, to?: string) {
    if (!from || !to) return "—";
    return `${safeFmtISOToHuman(from)} → ${safeFmtISOToHuman(to)}`;
}

export function OpcionesVacaciones({
    isOpen,
    opciones,
    onClose,
    onSelect,
    intentoUsuario,
}: OpcionesVacacionesProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // reset al abrir
    useEffect(() => {
        if (isOpen) setSelectedIndex(0);
    }, [isOpen, opciones.length]);

    // cerrar con ESC + bloquear scroll
    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", onKeyDown);

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen, onClose]);

    const selected = opciones?.[selectedIndex];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="vacaciones-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 "
                    onMouseDown={() => onClose()} // click afuera cierra
                >
                    <motion.div
                        key="vacaciones-modal-panel"
                        initial={{ scale: 0.96, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.96, opacity: 0, y: 10 }}
                        transition={{ type: "spring", duration: 0.25 }}
                        onMouseDown={(e) => e.stopPropagation()} // evita cerrar si clic dentro
                    >
                        <Card className="w-[min(980px,calc(100vw-1rem))]">
                            <CardContent className="">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold">Opciones sugeridas</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Elige el rango que más te convenga. Todas las opciones mostradas ya están validadas.
                                        </p>

                                        {intentoUsuario?.from && intentoUsuario?.to && (
                                            <div className="mt-2 text-sm">
                                                <span className="text-muted-foreground">Tu selección:</span>{" "}
                                                <span className="font-medium">
                                                    {safeFmtRange(intentoUsuario.from, intentoUsuario.to)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="mt-2 grid grid-cols-1 gap-4">
                                    {/* Lista */}
                                    <div>
                                        <div className="max-h-[280px] overflow-auto p-0">
                                            {(!opciones || opciones.length === 0) ? (
                                                <div className="p-6 text-center text-sm text-muted-foreground">
                                                    No se encontraron opciones válidas.
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    {opciones.map((op, idx) => {
                                                        const active = idx === selectedIndex;
                                                        const pct = Math.round((op.overlapPct ?? 0) * 100);

                                                        return (
                                                            <button
                                                                key={`${op.dateRange.from}-${op.dateRange.to}`} // key estable
                                                                type="button"
                                                                onClick={() => setSelectedIndex(idx)}
                                                                className={[
                                                                    "w-full text-left rounded-lg border p-3 transition",
                                                                    active
                                                                        ? "border-primary ring-1 ring-primary/30 bg-primary/5"
                                                                        : "hover:bg-muted/50",
                                                                ].join(" ")}
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <div className="font-medium truncate">
                                                                            {safeFmtRange(op.dateRange.from, op.dateRange.to)}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground mt-1">
                                                                            Mantiene {pct}% de tus fechas
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-xs shrink-0 text-right">
                                                                        <div className="font-medium">
                                                                            Laborable: {op.dayStats.laborables} / No Laborable: {op.dayStats.noLaborables}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {op.message && (
                                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                                        {op.message}
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className=" text-xs text-muted-foreground">
                                        Tip: Si no encuentras una opción que te guste, ajusta tu rango y vuelve a intentar.
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={onClose}>
                                            Cancelar
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                onSelect(selected);
                                                onClose();
                                            }}
                                        >
                                            Elegir esta opción
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
