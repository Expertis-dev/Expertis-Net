"use client"
import { ReactNode, useContext, useMemo, useState} from "react";
import { UserContext, User } from "../Context/UserContext";

// custom hook para consumir el contexto
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser debe usarse dentro de un UserProvider");
    }
    return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User>(() => {
        try {
            const storedUser = localStorage.getItem("user");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });
    const value = useMemo(() => ({ user, setUser }), [user]);
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};
