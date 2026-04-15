import { useState } from "react";
import { Calendar, Search } from "lucide-react";
import { motion } from "framer-motion";

// interface Props {
//     searchTerm: string;
//     setSearchTerm: (arg: string) => void;
//     startDate: string;
//     setStartDate: (arg: string) => void;
//     endDate: string;
//     setEndDate: (arg: string) => void;
// }

export const Filtro = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    return (
        <div className="p-6 ">
            <motion.section className="flex flex-col md:flex-row items-center gap-3 bg-card p-3 rounded-2xl border border-border shadow-sm">
                {/* Search Input */}
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar asesor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-muted/50 border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50 font-medium"
                    />
                </div>

                {/* Date Filters */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-xl border border-border flex-1 md:flex-initial">
                        <div className="flex items-center gap-1.5 px-2">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
                            />
                        </div>
                        <div className="w-px h-4 bg-border hidden md:block" />
                        <div className="flex items-center gap-1.5 px-2">
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};
