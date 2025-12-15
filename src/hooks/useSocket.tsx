"use client";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
export const useSocket = (serverUrl: string) => {
    const [online, setOnline] = useState(false);
    const socket: Socket = useMemo(() => {
        const socket = io(serverUrl, {
            path: "/socket.io",
            transports: ["websocket", "polling"],
        });
        return socket
    }, [serverUrl]);
    useEffect(() => {
        const onConnect = () => setOnline(true);
        const onDisconnect = () => setOnline(false);
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        setOnline(socket.connected);
        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.disconnect();
        };
    }, [socket]);
    return { socket, online };
};
