import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'
import React from 'react'

export const FiltersSupervisor = () => {
  return (
    <div className="flex flex-row md:flex-row items-center gap-2 border border-gray-200 px-2 mx-2 py-1 bg-white shadow">
      <div className="w-full md:w-auto flex flex-row flex-initial">
        <h2 className="self-center mr-2 font-light text-[14px]">Mes - Año: </h2>
        <input
          type="month"
          id="mes-anio"
          className="md:w-max bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-2.5 outline-none transition-all h-8"
        />
      </div>
      <hr className="border-gray-200 border h-10 w-0.5" />
      <div className="flex flex-row flex-initial">
        <h4 className="self-center mr-2 font-light text-[14px]">Estado:</h4>
        <div className="relative">
          <select
            className="w-44 h-10 border  border-slate-200 bg-gray-50 pl-3 pr-9 text-sm text-slate-700 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:bg-gray-50 appearance-none cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            <option value="rutina">Rutina</option>
            <option value="negativo">Negativo</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      <hr className="border-gray-200 border h-10 w-0.5" />
      <div className="flex-1">
        <div className="flex flex-row bg-gray-50 border">
          <SearchIcon className="self-center ml-2 mt-0.5" size={18} />
          <Input
            className="w-full bg-gray-50 border-0"
            placeholder="Buscar supervisor..."
          />
        </div>
      </div>
    </div>
  )
}
