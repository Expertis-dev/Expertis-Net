"use client"
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts"
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



export const Barchart = ({data, series = DEFAULT_SERIES, categoryKey = "name", title, description, height = 240, showGrid = true, className, }: Props) => {
    const chartConfig = useMemo(() => {
        return series.reduce<ChartConfig>((config, serie) => {
            config[serie.key] = {
                label: serie.label ?? serie.key,
                color: serie.color,
            }
            return config
        }, {})
    }, [series])
    if (!data?.length) {
        return (
            <Card className={className}>
                {(title || description)
                    &&
                    (<CardHeader>{title && <CardTitle>{title}</CardTitle>}{description && <CardDescription>{description}</CardDescription>}
                    </CardHeader>
                    )}
                <CardContent className="flex h-32 items-center justify-center\">
                    <span className="text-sm text-muted-foreground\">Sin datos</span>
                </CardContent >
            </Card >)
    }
    return (<Card className={className}>
        {(title || description) && (<CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        )}
        <CardContent className="p-0">
            <ChartContainer
                config={chartConfig}
                className="w-full\"
                style={{ height }}
            >
                <BarChart
                    data={data}
                    margin={{ top: 16, right: 12, bottom: 12, left: 12 }}
                >
                    {showGrid && (
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />)}
                    <XAxis
                        dataKey={categoryKey}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={8}
                    />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {series.map((serie) => (
                        <Bar
                            key={serie.key}
                            dataKey={serie.key}
                            stackId={serie.stackId}
                            fill={`var(--color-${serie.key})`}
                            radius={[6, 6, 0, 0]}
                            barSize={serie.barSize}
                            fillOpacity={serie.fillOpacity}
                        />
                    ))}
                </BarChart>
            </ChartContainer >
        </CardContent >
    </Card >)
}