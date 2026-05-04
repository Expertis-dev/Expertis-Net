import { SocketContext } from "@/Context/SocketContex";
import { BellIcon } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export interface Notification {
    mensaje:     string;
    turnoId:     number;
    turnoNombre: string;
    turnoInicio: string;
}

export const BellButton = () => {
    const { socket } = useContext(SocketContext)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [toggleBell, setToggleBell] = useState(false)
    useEffect(() => {
        if (!socket) return;

        const onSombras = (a: Notification) => {
            setNotifications((prev) => [...prev, a]);
            toast.warning("Nueva notificacion de turno");
        }
        socket.on("cron:sombras", onSombras)
        return () => {
            socket.off("cron:sombras", onSombras);
        };
    }, [socket])

    const onClickBell = () => {
        setToggleBell(!toggleBell);
    }

    return (
        <div className="relative">
            <button
                className="cursor-pointer group relative h-9 w-9 grid place-items-center rounded-xl hover:bg-muted/70 transition-colors"
                onClick={onClickBell}
                type="button"
            >
                {notifications.length > 0 && (
                    <div className="absolute top-0.5 right-0.5 min-w-4 h-4 text-[9px] rounded-full border px-1 bg-red-500 border-red-400 grid place-items-center group-hover:bg-red-600 dark:bg-rose-500 dark:border-rose-400 dark:group-hover:bg-rose-400">
                        <p className="text-white leading-none font-bold">
                            {notifications.length > 99 ? "99+" : notifications.length}
                        </p>
                    </div>
                )}
                <BellIcon className="h-5 w-5 text-blue-500 dark:text-sky-300 group-hover:text-blue-600 dark:group-hover:text-sky-200" />
            </button>

            {toggleBell && (
                <div className="absolute right-0 top-11 w-80 rounded-2xl border border-border bg-background shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
                        <h3 className="text-sm font-bold">Notificaciones</h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                            {notifications.length}
                        </span>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                            No hay notificaciones por ahora
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                            {[...notifications].reverse().map((v, i) => (
                                <div
                                    className="rounded-xl border border-border bg-card px-3 py-2"
                                    key={`${v.turnoId}-${v.turnoInicio}-${i}`}
                                >
                                    <p className="text-xs font-semibold text-foreground">{v.mensaje}</p>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        {v.turnoNombre} - {v.turnoInicio}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
