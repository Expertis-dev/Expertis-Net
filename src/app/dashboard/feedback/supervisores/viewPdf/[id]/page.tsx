import { SupervisorPdfActionsPanel } from "@/components/feedback/supervisor/viewPdf/SupervisorPdfActionsPanel";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const feedbackMetrics = [
    { label: "Recupero", value: "440,191" },
    { label: "Meta", value: "440,191" },
    { label: "Alcance", value: "101.97%" },
    { label: "Efectividad", value: "0.292%" },
    { label: "Monto PDP", value: "516.960" },
    { label: "% Cierre", value: "16.93%" },
    { label: "% Calidad (Monto)", value: "85.15%" },
    { label: "Pago / DK PPC", value: "85.15%" },
    { label: "% Puntualidad", value: "81.85%" },
    { label: "% Puntualidad - Equipo", value: "92.85%" },
    { label: "% Ausentismo Equipo", value: "0.5%" },
];

export default function ViewSupervisorPdfPage() {


    return (
        <div className="mx-auto w-full max-w-6xl space-y-4 pb-6">
            <Link href={"/dashboard/feedback/supervisores"} className="flex flex-row mb-2 text-gray-500">
                <ArrowLeft size={13} className="self-center"/>
                <p className="self-center text-xs">Volver a la pagina anterior</p>
            </Link>
            <div className="rounded-sm border border-zinc-200 p-6 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 dark:bg-zinc-900">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">Feedback supervisor</p>
                
                <div className="flex flex-row">
                    <h1 className="mt-2 text-2xl font-bold flex-1 tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">Detalle del feedback</h1>
                    <p className="self-center inline-flex items-center rounded-full border border-amber-400/70 bg-amber-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-900 shadow-sm dark:border-amber-500/50 dark:bg-amber-400/20 dark:text-amber-100">
                        listo para firmar
                    </p>
                </div>

                <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
                    Revisa la informacion del supervisor y visualiza los archivos PDF correspondientes.
                </p>
            </div>

            <div className="rounded-sm border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Datos del supervisor</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/60">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Nombre</p>
                        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">Sebastian Guzman</p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/60">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Tipo feedback</p>
                        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">Rutina</p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/60">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Periodo</p>
                        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">Marzo de 2026</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-sm border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 lg:col-span-2">
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Datos del feedback</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {feedbackMetrics.map((metric) => (
                            <div
                                key={metric.label}
                                className="flex items-center justify-between rounded-sm border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/60"
                            >
                                <p className="text-sm text-zinc-600 dark:text-zinc-300">{metric.label}</p>
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{metric.value}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 grid space-y-2">
                        <div className="flex flex-col pt-2 border dark:bg-zinc-800 rounded-sm">
                            <p className="text-base font-semibold dark:text-zinc-100s p-2 mb-2 -mt-2 border-b-2">&nbsp;&nbsp; Analisis de resultados</p>
                            <p className="text-sm mx-2 mb-2 px-2 dark:text-zinc-100">
                                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Atque repellendus consectetur quis veritatis numquam hic? Assumenda cupiditate aspernatur illum dolorum commodi distinctio. Accusantium officia fugiat assumenda, quos deleniti itaque dicta.
                                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos accusantium quas harum adipisci? Natus, assumenda nobis vitae non quibusdam eveniet similique minima reiciendis exercitationem mollitia cum maiores quia, libero dolor.
                            </p>
                        </div>
                        <div className="flex flex-col border dark:bg-zinc-800 rounded-sm">
                            <p className="text-base font-semibold dark:text-zinc-100s p-2 mb-2 border-b-2">&nbsp;&nbsp;Compromiso de mejora</p>
                            <p className="text-sm mx-2 mb-2 px-2 dark:text-zinc-100">No disponible</p>
                        </div>
                    </div>
                </div>
                <SupervisorPdfActionsPanel />
            </div>
        </div>
    );
}
