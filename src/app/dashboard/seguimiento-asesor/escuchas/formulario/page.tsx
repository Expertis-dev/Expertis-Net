"use client";
import { TimeComponent } from "@/components/seguimiento-asesor/escuchas/formulario/TimeComponent";
import { ValidationErrorModal } from "@/components/seguimiento-asesor/escuchas/formulario/ValidationErrorModal";
import { Button } from "@/components/ui/button";
import { useColaboradores } from "@/hooks/useColaboradores";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    ArrowRightCircleIcon,
    Calendar,
    Check,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Save,
    Speaker,
    Timer,
    Users,
    Volume1Icon,
    Volume2Icon,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { preguntas } from "./preguntas";


const criterios = Object.entries(Object.groupBy(preguntas, v => v.grupo)).map(v => v[0])
const formTime = 10 * 60;
const minFormTime = 2.5 * 60;


export default function EscuchaFormularioPage() {
    const { colaboradores, loading } = useColaboradores();
    const [currentAdvisorId, setCurrentAdvisorId] = useState<string>();

    const [validationError, setValidationError] = useState<string | null>(null)
    const [form, setForm] = useState<Map<number, string>>(new Map());
    const startTime = useRef(new Date());
    const [timer, setTimer] = useState(formTime);
    const [selectedCriterio, setSelectedCriterio] = useState<string>(criterios[0])

    const router = useRouter();

    const onInputChange = (idx: number, value: string) => {
        const newForm = new Map(form);

        newForm.set(idx, value);
        // Object.fromEntries(
        //     Array.from(form.entries()).sort((a, b) => a[0] - b[0]),
        // )
        setForm(newForm);
    };

    useEffect(() => {
        const intervalKey = setInterval(() => {
            setTimer(timer - 1);
        }, 1000);
        if (timer === 0) {
            clearInterval(intervalKey);
            // Ejecutar envio de formulario
        }

        return () => clearInterval(intervalKey);
    }, [timer, setTimer]);

    const onFinishForm = () => {
        // Subir el formulario
        console.log(!!currentAdvisorId)
        if (!currentAdvisorId) {
            setValidationError("Selecciona un asesor")
            return;
        };
        if (formTime - timer <= minFormTime) {
            setValidationError("Tiempo minimo para responder el registro es de 2:30 minutos");
            return
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold">
                            Registro de Acompañamiento
                        </h2>
                        <div className="flex flex-wrap gap-2 mt-1">
                            <span className="px-2 py-1 bg-muted text-muted-foreground rounded-lg text-[9px] font-black border border-border flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" />
                                FECHA: {new Date().toLocaleDateString()}
                            </span>
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[9px] font-black border border-primary/20 uppercase">
                                "TURNO: 1"
                            </span>
                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[9px] font-black border border-emerald-500/20 flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                INICIO:{" "}
                                {startTime.current.toLocaleString("es-PE", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                })}
                            </span>
                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[9px] font-black border border-emerald-500/20 flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                HORA:{" "}
                                <TimeComponent/>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-muted/40 px-4 py-2 rounded-xl border border-border relative group">
                        <Timer
                            className={`w-5 h-5 ${timer < 0.3 * formTime ? "text-destructive animate-pulse" : "text-primary"}`}
                        />
                        <span
                            className={`text-xl font-mono font-black ${timer < 0.3 * formTime ? "text-destructive" : "text-foreground"}`}
                        >
                            {Math.trunc(timer / 60)}:{(timer % 60) < 10 ? `0${timer % 60}`: timer % 60}
                        </span>
                        {/* <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                            Mínimo requerido: 17:00
                        </div> */}
                    </div>
                    <button
                        onClick={() => onFinishForm()}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-md active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        Finalizar
                    </button>
                </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex-1 space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-muted-foreground tracking-widest pl-1">
                        Seleccionar Asesor
                    </label>
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <select
                            value={currentAdvisorId}
                            onChange={(e) =>
                                setCurrentAdvisorId(e.target.value)
                            }
                            className="w-full bg-muted border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 ring-primary transition-all outline-none appearance-none cursor-pointer font-semibold"
                            disabled={loading}
                        >
                            <option value="">
                                {loading
                                    ? "-- Cargando asesores... --"
                                    : "-- Buscar Asesor en el equipo --"}
                            </option>
                            {colaboradores.map((adv) => (
                                <option
                                    key={adv.idEmpleado}
                                    value={adv.usuario}
                                >
                                    {adv.usuario}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <AnimatePresence>
                    {currentAdvisorId && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-3 bg-primary/5 p-3 rounded-xl border border-primary/10 shadow-sm min-w-[200px]"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {colaboradores.find((a) => a.usuario === currentAdvisorId,)?.usuario.split(" ")[0][0]}
                                {colaboradores.find((a) => a.usuario === currentAdvisorId,)?.usuario.split(" ")[1][0]}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-tighter leading-none">
                                    SELECCIONADO
                                </p>
                                <h4 className="text-sm font-bold mt-0.5">
                                    {colaboradores.find((a) => a.usuario === currentAdvisorId,)?.usuario.split(" ")[0]}{" "}
                                    {colaboradores.find((a) => a.usuario === currentAdvisorId,)?.usuario.split(" ")[1]}
                                </h4>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex-1 space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-muted-foreground tracking-widest pl-1">
                        Seleccionar Audio
                    </label>
                    <div className="px-1">
                        <div className="flex flex-row gap-4">
                            <Volume2Icon className="w-4 h-4 text-muted-foreground self-center" />
                            <p>PONER AUDIO DE 2 MIN minimo AQUI</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-colors duration-300">
            {/* Header: Progreso */}
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Criterios de Evaluación
                </h3>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                    Progreso Total
                    </span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {(Object.keys(Object.fromEntries(form)).length / preguntas.length * 100).toFixed(1)}%
                    </span>
                </div>
                <div className="w-32 h-2.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(Object.keys(Object.fromEntries(form)).length / preguntas.length) * 100}%` }}
                    />
                </div>
                </div>
            </div>
            <div className="flex flex-row gap-2 mb-4 mx-4">
                {
                    criterios.map((v) => (
                        <div className={`px-2 py-1 border rounded-2xl cursor-pointer ${selectedCriterio === v ? "bg-blue-200 text-blue-800" : "bg-blue-50 text-blue-600"}`}
                            onClick={() => setSelectedCriterio(v)}
                        >
                            <p>{v}</p>
                        </div>
                    ))
                }
            </div>

            {/* Cuerpo del Formulario */}
            <div className="relative">
                {criterios.map((criterio, i, arr) => {
                if (criterio !== selectedCriterio) return null;
                return (
                    <div key={criterio} className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                    
                    {/* Título del Criterio Actual */}
                    <div className="px-6 py-3 bg-sky-50 dark:bg-sky-500/10 border-y border-sky-100 dark:border-sky-500/20 flex justify-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-400">
                        Sección: {criterio}
                        </span>
                    </div>

                    <div className="flex flex-row min-h-[400px]">
                        {/* Botón Navegación Izquierda */}
                        <button
                        onClick={() => setSelectedCriterio(i !== 0 ? arr[i - 1] : arr[0])}
                        className="flex-none w-12 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-sky-100 dark:hover:bg-sky-500/20 border-r border-zinc-200 dark:border-zinc-800 transition-all group"
                        >
                        <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:-translate-x-1 transition-transform" />
                        </button>

                        {/* Lista de Preguntas */}
                        <div className="flex-1 divide-y divide-zinc-100 dark:divide-zinc-800">
                        {preguntas.map((item, idx) => {
                            if (item.grupo !== criterio) return null;
                            const isSelectedSi = form.get(idx) === "SI";
                            const isSelectedNo = form.get(idx) === "NO";

                            return (
                            <div key={idx} className="p-6 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors">
                                <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="space-y-1.5">
                                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-snug">
                                    {item.criterio}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
                                    {item.descripcion}
                                    </p>
                                </div>

                                {/* Selectores SI/NO */}
                                <div className="flex items-center gap-4 self-end lg:self-center">
                                    {/* Botón SI */}
                                    <label className="relative flex flex-col items-center gap-1.5 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name={`item-${idx}`}
                                        className="hidden peer"
                                        onChange={() => onInputChange(idx, "SI")}
                                        checked={isSelectedSi}
                                    />
                                    <div className="w-14 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-transparent peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-500/10 transition-all shadow-sm group-hover:scale-105 active:scale-95">
                                        <Check className={`w-6 h-6 ${isSelectedSi ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-600'}`} />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase ${isSelectedSi ? 'text-emerald-600' : 'text-zinc-500'}`}>Sí</span>
                                    </label>

                                    {/* Botón NO */}
                                    <label className="relative flex flex-col items-center gap-1.5 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name={`item-${idx}`}
                                        className="hidden peer"
                                        onChange={() => onInputChange(idx, "NO")}
                                        checked={isSelectedNo}
                                    />
                                    <div className="w-14 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-transparent peer-checked:border-red-500 peer-checked:bg-red-50 dark:peer-checked:bg-red-500/10 transition-all shadow-sm group-hover:scale-105 active:scale-95">
                                        <X className={`w-6 h-6 ${isSelectedNo ? 'text-red-600 dark:text-red-400' : 'text-zinc-400 dark:text-zinc-600'}`} />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase ${isSelectedNo ? 'text-red-600' : 'text-zinc-500'}`}>No</span>
                                    </label>
                                </div>
                                </div>
                            </div>
                            );
                        })}
                        </div>

                        {/* Botón Navegación Derecha */}
                        <button
                        onClick={() => setSelectedCriterio(i !== (arr.length - 1) ? arr[i + 1] : arr[arr.length - 1])}
                        className="flex-none w-12 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-sky-100 dark:hover:bg-sky-500/20 border-l border-zinc-200 dark:border-zinc-800 transition-all group"
                        >
                        <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                    </div>
                );
                })}
            </div>
            </div>
            <ValidationErrorModal
                setValidationError={setValidationError}
                validationError={validationError}
            />
        </div>
    );
}
