import { Pregunta, responseType } from "@/types/encuesta"
import { Barchart } from "../charts/Barchart"
import { useEffect, useMemo, useState } from "react"
import { TableChart } from "../charts/TableChart"
import { CardChart } from "../charts/CardChart"

type Responses = { [key: string]: string[] | string | boolean };

const PAGE_SIZE = 10;

const getQuestionValues = (pregunta: Pregunta, allResponses: Responses[]) => {
    const questionKey = String(pregunta.id);
    return allResponses
        .map((resp) => resp[questionKey])
        .filter((value) => value !== undefined && value !== null);
};

const toStringArray = (values: Array<string[] | string | boolean>) => {
    const flat: string[] = [];
    values.forEach((value) => {
        if (Array.isArray(value)) {
            value.forEach((item) => flat.push(String(item)));
            return;
        }
        if (typeof value === "boolean") {
            flat.push(value ? "Si" : "No");
            return;
        }
        flat.push(String(value));
    });
    return flat;
};

const toFrequencyTable = (values: string[]) => {
    const counts = new Map<string, number>();
    values.forEach((value) => {
        const normalized = value.trim();
        if (!normalized) return;
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
    return Array.from(counts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
};

const normalizeDateLabel = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().split("T")[0];
};

const normalizeData = (
    pregunta: Pregunta,
    allResponses: Responses[]
) => {
    if (!pregunta.options) return [];

    const questionKey = String(pregunta.id);

    return pregunta.options.map((option) => {
        let count = 0;

        allResponses.forEach((resp) => {
            const value = resp[questionKey];
            if (!value) return;

            if (Array.isArray(value)) {
                if (value.includes(String(option.value))) count++;
            } else if (typeof value === "string") {
                if (value === String(option.value)) count++;
            }
        });

        return {
            name: option.label,
            value: count,
        };
    });
};



interface Props {
    pregunta: Pregunta;
    responses: Responses[]
}

export const StatisticsCharts = ({ pregunta, responses }: Props) => {
    const data = useMemo(() => normalizeData(pregunta, responses), [pregunta, responses])
    const rawValues = useMemo(() => getQuestionValues(pregunta, responses), [pregunta, responses])
    const [sortDir, setSortDir] = useState<"desc" | "asc">("desc")
    const [page, setPage] = useState(1)

    useEffect(() => {
        setPage(1)
    }, [pregunta._id])

    const tableConfig = useMemo(() => {
        if (pregunta.responseType === responseType.TEXT_LINE || pregunta.responseType === responseType.TEXT_AREA) {
            return {
                label: "Respuesta",
                rows: toFrequencyTable(toStringArray(rawValues)),
            }
        }
        if (pregunta.responseType === responseType.DATE) {
            return {
                label: "Fecha",
                rows: toFrequencyTable(toStringArray(rawValues).map((value) => normalizeDateLabel(value))),
            }
        }
        if (pregunta.responseType === responseType.BOOLEAN) {
            return {
                label: "Respuesta",
                rows: toFrequencyTable(toStringArray(rawValues)),
            }
        }
        return null
    }, [pregunta.responseType, rawValues])

    const sortedRows = useMemo(() => {
        if (!tableConfig) return []
        return [...tableConfig.rows].sort((a, b) => {
            if (sortDir === "desc") {
                return b.count - a.count || a.value.localeCompare(b.value)
            }
            return a.count - b.count || a.value.localeCompare(b.value)
        })
    }, [tableConfig, sortDir])

    const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE))
    const safePage = Math.min(page, totalPages)

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages)
        }
    }, [page, totalPages])

    const pagedRows = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE
        return sortedRows.slice(start, start + PAGE_SIZE)
    }, [safePage, sortedRows])


    if (pregunta.responseType === responseType.TEXT_LINE || pregunta.responseType === responseType.TEXT_AREA) {
        return (
            <CardChart
                title={pregunta.content}
            >
                <TableChart
                    firstColumnLabel="Respuesta"
                    page={safePage}
                    setPage={setPage}
                    setSortDir={setSortDir}
                    sortDir={sortDir}
                    rows={pagedRows}
                    totalPages={totalPages}
                />
            </CardChart>
        )
    }

    if (pregunta.responseType === responseType.DATE) {
        return (
            <CardChart
                title={pregunta.content}
            >
                <TableChart
                    firstColumnLabel="Fecha"
                    page={safePage}
                    setPage={setPage}
                    setSortDir={setSortDir}
                    sortDir={sortDir}
                    rows={pagedRows}
                    totalPages={totalPages}
                />
            </CardChart>

        )
    }

    if (pregunta.responseType === responseType.BOOLEAN) {
        const chartData = (tableConfig?.rows ?? []).map((row) => ({ name: row.value, value: row.count }))
        return (
            <div key={pregunta._id} className="flex w-full max-w-130 flex-col gap-4">
                <Barchart data={chartData} title={pregunta.content} className="w-full" />
                <CardChart title="Detalle">
                    <TableChart
                        firstColumnLabel="Respuesta"
                        page={safePage}
                        setPage={setPage}
                        setSortDir={setSortDir}
                        sortDir={sortDir}
                        rows={pagedRows}
                        totalPages={totalPages}
                    />
                </CardChart>
            </div>
        )
    }
    return (
        <div key={pregunta._id} className="flex w-full max-w-130 flex-col">
            <Barchart data={data} title={pregunta.content} className="w-full" />
        </div>
    )
}

