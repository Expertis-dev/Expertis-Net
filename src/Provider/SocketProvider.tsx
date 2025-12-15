"use client"
import { ReactNode } from "react";
import { SocketContext } from "@/Context/SocketContex";
import { useSocket } from "@/hooks/useSocket";
export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { socket, online } = useSocket("https://tb01wj9l-5000.brs.devtunnels.ms/");
    return (
        <SocketContext.Provider value={{ socket, online }}>
            {children}
        </SocketContext.Provider>
    );
};