"use client"
import { ReactNode } from "react";
import { SocketContext } from "@/Context/SocketContex";
import { useSocket } from "@/hooks/useSocket";
export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { socket, online } = useSocket("https://1q91g6w4-5000.brs.devtunnels.ms/");
    //const { socket, online } = useSocket("http://localhost:5000");
    return (
        <SocketContext.Provider value={{ socket, online }}>
            {children}
        </SocketContext.Provider>
    );
};