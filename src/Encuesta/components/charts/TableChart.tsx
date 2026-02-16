import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Dispatch, SetStateAction } from "react"

interface Props {
    firstColumnLabel: string
    totalPages: number, 
    sortDir: "desc" | "asc", 
    setSortDir: Dispatch<SetStateAction<"desc" | "asc">>, 
    setPage: Dispatch<SetStateAction<number>>, 
    rows:{value: string;count: number;}[],
    page: number
}

export const TableChart = ({ 
    firstColumnLabel, 
    totalPages, 
    sortDir, 
    setSortDir, 
    setPage, 
    rows,
    page,
}: Props) => {
    const safePage = Math.min(page, totalPages)
    return (
        <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Pagina {safePage} de {totalPages}</span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
                        className="rounded-md border px-2 py-1 text-foreground hover:bg-muted"
                    >
                        Orden: {sortDir === "desc" ? "Mayor a menor" : "Menor a mayor"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="rounded-md border px-2 py-1 text-foreground hover:bg-muted disabled:opacity-50"
                        disabled={safePage === 1}
                    >
                        Anterior
                    </button>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="rounded-md border px-2 py-1 text-foreground hover:bg-muted disabled:opacity-50"
                        disabled={safePage === totalPages}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{firstColumnLabel}</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
            </TableHeader>
            <TableBody>
                {rows.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                            Sin respuestas
                        </TableCell>
                    </TableRow>
                ) : (
                    rows.map((row) => (
                        <TableRow key={row.value}>
                            <TableCell className="whitespace-normal">{row.value}</TableCell>
                            <TableCell className="text-right">{row.count}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </>
    )
}
