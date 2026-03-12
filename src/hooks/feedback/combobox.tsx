import { useEffect, useMemo, useRef, useState } from 'react'

type UseComboboxConfig<T> = {
    options: T[]
    getLabel?: (option: T) => string
    filterOption?: (option: T, query: string) => boolean
    initialQuery?: string
    initialOpen?: boolean
    closeOnSelect?: boolean
}

export const useCombobox = <T,>({
    options,
    getLabel,
    filterOption,
    initialQuery = '',
    initialOpen = false,
    closeOnSelect = true
}: UseComboboxConfig<T>) => {
    const [query, setQuery] = useState(initialQuery)
    const [isOpen, setIsOpen] = useState(initialOpen)
    const containerRef = useRef<HTMLDivElement | null>(null)

    const resolveLabel = (option: T) => {
        if (getLabel) return getLabel(option)
        return typeof option === 'string' ? option : String(option)
    }

    const filteredOptions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()
        if (!normalizedQuery) return options
        if (filterOption) {
            return options.filter((option) => filterOption(option, normalizedQuery))
        }
        return options.filter((option) =>
            resolveLabel(option).toLowerCase().includes(normalizedQuery)
        )
    }, [options, query, filterOption, getLabel])

    const selectOption = (option: T) => {
        setQuery(resolveLabel(option))
        if (closeOnSelect) setIsOpen(false)
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!containerRef.current) return
            if (!containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return {
        query,
        setQuery,
        isOpen,
        setIsOpen,
        options,
        filteredOptions,
        containerRef,
        getLabel: resolveLabel,
        selectOption,
    }
}
