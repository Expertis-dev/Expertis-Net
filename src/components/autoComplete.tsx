import { Search } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { ArrayAsesores, Asesores } from "../types/Asesores"

interface EmployeeAutocompleteProps {
    employees: ArrayAsesores
    onSelect: (employee: Asesores | null) => void
}

export const AutoComplete = ({ employees, onSelect }: EmployeeAutocompleteProps) => {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const wrapperRef = useRef<HTMLDivElement>(null) 

    // Filtrar empleados
    const filteredEmployees = employees.filter((employee) => {
        const searchLower = searchTerm.toLowerCase()
        return (
            employee.usuario.toLowerCase().includes(searchLower) ||
            employee.dni?.toLowerCase().includes(searchLower) ||
            employee.grupo?.toLowerCase().includes(searchLower) ||
            employee.apellido1?.toLowerCase().includes(searchLower)
        )
    })

    const handleSelect = (employee: Asesores) => {
        setSearchTerm(employee.usuario) // 👈 puedes mostrar usuario o nombre
        onSelect(employee)
        setOpen(false)
    }

    // Detectar click fuera del wrapper completo
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])
    return (
        <div ref={wrapperRef} className="relative w-full">
            {/* Input */}
            <div className="flex items-center border rounded-md dark:bg-[#1b1a1a] ">
                <Input
                    placeholder="Buscar asesor..."
                    value={searchTerm}
                    onFocus={() => setOpen(true)}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setOpen(true)
                    }}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pl-8"
                />
                <Search className="absolute left-2 h-4 w-4 shrink-0 opacity-50" />
            </div>
            {/* Dropdown */}
            {open  && (
                <div className="absolute top-full left-0 w-full bg-neutral-50 dark:bg-neutral-800 border shadow-md rounded-md mt-1 z-50 max-h-60 overflow-auto">
                    {filteredEmployees.length === 0 ? (
                        <div className="py-3 text-center text-sm text-muted-foreground">
                            No se encontraron empleados
                        </div>
                    ) : (
                        filteredEmployees.map((employee) => (
                            <Button
                                key={employee.id}
                                variant="ghost"
                                className="w-full justify-start px-3 py-2 text-sm font-normal hover:bg-gray-100 dark:hover:bg-neutral-700"
                                onClick={() => handleSelect(employee)}
                            >
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">{employee.usuario}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {employee.dni} {employee.grupo && `• ${employee.grupo}`}
                                    </span>
                                </div>
                            </Button>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
