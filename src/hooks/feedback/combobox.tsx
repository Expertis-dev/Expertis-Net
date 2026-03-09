import { useEffect, useMemo, useRef, useState } from 'react'

export const useCombobox = () => {
    const supervisorOptions = useMemo(
        () => ['Sebastian Guzman', 'Gonzalo Navarro', 'Luis Paredes', 'Camila Rojas', 'Diego Salazar'],
        []
    )
    const [supervisorQuery, setSupervisorQuery] = useState('')
    const [isSupervisorOpen, setIsSupervisorOpen] = useState(false)
    const supervisorRef = useRef<HTMLDivElement | null>(null)

    const filteredSupervisors = useMemo(() => {
        const query = supervisorQuery.trim().toLowerCase()
        if (!query) return supervisorOptions
        return supervisorOptions.filter((name) => name.toLowerCase().includes(query))
    }, [supervisorOptions, supervisorQuery])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!supervisorRef.current) return
            if (!supervisorRef.current.contains(event.target as Node)) {
                setIsSupervisorOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return {
        setSupervisorQuery,
        isSupervisorOpen,
        filteredSupervisors,
        supervisorRef,
        supervisorQuery,
        setIsSupervisorOpen
    }
}
