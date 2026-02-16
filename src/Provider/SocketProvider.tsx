"use client"
import { ReactNode } from "react";
import { SocketContext } from "@/Context/SocketContex";
import { useSocket } from "@/hooks/useSocket";
export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { socket, online } = useSocket("https://z4l3lw2n-5000.brs.devtunnels.ms/");
    //const { socket, online } = useSocket("http://localhost:5000");
    return (
        <SocketContext.Provider value={{ socket, online }}>
            {children}
        </SocketContext.Provider>
    );
};