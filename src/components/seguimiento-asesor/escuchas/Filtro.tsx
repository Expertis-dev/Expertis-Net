import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { Calendar, Search } from "lucide-react";
import { motion } from "framer-motion";

export interface Filters {
    searchTerm: string;
    startDate: string;
    endDate: string;
}

interface Props {
    filters: Filters;
    setFilters: Dispatch<SetStateAction<Filters>>
;
}

export const Filtro = ({filters, setFilters}: Props) => {
    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        })
    }
    return (
        <div className="p-3 md:p-4">
            <motion.section className="flex flex-col md:flex-row items-center gap-2 bg-card p-2 rounded-xl border border-border shadow-sm">
                {/* Search Input */}
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar asesor..."
                        name="searchTerm"
                        value={filters.searchTerm}
                        onChange={onChange}
                        className="w-full bg-muted/50 border-border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-1 ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50 font-medium"
                    />
                </div>

                {/* Date Filters */}
                <div className="w-full md:w-auto">
                    <div className="flex w-full min-w-0 flex-col md:flex-row md:items-center gap-1.5 bg-muted/50 p-1 rounded-lg border border-border md:w-auto">
                        <div className="relative min-w-0 flex-1 md:w-[150px]">
                            <input
                                type="date"
                                value={filters.startDate}
                                name="startDate"
                                onChange={onChange}
                                className="w-full min-w-0 bg-transparent pl-2 pr-1.5 py-1 text-[11px] font-bold outline-none cursor-pointer"
                            />
                        </div>
                        <div className="h-px w-full bg-border md:hidden" />
                        <div className="w-px h-4 bg-border hidden md:block" />
                        <div className="relative min-w-0 flex-1 md:w-[150px]">
                            <input
                                type="date"
                                value={filters.endDate}
                                name="endDate"
                                onChange={onChange}
                                className="w-full min-w-0 bg-transparent pl-2 pr-1.5 py-1 text-[11px] font-bold outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};
