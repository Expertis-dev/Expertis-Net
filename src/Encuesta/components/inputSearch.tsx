"use client"

import { useState } from "react";

export interface InputSearchValues {
    name: string;
    from: string;
    to: string;
}

interface InputSearchProps {
    onSearch: (values: InputSearchValues) => void;
}

export const InputSearch = ({ onSearch }: InputSearchProps) => {
    const [name, setName] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const handleSearch = () => {
        onSearch({ name, from, to });
    };
    
    return (
        <div className="w-full min-w-50 mt-3 flex flex-wrap items-end gap-2">
            <div className="relative flex-3 min-w-45">
                <input
                    className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 dark:text-gray-100 text-sm border border-slate-200 dark:border-gray-500 rounded-md pl-3 pr-28 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                    placeholder="Buscar encuestas..."
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
            </div>

            <div className="flex-1 min-w-35">
                <label className="block text-xs text-slate-500 mb-1">Desde</label>
                <input
                    type="date"
                    className="w-full bg-transparent text-slate-700 text-sm border dark:text-gray-100 border-slate-200 dark:border-gray-500 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                    value={from}
                    onChange={(event) => setFrom(event.target.value)}
                />
            </div>
            <div className="flex-1 min-w-35">
                <label className="block text-xs text-slate-500 mb-1">Hasta</label>
                <input
                    type="date"
                    className="w-full bg-transparent text-slate-700 text-sm border dark:text-gray-100 border-slate-200 dark:border-gray-500 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                    value={to}
                    onChangeCapture={handleSearch}
                    onChange={(event) => setTo(event.target.value)}
                />
            </div>
            <div className="flex-1 min-w-35">
                <button
                    className="flex items-center rounded dark:bg-zinc-600 bg-sky-500 py-2 px-10 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none hover:bg-blue-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none cursor-pointer"
                    type="button"
                    onClick={handleSearch}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
                        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                    </svg>

                    Search
                </button>
            </div>
        </div>
    )
}
