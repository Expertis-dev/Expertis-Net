"use client"
import { useCombobox } from "@/hooks/feedback/combobox"

const supervisorOptions = ['Sebastian Guzman', 'Gonzalo Navarro', 'Luis Paredes', 'Camila Rojas', 'Diego Salazar']

export const HeaderCrearFbSupervisor = () => {
    const {
        filteredOptions,
        isOpen,
        setIsOpen,
        setQuery,
        query,
        containerRef,
        selectOption
    } = useCombobox({ options: supervisorOptions })

    return (
        <>
            <div className="flex flex-row border border-gray-200 dark:border-gray-700 px-2 py-0.5 m-2 justify-around rounded-sm bg-white dark:bg-zinc-900">
                <div className="flex flex-col mb-0.5 flex-1 self-start">
                    <h3 className="text-gray-500 dark:text-gray-400 py-2 px-1 font-semibold">Supervisor</h3>
                    <div
                        ref={containerRef}
                        className="relative border border-gray-200 dark:border-gray-700 p-1 rounded-sm focus-within:ring-1 focus-within:ring-gray-300 dark:focus-within:ring-gray-600 bg-gray-50 dark:bg-zinc-800"
                    >
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value)
                                setIsOpen(true)
                            }}
                            onFocus={() => setIsOpen(true)}
                            placeholder="Selecciona un supervisor"
                            className="w-full bg-transparent text-sm px-1 py-1 rounded-sm outline-none text-zinc-900 dark:text-gray-100 dark:placeholder:text-zinc-400"
                        />
                        {isOpen && (
                            <div className="absolute left-0 right-0 z-20 mt-2 max-h-44 overflow-y-auto rounded-sm border border-gray-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((name) => (
                                        <button
                                            key={name}
                                            type="button"
                                            onClick={() => {
                                                selectOption(name)
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-gray-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                                        >
                                            {name}
                                        </button>
                                    ))
                                ) : (
                                    <p className="px-3 py-2 text-sm text-gray-500 dark:text-zinc-400">Sin resultados</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col p-1 mb-0.5 flex-1">
                    <h3 className="text-gray-500 dark:text-gray-400 py-2 px-1 font-semibold">Periodo</h3>
                    <div className="border border-gray-200 dark:border-gray-700 p-1 rounded-sm -mt-1 focus-within:ring-1 focus-within:ring-gray-300 dark:focus-within:ring-gray-600 bg-gray-50 dark:bg-zinc-800">
                        <input type="month" className="w-full bg-transparent text-sm px-1 py-1 rounded-sm outline-none text-zinc-900 dark:text-gray-100" />
                    </div>
                </div>
                <div className="flex flex-col mb-0.5 flex-initial"/>
            </div>
        </>
    )
}
