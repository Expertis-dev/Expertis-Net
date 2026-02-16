"use client"
import { createContext } from "react";
// Context/UserContext.ts
export type User = {
  apellido1: string;
  nombre: string;
  idEmpleado: number;
  usuario: string;
  cargo: string;
  id_cargo: number;
  grupo: string;
  id_grupo: number;
  area: string;
  idArea: number;
  idJefe: number;
  estado: number;
  dni: string
} | null;

type UserContextType = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};
export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});
