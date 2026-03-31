import { SupervisorPdfActionsPanel } from "@/components/feedback/supervisor/viewPdf/SupervisorPdfActionsPanel";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const feedbackMetrics = [
    { key: "recupero", label: "Recupero", unit: "S/" },
    { key: "meta", label: "Meta", unit: "S/" },
    { key: "alcance", label: "Alcance", unit: "%" },
    { key: "efectividad", label: "Efectividad", unit: "%" },
    { key: "montoPdp", label: "Monto PDP", unit: "S/" },
    { key: "cierre", label: "% Cierre", unit: "%" },
    { key: "calidad", label: "% Calidad (Monto)", unit: "%" },
    { key: "pagoDkPpc", label: "Pago / DK PPC", unit: "%" },
    { key: "puntualidad", label: "% Puntualidad", unit: "%" },
    { key: "puntualidadEquipo", label: "% Puntualidad - Equipo", unit: "%" },
    { key: "ausentismoEquipo", label: "% Ausentismo Equipo", unit: "%" },
];

interface Feedback {
    idFeedBack: number
    USUARIO: string
    tipoEmpleado: string
    periodo: Date
    estadoFeedBack: string
    analisisResultados: string
    compromisoMejora: string
    resultadoEvaluacion: string
    tipoEvaluacion: string
    observacionesGenerales: string
}

interface ResultadoEvaluacion {
    recupero: string;
    meta: string;
    alcance: string;
    efectividad: string;
    montoPdp: string;
    cierre: string;
    calidad: string;
    pagoDkPpc: string;
    puntualidad: string;
    puntualidadEquipo: string;
    ausentismoEquipo: string;
}


const fetchFeedback = async (idFeedback: number): Promise<Feedback> => {
    const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${idFeedback}`).then(r => r.json())
    return data
}

export default async function ViewSupervisorPdfPage({ params }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const feedback = await fetchFeedback(+id)
    const resultadoEvaluacion: ResultadoEvaluacion = JSON.parse(feedback.resultadoEvaluacion)
    return (
        <div className="mx-auto w-full max-w-6xl space-y-4 pb-6">
            <Link href={"/dashboard/feedback/supervisores"} className="flex flex-row mb-2 text-gray-500">
                <ArrowLeft size={13} className="self-center" />
                <p className="self-center text-xs">Volver a la pagina anterior</p>
            </Link>
            <div className="rounded-sm border border-zinc-200 p-6 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 dark:bg-zinc-900">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">Feedback supervisor</p>

                <div className="flex flex-row">
                    <h1 className="mt-2 text-2xl font-bold flex-1 tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">Detalle del feedback</h1>
                    <p className={`
                        self-center inline-flex items-center rounded-full border 
                        ${feedback.estadoFeedBack === "PUBLICADO" ? "border-green-400/70 bg-green-200 px-3 py-1 text-[11px] text-green-900 shadow-sm dark:border-green-500/50 dark:bg-green-400/20 dark:text-green-100"
                            : "border-gray-400/70 bg-gray-200 px-3 py-1 text-[11px] text-gray-900 shadow-sm dark:border-gray-500/50 dark:bg-gray-400/20 dark:text-gray-100"
                        }
                        font-semibold uppercase tracking-[0.18em] `}>
                        {feedback.estadoFeedBack}
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
                        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{feedback.USUARIO}</p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/60">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Tipo feedback</p>
                        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">Rutina</p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/60">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Periodo</p>
                        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{(new Date(feedback.periodo)).toLocaleDateString("es-ES", {month: "long", year: "numeric"}).toUpperCase()}</p>
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
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    {metric.unit === "S/" ? metric.unit : ""} 
                                    {resultadoEvaluacion[metric.key as keyof ResultadoEvaluacion]} 
                                    {metric.unit === "%" ? metric.unit : ""}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 grid space-y-2">
                        <div className="flex flex-col pt-2 border dark:bg-zinc-800 rounded-sm">
                            <p className="text-base font-semibold dark:text-zinc-100s p-2 mb-2 -mt-2 border-b-2">&nbsp;&nbsp; Analisis de resultados</p>
                            <p className="text-sm mx-2 mb-2 px-2 dark:text-zinc-100">
                                {feedback.analisisResultados}
                            </p>
                        </div>
                        <div className="flex flex-col border dark:bg-zinc-800 rounded-sm">
                            <p className="text-base font-semibold dark:text-zinc-100s p-2 mb-2 border-b-2">&nbsp;&nbsp;Compromiso de mejora</p>
                            <p className="text-sm mx-2 mb-2 px-2 dark:text-zinc-100">{feedback.compromisoMejora || "No disponible"}</p>
                        </div>
                    </div>
                </div>
                <SupervisorPdfActionsPanel 
                    compromisoMejora={feedback.compromisoMejora}
                    estadoFeedBack={feedback.estadoFeedBack}
                    idFeedback={feedback.idFeedBack}
                />
            </div>
        </div>
    );
}
