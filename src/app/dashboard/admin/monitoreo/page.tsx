"use client";

import { SocketContext } from "@/Context/SocketContex";
import { motion } from "framer-motion";
import { useContext, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ---- tipos: NUEVO (por dispositivo) ----
type Geo = { lat: number; lng: number } | null;

interface DeviceFromServer {
    usuario: string;
    deviceId: string;
    ip?: string;
    userAgent?: string;
    geo?: Geo;
    ultimaConexion: string | Date;
    tabCount?: number;
    tabs?: { socketId: string; ultConex: string | Date }[];
}

// ---- tipos: VIEJO (por pestaña) ----
interface TabFromServerLegacy {
    id: string;        // socketId
    nombre: string;    // usuario
    ultConex: string | Date;
}

interface Conexion {
    socketId: string;
    ultConex: string;
}

interface DispositivoUI {
    usuario: string;
    deviceId: string;      // si no existe, lo ponemos "unknown"
    ip?: string;
    userAgent?: string;
    geo?: Geo;
    conexiones: Conexion[]; // pestañas
    ultimaConexion: string;
}

// helpers
const toISO = (v: string | Date) => {
    const d = v instanceof Date ? v : new Date(v);
    if (Number.isNaN(d.getTime())) return String(v ?? "");
    return d.toISOString();
};

const normalizePayloadToDevices = (data: DeviceFromServer[]): DispositivoUI[] => {
    if (!Array.isArray(data)) return [];
    // Detectar si es formato nuevo (tiene "deviceId" o "tabs" o "usuario")
    const looksNew = data.some((x) => x && (x.deviceId || x.tabs || x.usuario));
    if (looksNew) {
        return (data as DeviceFromServer[]).map((d) => {
            const tabs = (d.tabs ?? []).map((t) => ({
                socketId: t.socketId,
                ultConex: toISO(t.ultConex),
            }));
            const conexiones = tabs.length ? tabs : [];
            return {
                usuario: d.usuario ?? "SIN_USUARIO",
                deviceId: d.deviceId ?? "unknown",
                ip: d.ip,
                userAgent: d.userAgent,
                geo: d.geo ?? null,
                conexiones,
                ultimaConexion: toISO(d.ultimaConexion),
            };
        }).sort((a, b) => new Date(b.ultimaConexion).getTime() - new Date(a.ultimaConexion).getTime());
    }

    // Formato viejo: agrupar por nombre (usuario)
    const map = new Map<string, DispositivoUI>();
    for (const u of data as unknown as TabFromServerLegacy[]) {
        const usuario = (u.nombre || "").trim();
        if (!usuario) continue;

        const key = usuario.toLowerCase();
        const existing = map.get(key);

        const conn: Conexion = { socketId: u.id, ultConex: toISO(u.ultConex) };

        if (!existing) {
            map.set(key, {
                usuario,
                deviceId: "unknown",
                conexiones: [conn],
                ultimaConexion: conn.ultConex,
            });
        } else {
            existing.conexiones.push(conn);
            if (new Date(conn.ultConex).getTime() > new Date(existing.ultimaConexion).getTime()) {
                existing.ultimaConexion = conn.ultConex;
            }
        }
    }

    return Array.from(map.values()).sort(
        (a, b) => new Date(b.ultimaConexion).getTime() - new Date(a.ultimaConexion).getTime()
    );
};
const formatPE = (iso: string) =>
    new Date(iso).toLocaleString("es-PE", { timeZone: "America/Lima" });
export default function MonitoreoUsuarios() {
    const { socket } = useContext(SocketContext);
    const [devices, setDevices] = useState<DispositivoUI[]>([]);
    const [q, setQ] = useState("");
    useEffect(() => {
        if (!socket) return;
        const handler = (payload: DeviceFromServer[]) => {
            console.log("lista-usuarios payload:", payload);
            const normalized = normalizePayloadToDevices(payload);
            console.log("normalized:", normalized);
            setDevices(normalized);
        };
        socket.on("lista-usuarios", handler);
        socket.emit("admin:get-users");
        return () => {
            socket.off("lista-usuarios", handler);
        };
    }, [socket]);
    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return devices;
        return devices.filter((d) =>
            d.usuario.toLowerCase().includes(term) ||
            (d.ip ?? "").toLowerCase().includes(term) ||
            d.deviceId.toLowerCase().includes(term)
        );
    }, [devices, q]);

    const totalTabs = useMemo(
        () => devices.reduce((acc, d) => acc + (d.conexiones?.length ?? 0), 0),
        [devices]
    );
    const cerrarDispositivo = (d: DispositivoUI) => {
        if (!socket) return;
        socket.emit("admin:disconnectDevice", { usuario: d.usuario, deviceId: d.deviceId });
    };
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>
                        <div>
                            <h1 className="text-3xl font-bold text-[#001529] dark:text-white mb-2">Monitoreo</h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                Dispositivos: {devices.length} • Pestañas: {totalTabs}
                            </p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar (usuario / IP )..." className="col-span-2 pr-10 w-full" />
                        <Button
                            onClick={() => setQ("")}
                            className="bg-slate-300 text-black/80 hover:bg-slate-400 dark:bg-neutral-700 dark:hover:bg-neutral-800 dark:text-white"
                        >
                            Limpiar
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Dispositivos ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Ubicacion</TableHead>
                                <TableHead>IP</TableHead>
                                <TableHead>Sistema</TableHead>
                                <TableHead>Pestañas</TableHead>
                                <TableHead>Última Conexión</TableHead>
                                <TableHead>Cerrar Sesión</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filtered.map((d) => (
                                <TableRow key={`${d.usuario}-${d.deviceId}-${d.ip ?? ""}`}>
                                    <TableCell>{d.usuario}</TableCell>
                                    <TableCell>
                                        {d.geo ? (
                                            <a
                                                href={`https://www.google.com/maps?q=${d.geo.lat},${d.geo.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {d.geo.lat}, {d.geo.lng}
                                            </a>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{d.ip}</TableCell>
                                    <TableCell className="font-mono text-xs">{d.userAgent}</TableCell>
                                    <TableCell>{d.conexiones.length}</TableCell>
                                    <TableCell>{formatPE(d.ultimaConexion)}</TableCell>
                                    <TableCell className="text-right flex justify-center gap-2">
                                        <Button variant="destructive" size="sm" onClick={() => cerrarDispositivo(d)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-slate-500">
                                        No hay dispositivos conectados
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </motion.div>
    );
}