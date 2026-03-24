import { motion, AnimatePresence } from "framer-motion";
import { X, User, Building2, Calendar, Clock, AlarmClock, LogIn, LogOut } from "lucide-react";
import type { Incidencia } from "@/types/Incidencias";

interface DetailIncidenciaModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly incidencia: Incidencia | null;
}

const formatMinutes = (min: number) => {
  if (!min || min === 0) return "0 min";
  if (min >= 60) return `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}min`;
  return `${min} min`;
};

export function DetailIncidenciaModal({ isOpen, onClose, incidencia }: DetailIncidenciaModalProps) {
  if (!incidencia) return null;

  const esTardanza = incidencia.esTardanza === 1;
  const esFalta = incidencia.esFalta === 1;
  const justificado = incidencia.hayJustificacion === 1;

  const tipoBadge = esTardanza
    ? { label: "TARDANZA", bg: "bg-orange-100 text-orange-700 dark:bg-orange-400/20 dark:text-orange-300" }
    : esFalta
      ? { label: "FALTA", bg: "bg-red-100 text-red-700 dark:bg-red-400/20 dark:text-red-300" }
      : { label: "OTRO", bg: "bg-gray-100 text-gray-600" };

  const estadoBadge = justificado
    ? { label: "JUSTIFICADO", bg: "bg-green-100 text-green-700 dark:bg-green-400/20 dark:text-green-300" }
    : { label: "DETECTADA", bg: "bg-orange-100 text-orange-700 dark:bg-orange-400/20 dark:text-orange-300" };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.35 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            {/* Card principal */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-700 bg-gradient-to-r from-slate-50 to-white dark:from-zinc-800 dark:to-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-400/20">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Detalle de incidencia</p>
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">{incidencia.alias}</h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-700 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Badges tipo + estado */}
              <div className="flex gap-2 px-6 pt-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${tipoBadge.bg}`}>
                  {tipoBadge.label}
                </span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${estadoBadge.bg}`}>
                  {estadoBadge.label}
                </span>
              </div>

              {/* Datos generales — grid de cards */}
              <div className="px-6 py-4 grid grid-cols-2 gap-3">

                {/* Agencia */}
                <div className="col-span-2 flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-zinc-800 px-4 py-3">
                  <Building2 className="h-4 w-4 shrink-0 text-blue-500" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">Agencia</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{incidencia.agencia}</p>
                  </div>
                </div>

                {/* Fecha */}
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-zinc-800 px-4 py-3">
                  <Calendar className="h-4 w-4 shrink-0 text-violet-500" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">Fecha</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{incidencia.fecha}</p>
                  </div>
                </div>

                {/* Horario */}
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-zinc-800 px-4 py-3">
                  <Clock className="h-4 w-4 shrink-0 text-indigo-500" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">Horario</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{incidencia.horario}</p>
                  </div>
                </div>

                {/* Hora ingreso */}
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-zinc-800 px-4 py-3">
                  <LogIn className="h-4 w-4 shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">Hora ingreso</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{incidencia.horaIngreso ?? "—"}</p>
                  </div>
                </div>

                {/* Hora salida */}
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-zinc-800 px-4 py-3">
                  <LogOut className="h-4 w-4 shrink-0 text-rose-400" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">Hora salida</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{incidencia.horaSalida ?? "—"}</p>
                  </div>
                </div>

                {/* Minutos tardanza — solo si es tardanza */}
                {esTardanza && (
                  <div className="col-span-2 flex items-center gap-3 rounded-xl bg-orange-50 dark:bg-orange-400/10 border border-orange-100 dark:border-orange-400/20 px-4 py-3">
                    <AlarmClock className="h-4 w-4 shrink-0 text-orange-500" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-orange-400 font-semibold">Minutos de tardanza</p>
                      <p className="text-sm font-bold text-orange-600 dark:text-orange-300">
                        {formatMinutes(incidencia.minutosTardanza)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Fecha inicio gestión */}
                <div className="col-span-2 flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-zinc-800 px-4 py-3">
                  <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">Inicio gestión</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{incidencia.fechaInicioGestion}</p>
                    </div>
                    {incidencia.fechaFinGestion && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">Fin gestión</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{incidencia.fechaFinGestion}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="flex justify-end px-6 pb-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-200 transition-colors"
                >
                  Cerrar
                </button>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
