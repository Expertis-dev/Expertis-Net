export const FilterHistorialAsesor = () => {
    return (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">
            <div className="flex items-center gap-3">
                {/* Un pequeño icono opcional le da un toque premium */}
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-sm font-bold text-gray-800 leading-none">Selección de Período</h2>
                    <p className="text-xs text-gray-500 mt-1">Filtrar evaluaciones por mes</p>
                </div>
            </div>

            <div className="w-full sm:w-auto flex items-center gap-2">
                <label htmlFor="mes-anio" className="hidden lg:block text-sm text-gray-500">
                    Mes y año:
                </label>
                <input
                    type="month"
                    id="mes-anio"
                    className="w-full sm:w-64 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer font-medium"
                />
            </div>
        </div>
    )
}
