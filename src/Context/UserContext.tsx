"use client"

import { createContext } from "react";

// Context/UserContext.ts
export type User = {
  idEmpleado: number;
  alias: string;
  cargo: string;
  idCargo: number;
  grupo: string;
  idGrupo: number;
  area: string;
  idArea: number;
  idJefe: number;
} | null;

type UserContextType = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};
export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});
