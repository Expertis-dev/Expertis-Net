"use client"
import { Pie, PieChart as RechartsPieChart, Cell } from "recharts"
import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
type Series = {
    key: string
    label?: string
    color?: string
    stackId?: string
    barSize?: number
    fillOpacity?: number
}

interface Props {
    data: Array<Record<string, string | number | undefined | null>>
    series?: Series[]
    categoryKey?: string
    title?: string
    description?: string
    height?: number
    showGrid?: boolean
    className?: string
}
const DEFAULT_SERIES: Series[] = [{
    key: "value", label: "Valor",
    color: "var(--chart-1)",
}]

const PALETTE = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
]

const DUMMY_DATA: Array<Record<string, string | number>> = [
    { name: "Satisfactorio", value: 42 },
    { name: "Neutral", value: 28 },
    { name: "Insatisfecho", value: 16 },
    { name: "Sin respuesta", value: 14 },
]

const toSafeKey = (value: string, index: number, used: Set<string>) => {
    const base = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    const initial = base.length ? base : `slice-${index}`
    let key = initial
    let suffix = 1
    while (used.has(key)) {
        key = `${initial}-${suffix}`
        suffix += 1
    }
    used.add(key)
    return key
}

export const PieChart = ({
    data,
    series = DEFAULT_SERIES,
    categoryKey = "name",
    title,
    description,
    height = 240,
    // showGrid: _showGrid = true,
    className,
}: Props) => {
    const valueKey = series[0]?.key ?? "value"

    const chartData = useMemo(() => {
        const used = new Set<string>()
        const source = data?.length ? data : DUMMY_DATA
        return source.map((item, index) => {
            const rawLabel = item[categoryKey]
            const label = typeof rawLabel === "string" || typeof rawLabel === "number"
                ? String(rawLabel)
                : "Sin dato"
            const chartKey = toSafeKey(label, index, used)
            return {
                ...item,
                chartKey,
                label,
            }
        })
    }, [data, categoryKey])

    const chartConfig = useMemo(() => {
        return chartData.reduce<ChartConfig>((config, item, index) => {
            config[item.chartKey as string] = {
                label: item.label as string,
                color: PALETTE[index % PALETTE.length],
            }
            return config
        }, {})
    }, [chartData])

    return (<Card className={className}>
        {(title || description) && (<CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        )}
        <CardContent className="p-0">
            <ChartContainer
                config={chartConfig}
                className="w-full"
                style={{ height }}
            >
                <RechartsPieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="chartKey" labelKey="chartKey" />} />
                    <Pie
                        data={chartData}
                        dataKey={valueKey}
                        nameKey="chartKey"
                        outerRadius="80%"
                        strokeWidth={2}
                    >
                        {chartData.map((item) => (
                            <Cell key={item.chartKey as string} fill={`var(--color-${item.chartKey})`} />
                        ))}
                    </Pie>
                </RechartsPieChart>
            </ChartContainer >
        </CardContent >
    </Card >)
}
