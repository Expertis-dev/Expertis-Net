"use client";
import { Filtro } from "@/components/seguimiento-asesor/escuchas/Filtro";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { useRouter } from "next/navigation";

export const EscuchasClientPage = () => {
    const router = useRouter()
    return (
        <div>
            <Filtro />
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
                            50%
                        </h2>
                    </div>
                    <Award className="absolute -bottom-2 -right-2 w-16 h-16 text-primary/5 group-hover:text-primary/10 transition-colors" />
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="md:col-span-2 bg-card p-4 rounded-2xl shadow-sm border border-border grid grid-cols-2 gap-2"
                >
                    {[
                        { label: "Hecho", value: "1", color: "bg-emerald-500" },
                        {
                            label: "Faltante",
                            value: "2",
                            color: "bg-amber-500",
                        },
                    ].map((kpi, i) => (
                        <div
                            key={i}
                            className={`flex flex-col justify-center items-center text-center ${i === 0 ? "border-r border-border" : ""}`}
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
                                        width: `${(parseInt(kpi.value) / 6) * 100}%`,
                                    }}
                                ></div>
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
                            Escuchas{" "}
                        </p>
                        <span className="bg-primary/10 text-primary px-1.5 rounded text-[11px] font-black">
                            4 PEND.
                        </span>
                    </div>
                    <button
                        className="w-full py-2 bg-green-600 text-white rounded-xl text-[11px] font-extrabold mt-2 hover:bg-green-500 transition-all cursor-pointer shadow-lg active:scale-95 z-10"
                        onClick={() => router.push('/dashboard/seguimiento-asesor/escuchas/formulario')}
                    >
                        REALIZAR
                    </button>
                </motion.div>
            </section>
        </div>
    );
};
