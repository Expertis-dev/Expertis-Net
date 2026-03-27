"use client"

import { useUser } from "@/Provider/UserProvider"
import { useRouter } from "next/navigation"
import { useRef } from "react"

interface Props {
    esSupervisor?: boolean
    fechaDefault: string
}


export const FilterHistorialAsesor = ({ esSupervisor = false, fechaDefault }: Props) => {
    const toMonthValue = (value: string) => {
        if (!value) return ""
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return ""
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, "0")
        return `${year}-${month}`
    }

    const {user} = useUser()
    const inputMonthRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    
    const onChange = () => {
        console.log(inputMonthRef.current?.value)
        const searchParams = new URLSearchParams()
        if (!!inputMonthRef.current?.value){
            searchParams.append("filtroMes", inputMonthRef.current?.value)
            router.push(`/dashboard/feedback/${esSupervisor ? "historialSupervisores" : "historialAsesores"}/${user?.idEmpleado}?${searchParams.toString()}`)
        }else{
            router.push(`/dashboard/feedback/${esSupervisor ? "historialSupervisores" : "historialAsesores"}/${user?.idEmpleado}`)
        }
    }

    return (
        <div className="flex flex-row items-center justify-between gap-2 border border-gray-200 dark:border-zinc-700 px-4 mx-2 bg-white shadow-sm dark:bg-zinc-800 rounded-sm">
            <div className="flex items-center gap-3">
                {/* Un pequeño icono opcional le da un toque premium */}
                <div className="p-2 bg-indigo-50 rounded-lg dark:bg-black">
                    <svg className="w-5 h-5 text-blue-400 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-none">Selección de Período</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">Filtrar evaluaciones por mes</p>
                </div>
            </div>

            <div className="w-full sm:w-auto flex items-center gap-2">
                <label htmlFor="mes-anio" className="hidden lg:block text-sm text-gray-500 dark:text-gray-100">
                    Mes y año:
                </label>
                <input
                    ref={inputMonthRef}
                    type="month"
                    id="mes-anio"
                    className="w-full rounded-sm dark:bg-zinc-500 dark:text-gray-200 dark:border-zinc-700 sm:w-64 bg-gray-50 border border-gray-200 text-gray-800 text-sm px-4 py-2 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 my-2 transition-all cursor-pointer font-medium"
                    onChange={onChange}
                    defaultValue={toMonthValue(fechaDefault)}
                />
            </div>
        </div>
    )
}
