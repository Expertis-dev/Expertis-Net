"use client";
import { TimeComponent } from "@/components/seguimiento-asesor/escuchas/formulario/TimeComponent";
import { ValidationErrorModal } from "@/components/seguimiento-asesor/escuchas/formulario/ValidationErrorModal";
import { useColaboradores } from "@/hooks/useColaboradores";
import { AnimatePresence, motion } from "framer-motion";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Calendar,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Link2,
    MinusCircleIcon,
    Save,
    Timer,
    TimerReset,
    Users,
    Volume2Icon,
    X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { preguntas } from "./preguntas";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useUser } from "@/Provider/UserProvider";
import { getTurno, getTurnoFin } from "@/actions/escucha";

const criterios = Object.entries(Object.groupBy(preguntas, v => v.grupo)).map(v => v[0])
const minFormTime = 2 * 60;
const FALLBACK_ROUTE = "/dashboard/seguimiento-asesor/escuchas";

type AudioFormValues = {
    audioUrl: string;
    audioDate: string;
    audioDuration: string;
};

type FormAnswer = "SI" | "NO" | "NO APLICA";

const PURECLOUD_URL_REGEX =
    /^https:\/\/apps\.mypurecloud\.com\/directory\/#\/analytics\/interactions\/[0-9a-fA-F-]{36}\/.*$/;
const MINUTES_SECONDS_REGEX = /^\d+:[0-5]\d$/;

const DurationStringToSeconds = (duracion: string) => {
    const [min, seg] = duracion.split(":")
    
    return + seg + (+min)*60
}

const secondsToMinutesSeconds = (value: string) => {
    const totalSeconds = Number(value);
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

interface Audio {
    fecha: string;
    asesor: string;
    grupo: string;
    hora_inicio: string;
    hora_fin: string;
    duracion: string;
    tipo: string;
    url: string;
}

const dataAudiosPrueba: Audio[] = [
    {
        fecha: "2026-04-27",
        asesor: "FRANCO HUAMANI",
        grupo: "JORGE",
        hora_inicio: "9:01",
        hora_fin: "9:05",
        duracion: "180",
        tipo: "MCT",
        url: "https://apps.mypurecloud.com/directory/#/analytics/interactions/695d3118-4306-4021-89e5-0b3bff3d73a4/ad"
    },
    {
        fecha: "2026-04-26",
        asesor: "JIMENA MEDINA",
        grupo: "JORGE",
        hora_inicio: "13:01",
        hora_fin: "13:03",
        duracion: "120",
        tipo: "MCT",
        url: "https://apps.mypurecloud.com/directory/#/analytics/interactions/695d3118-4306-4021-89e5-0b3bff3d73a4/ad"
    },
]

export default function EscuchaFormularioPage() {
    const searchParams = useSearchParams()

    const { colaboradores, loading } = useColaboradores();
    const [currentAdvisorId, setCurrentAdvisorId] = useState<string>("");

    const [validationError, setValidationError] = useState<string | null>(null)
    const [form, setForm] = useState<Map<number, FormAnswer>>(new Map());
    const startTime = useRef(new Date());
    const [timer, setTimer] = useState(0);
    const [selectedCriterio, setSelectedCriterio] = useState<string>(criterios[0])
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTimeExpired, setIsTimeExpired] = useState(false);
    const [turnoFin, setTurnoFin] = useState<string | null>(null);
    const {user} = useUser()
    const hasTimedOutRef = useRef(false);
    const hasNavigatedRef = useRef(false);
    const submitEscuchaRef = useRef<((options?: { forceExit?: boolean }) => Promise<void>) | null>(null);
    const submitEscuchaInFlightRef = useRef(false);

    const [showExitConfirm, setShowExitConfirm] = useState(false)

    const [audioModal, setAudioModal] = useState<{isOpen: boolean, selectedAudio: Audio | undefined}>({
        isOpen: false,
        selectedAudio: undefined
    })

    const router = useRouter();
    const selectedAdvisor = colaboradores.find((a) => a.usuario === currentAdvisorId);
    const {
        register,
        formState: { errors },
        watch,
        getValues,
        getFieldState,
        trigger,
        setValue,
    } = useForm<AudioFormValues>({
        defaultValues: {
            audioUrl: "",
            audioDate: "",
            audioDuration: "",
        },
    });
    const audioUrlValue = watch("audioUrl");
    const isLocked = isSubmitting || isTimeExpired;
    const elapsedTime = timer;

    const parseTurnoFinDate = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        date.setMilliseconds(0);
        return date;
    };

    const navigateBack = () => {
        if (hasNavigatedRef.current) return;

        hasNavigatedRef.current = true;
        router.back();
        window.setTimeout(() => {
            router.replace(FALLBACK_ROUTE);
        }, 250);
    };

    const onInputChange = (idx: number, value: FormAnswer) => {
        if (isLocked) return;

        const newForm = new Map(form);

        newForm.set(idx, value);
        setForm(newForm);
    };

    const getAudioErrorMessage = () => {
        return (
            getFieldState("audioUrl").error?.message ||
            getFieldState("audioDate").error?.message ||
            getFieldState("audioDuration").error?.message ||
            "Completa correctamente los datos del audio."
        );
    };

    const submitEscucha = async ({ forceExit = false }: { forceExit?: boolean } = {}) => {
        if (submitEscuchaInFlightRef.current) return;
        submitEscuchaInFlightRef.current = true;

        try {
            setIsSubmitting(true);

            const audioFieldsAreValid = await trigger(["audioUrl", "audioDate", "audioDuration"]);

            if (!currentAdvisorId) {
                if (forceExit) {
                    toast.error("Tiempo agotado. No se guardo la escucha porque no se selecciono asesor.");
                    navigateBack();
                    return;
                }
                setValidationError("Selecciona un asesor");
                return;
            }

            if (elapsedTime <= minFormTime) {
                if (forceExit) {
                    toast.error("Tiempo agotado. No se guardo la escucha porque no cumplio el tiempo minimo.");
                    navigateBack();
                    return;
                }
                setValidationError("Tiempo minimo para responder el registro es de 2:00 minutos");
                return;
            }

            if (!audioFieldsAreValid) {
                const errorMessage = getAudioErrorMessage();
                if (forceExit) {
                    toast.error(`Tiempo agotado. ${errorMessage}`);
                    navigateBack();
                    return;
                }
                setValidationError(errorMessage);
                return;
            }

            if (form.values().toArray().length !== preguntas.length){
                setValidationError("Faltan completar campos de la evaluacion de escucha")
                if (forceExit) {
                    toast.error(`Tiempo agotado.`);
                    navigateBack();
                    return;
                }
                return;
            }

            const formatHora = (date: Date) => {
                return date.toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });
            }

            const formulario = preguntas.map((v, i) => ({criterio: v.criterio, respuesta: Object.fromEntries(form)[i] || null}))
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crear-escucha`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    id_rep: +searchParams.get('id_reporte')!,
                    turno: await getTurno(),
                    asesor: selectedAdvisor?.usuario || "",
                    supervisor: user?.usuario,
                    hora_inicio: formatHora(startTime.current),
                    hora_fin: formatHora(new Date()),
                    tiempo_duracion: timer,
                    formulario: JSON.stringify(formulario),
                    link_audio: getValues("audioUrl"),
                    fecha_audio: getValues("audioDate"),
                    duracion_audio: DurationStringToSeconds(getValues("audioDuration"))
                })
            });

            if (!response.ok) {
                throw new Error("No se pudo guardar la escucha");
            }

            toast.success("Escucha guardada");
            navigateBack();
        } catch {
            toast.error("Error al guardar la escucha");
            if (forceExit) {
                navigateBack();
            }
        } finally {
            setIsSubmitting(false);
            submitEscuchaInFlightRef.current = false;
        }
    };
    submitEscuchaRef.current = submitEscucha;

    useEffect(() => {
        if (isTimeExpired) return;

        const intervalKey = window.setInterval(() => {
            setTimer((currentTime) => currentTime + 1);
        }, 1000);

        return () => window.clearInterval(intervalKey);
    }, [isTimeExpired]);

    useEffect(() => {
        let mounted = true;

        const fetchTurnoFin = async () => {
            try {
                const turnoFinString = await getTurnoFin();
                if (!mounted) return;
                setTurnoFin(turnoFinString);
            } catch (error) {
                console.error("Error al obtener el fin del turno:", error);
            }
        };

        void fetchTurnoFin();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (isTimeExpired || !turnoFin) return;

        const endDate = parseTurnoFinDate(turnoFin);
        const millisecondsUntilEnd = endDate.getTime() - Date.now();

        if (millisecondsUntilEnd <= 0) {
            hasTimedOutRef.current = true;
            setIsTimeExpired(true);
            toast.info("Se acabó el turno permitido, cerrando formulario...");
            void submitEscuchaRef.current?.({ forceExit: true });
            return;
        }

        const timeoutId = window.setTimeout(() => {
            if (hasTimedOutRef.current) return;
            hasTimedOutRef.current = true;
            setIsTimeExpired(true);
            toast.info("Se acabó el turno permitido, cerrando formulario...");
            void submitEscuchaRef.current?.({ forceExit: true });
        }, millisecondsUntilEnd);

        return () => window.clearTimeout(timeoutId);
    }, [isTimeExpired, turnoFin]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm sticky -top-4 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowExitConfirm(true)}
                        className="p-2 hover:bg-muted cursor-pointer rounded-full transition-colors text-muted-foreground hover:text-foreground"
                        disabled={isLocked}
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
                                TURNO: 1
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
                            className={`w-5 h-5 text-primary`}
                        />
                        <span
                            className={`text-xl font-mono font-black text-foreground`}
                        >
                            {Math.trunc(timer / 60)}:{(timer % 60) < 10 ? `0${timer % 60}`: timer % 60}
                        </span>
                    </div>
                    <button
                        onClick={() => void submitEscucha()}
                        className="px-6 py-2 cursor-pointer bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={isLocked}
                    >
                        <Save className="w-4 h-4" />
                        {isSubmitting ? "Guardando..." : "Finalizar"}
                    </button>
                </div>
            </div>
            <div className="bg-card rounded-2xl border border-border px-4 pb-1.5 shadow-sm flex flex-col md:flex-row md:items-center gap-5">
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
                            disabled={loading || isLocked}
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
                                {selectedAdvisor?.usuario.split(" ")[0][0]}
                                {selectedAdvisor?.usuario.split(" ")[1]?.[0] ?? ""}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-tighter leading-none">
                                    SELECCIONADO
                                </p>
                                <h4 className="text-sm font-bold mt-0.5">
                                    {selectedAdvisor?.usuario.split(" ")[0]}{" "}
                                    {selectedAdvisor?.usuario.split(" ")[1]}
                                </h4>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="bg-card rounded-2xl border border-border px-3 py-2 shadow-sm flex flex-col md:flex-row md:items-center gap-2">
                <div className="flex-1 space-y-0.5">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">
                        Seleccionar Audio
                    </label>
                    <div className="px-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <p className="text-[10px] text-muted-foreground leading-tight">
                            Elige un audio desde la tabla para autocompletar URL, fecha y duracion.
                        </p>
                        <button
                            className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wide shadow-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={() => setAudioModal((prev) => ({...prev, isOpen: true}))}
                            disabled={isLocked}
                        >
                            <Volume2Icon className="w-3.5 h-3.5" />
                            Buscar Audio
                        </button>
                    </div>
                    {audioModal.selectedAudio && (
                        <div className="px-1">
                            <div className="mt-0.5 inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <p className="text-[9px] font-bold text-emerald-700 leading-tight">
                                    Audio seleccionado: {audioModal.selectedAudio.asesor} - {audioModal.selectedAudio.fecha}
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="px-1">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
                            <div className="space-y-0.5">
                                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider pl-1">
                                    URL de PureCloud
                                </label>
                                <div className="relative">
                                    <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <input
                                        type="url"
                                        placeholder="https://apps.mypurecloud.com/directory/#/analytics/interactions/..."
                                        {...register("audioUrl", {
                                            required: "Ingresa la URL del audio.",
                                            validate: (value) =>
                                                PURECLOUD_URL_REGEX.test(value.trim()) ||
                                                "La URL debe tener el formato de interaccion de PureCloud.",
                                        })}
                                        className={`w-full rounded-lg border bg-muted/40 pl-8.5 pr-3 py-2 text-xs font-medium outline-none transition-all placeholder:text-muted-foreground/50 ${errors.audioUrl ? "border-destructive ring-2 ring-destructive/15" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/15"}`}
                                        disabled={isLocked}
                                    />
                                </div>
                                {!!errors.audioUrl?.message ?
                                <p className={`text-[9px] leading-tight pl-1 ${errors.audioUrl ? "text-destructive" : "text-muted-foreground"}`}>
                                    {errors.audioUrl?.message}
                                </p>: <></>
                                }
                            </div>

                            <div className="space-y-0.5">
                                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider pl-1">
                                    Fecha de la escucha
                                </label>
                                <div className="relative">
                                    <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <input
                                        min={(() => {
                                            const ayerDate = new Date();
                                            ayerDate.setDate(ayerDate.getDate() - 1);
                                            const ayer = ayerDate.toISOString().split('T')[0];
                                            return ayer
                                        })()}
                                        max={(new Date()).toISOString().split('T')[0]}
                                        type="date"
                                        {...register("audioDate", {
                                            required: "Selecciona la fecha del audio.",
                                        })}
                                        className={`w-full rounded-lg border bg-muted/40 pl-8.5 pr-3 py-2 text-xs font-semibold outline-none transition-all ${errors.audioDate ? "border-destructive ring-2 ring-destructive/15" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/15"}`}
                                        disabled={isLocked}
                                    />
                                </div>
                                {!!errors.audioDate?.message ?
                                <p className={`text-[9px] leading-tight pl-1 ${errors.audioDate ? "text-destructive" : "text-muted-foreground"}`}>
                                    {errors.audioDate?.message}
                                </p>: <></>
                                }
                            </div>

                            <div className="space-y-0.5">
                                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider pl-1">
                                    Duracion
                                </label>
                                <div className="relative">
                                    <TimerReset className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="2:30"
                                        {...register("audioDuration", {
                                            required: "Ingresa la duracion del audio.",
                                            validate: (value) =>
                                                MINUTES_SECONDS_REGEX.test(value.trim()) ||
                                                "Usa el formato min:seg, por ejemplo 2:30.",
                                        })}
                                        className={`w-full rounded-lg border bg-muted/40 pl-8.5 pr-14 py-2 text-xs font-semibold outline-none transition-all ${errors.audioDuration ? "border-destructive ring-2 ring-destructive/15" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/15"}`}
                                        disabled={isLocked}
                                    />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                                        min:seg
                                    </span>
                                </div>
                                {!!errors.audioDuration?.message ?
                                <p className={`text-[9px] leading-tight pl-1 ${errors.audioDuration ? "text-destructive" : "text-muted-foreground"}`}>
                                    {errors.audioDuration?.message}
                                </p>: <></>
                                }
                            </div>
                        </div>
                        {audioUrlValue?.trim() && !errors.audioUrl ? (
                            <div className="mt-1.5 inline-flex max-w-full items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5">
                                <Volume2Icon className="w-3 h-3 text-emerald-600" />
                                <p className="text-[9px] text-emerald-700/90 truncate" title={audioUrlValue}>
                                    URL validada: {audioUrlValue}
                                </p>
                            </div>
                        ) : null}
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
            <div className="flex flex-wrap gap-2 my-2 mx-4">
                {
                    criterios.map((v) => {
                        const preguntasContestadas = preguntas.reduce((prev, curr, currI) => (Object.keys(Object.fromEntries(form)).filter((val) => +val === currI && curr.grupo === v).length) ? prev + 1 : prev, 0)
                        const totalPreguntas = preguntas.filter(p => p.grupo === v).length
                        return (
                        <div
                            key={v}
                            onClick={() => setSelectedCriterio(v)}
                            className={`
                                group flex items-center gap-3 px-2 py-1 border-2 transition-all duration-200 rounded-xl cursor-pointer text-sm
                                ${selectedCriterio === v 
                                ? "border-blue-500 bg-blue-50 shadow-sm  dark:bg-blue-900" 
                                : "border-transparent bg-gray-50 dark:bg-zinc-600 hover:bg-gray-100 text-gray-600"}
                            `}
                            >
                            {/* Texto del Criterio */}
                            <span className={`text-sm font-medium transition-colors ${selectedCriterio === v ? "text-blue-700 dark:text-blue-200" : "text-gray-700 dark:text-gray-300"}`}>
                                {v}
                            </span>

                            {/* Badge de Progreso */}
                            <div className={`
                                flex items-center px-2 py-0.5 rounded-lg text-xs font-bold border
                                ${preguntasContestadas === totalPreguntas 
                                ? "bg-green-100 dark:bg-green-500 border-green-200 dark:border-green-600 text-green-700 dark:text-green-100" 
                                : "bg-amber-100 dark:bg-orange-500/80 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-200"}
                            `}>
                                {preguntasContestadas === totalPreguntas ? (
                                    <Check size={15} className="dark:text-green-900"/>
                                ) : null}
                                {preguntasContestadas} / {totalPreguntas}
                            </div>
                        </div>
                    )})
                }
            </div>

            {/* Cuerpo del Formulario */}
            <div className="relative">
                {criterios.map((criterio, i, arr) => {
                if (criterio !== selectedCriterio) return null;
                return (
                    <div key={criterio} className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                    
                    {/* Título del Criterio Actual */}
                    <div className="px-6 py-1.5 bg-sky-50 dark:bg-sky-500/10 border-y border-sky-100 dark:border-sky-500/20 flex justify-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-400">
                        Sección: {criterio}
                        </span>
                    </div>

                    <div className="flex flex-row">
                        {/* Botón Navegación Izquierda */}
                        <button
                        onClick={() => setSelectedCriterio(arr[(i - 1 + arr.length) % arr.length])}
                        className="hover:border hover:border-blue-300 cursor-pointer flex-none w-12 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-sky-100 dark:hover:bg-sky-500/20 border-r border-zinc-200 dark:border-zinc-800 transition-all group"
                        disabled={isLocked}
                        >
                        <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:-translate-x-1 transition-transform" />
                        </button>

                        {/* Lista de Preguntas */}
                        <div className="flex-1 divide-y divide-zinc-100 dark:divide-zinc-800">
                        {preguntas.map((item, idx) => {
                            if (item.grupo !== criterio) return null;
                            const isSelectedSi = form.get(idx) === "SI";
                            const isSelectedNo = form.get(idx) === "NO";
                            const isSelectedNoAplica = form.get(idx) === "NO APLICA";

                            return (
                            <div key={idx} className="py-2 px-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors border-b border-zinc-200 dark:border-zinc-700">
                                <div className="flex flex-row lg:flex-row justify-between gap-6">
                                <div className="space-y-1.5">
                                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-snug">
                                    {item.criterio}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-4xl">
                                    {item.descripcion}
                                    </p>
                                </div>

                                {/* Selectores SI/NO */}
                                <div className="flex items-center gap-4 lg:self-center self-center">
                                    {/* Botón SI */}
                                    <label className={`relative flex flex-col items-center gap-1.5 group ${isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                                    <input
                                        type="radio"
                                        name={`item-${idx}`}
                                        className="hidden peer"
                                        onChange={() => onInputChange(idx, "SI")}
                                        checked={isSelectedSi}
                                        disabled={isLocked}
                                    />
                                    <div className="w-12 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-transparent peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-500/10 transition-all shadow-sm group-hover:scale-105 active:scale-95">
                                        <Check className={`w-6 h-6 ${isSelectedSi ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-600'}`} />
                                    </div>
                                    {/* <span className={`text-[10px] font-bold uppercase ${isSelectedSi ? 'text-emerald-600' : 'text-zinc-500'}`}>Sí</span> */}
                                    </label>

                                    {/* Botón NO */}
                                    <label className={`relative flex flex-col items-center gap-1.5 group ${isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                                    <input
                                        type="radio"
                                        name={`item-${idx}`}
                                        className="hidden peer"
                                        onChange={() => onInputChange(idx, "NO")}
                                        checked={isSelectedNo}
                                        disabled={isLocked}
                                    />
                                    <div className="w-12 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-transparent peer-checked:border-red-500 peer-checked:bg-red-50 dark:peer-checked:bg-red-500/10 transition-all shadow-sm group-hover:scale-105 active:scale-95">
                                        <X className={`w-6 h-6 ${isSelectedNo ? 'text-red-600 dark:text-red-400' : 'text-zinc-400 dark:text-zinc-600'}`} />
                                    </div>
                                    {/* <span className={`text-[10px] font-bold uppercase ${isSelectedNo ? 'text-red-600' : 'text-zinc-500'}`}>No</span> */}
                                    </label>
                                    {/* Botón No Aplica */}
                                    <label className={`relative flex flex-col items-center gap-1.5 group ${isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                                    <input
                                        type="radio"
                                        name={`item-${idx}`}
                                        className="hidden peer"
                                        onChange={() => onInputChange(idx, "NO APLICA")}
                                        checked={isSelectedNoAplica}
                                        disabled={isLocked}
                                    />
                                    <div className="w-12 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-transparent peer-checked:border-amber-500 peer-checked:bg-amber-50 dark:peer-checked:bg-amber-500/10 transition-all shadow-sm group-hover:scale-105 active:scale-95">
                                        <MinusCircleIcon className={`w-6 h-6 ${isSelectedNoAplica ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400 dark:text-zinc-600'}`} />
                                    </div>
                                    {/* <span className={`text-[10px] font-bold uppercase ${isSelectedNoAplica ? 'text-amber-600' : 'text-zinc-500'}`}>No aplica</span> */}
                                    </label>
                                </div>
                                </div>
                            </div>
                            );
                        })}
                        </div>

                        {/* Botón Navegación Derecha */}
                        <button
                        onClick={() => setSelectedCriterio(arr[(i + 1) % arr.length])}
                        className="hover:border hover:border-blue-300 cursor-pointer flex-none w-12 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-sky-100 dark:hover:bg-sky-500/20 border-l border-zinc-200 dark:border-zinc-800 transition-all group"
                        disabled={isLocked}
                        >
                        <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                    </div>
                );
                })}
            </div>
            </div>
            <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border p-6 rounded-3xl shadow-2xl max-w-sm w-full relative z-10 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold italic">¿Deseas salir?</h3>
              <p className="text-sm text-muted-foreground">Se perderán todos los datos registrados en el formulario actual.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-2.5 bg-muted font-bold rounded-xl border border-border cursor-pointer">Continuar</button>
                <button onClick={() => {setShowExitConfirm(false); router.back()}} className="flex-1 py-2.5 bg-destructive text-white font-bold rounded-xl shadow-lg cursor-pointer">Sí, Salir</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {
            audioModal.isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-card border border-border p-6 rounded-3xl shadow-2xl max-w-6xl w-full relative z-10 space-y-4"
                    >
                        <div className="flex justify-between items-center gap-3">
                            <h3 className="text-base font-black uppercase text-muted-foreground tracking-wide">Seleccionar Audio</h3>
                            <button
                                onClick={() => setAudioModal((prev) => ({...prev, isOpen: false}))}
                                className="px-4 py-2 text-sm bg-muted font-bold rounded-xl border border-border cursor-pointer"
                            >
                                Salir
                            </button>
                        </div>
                        <div className="overflow-x-auto border border-border rounded-2xl">
                            <table className="w-full min-w-[900px] text-sm">
                                <thead className="bg-muted/50">
                                    <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                                        <th className="px-3 py-2">Fecha</th>
                                        <th className="px-3 py-2">Asesor</th>
                                        <th className="px-3 py-2">Grupo</th>
                                        <th className="px-3 py-2">Inicio</th>
                                        <th className="px-3 py-2">Fin</th>
                                        <th className="px-3 py-2">Duracion</th>
                                        <th className="px-3 py-2">Tipo</th>
                                        <th className="px-3 py-2">URL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataAudiosPrueba.map((audio, index) => {
                                        const isSelected = audioModal.selectedAudio?.url === audio.url;
                                        return (
                                            <tr
                                                key={`${audio.url}-${index}`}
                                                className={`border-t border-border cursor-pointer transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-muted/40"}`}
                                                onClick={() => {
                                                    if (isLocked) return;
                                                    setValue("audioUrl", audio.url, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                                                    setValue("audioDate", audio.fecha, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                                                    setValue("audioDuration", secondsToMinutesSeconds(audio.duracion), { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                                                    setAudioModal({ isOpen: false, selectedAudio: audio });
                                                }}
                                            >
                                                <td className="px-3 py-2 font-semibold">{audio.fecha}</td>
                                                <td className="px-3 py-2">{audio.asesor}</td>
                                                <td className="px-3 py-2">{audio.grupo}</td>
                                                <td className="px-3 py-2">{audio.hora_inicio}</td>
                                                <td className="px-3 py-2">{audio.hora_fin}</td>
                                                <td className="px-3 py-2">{secondsToMinutesSeconds(audio.duracion)}</td>
                                                <td className="px-3 py-2">{audio.tipo}</td>
                                                <td className="px-3 py-2 max-w-[340px] truncate" title={audio.url}>{audio.url}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            )
        }
      </AnimatePresence>
            <ValidationErrorModal
                setValidationError={setValidationError}
                validationError={validationError}
            />
        </div>
    );
}
