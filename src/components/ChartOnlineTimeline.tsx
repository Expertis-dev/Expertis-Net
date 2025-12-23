"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { ChartCard } from "./ChartCard";

type Point = {
    ts: number;
    total: number;
    expertis: number;
    bpo: number;
};

const chartConfig = {
    total: { label: "Total", color: "var(--chart-1)" },
    expertis: { label: "Expertis", color: "var(--chart-2)" },
    bpo: { label: "BPO", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function ChartOnlineTimeline({
    total,
    expertis,
    bpo,
    maxPoints = 60,
    title = "Conectados en el tiempo",
    description = "Evolución del online (muestra local)",
}: {
    total: number;
    expertis: number;
    bpo: number;
    maxPoints?: number;
    title?: string;
    description?: string;
}) {
    const [data, setData] = React.useState<Point[]>([]);

    React.useEffect(() => {
        const p: Point = { ts: Date.now(), total, expertis, bpo };
        setData((prev) => {
            const next = [...prev, p];
            return next.length > maxPoints ? next.slice(next.length - maxPoints) : next;
        });
    }, [total, expertis, bpo, maxPoints]);

    return (
        <ChartCard title={title} description={description} className="!py-4 sm:py-0">
            <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
                <LineChart
                    accessibilityLayer
                    data={data}
                    margin={{ left: 12, right: 12 }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="ts"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={30}
                        tickFormatter={(v) =>
                            new Date(v).toLocaleTimeString("es-PE", { timeZone: "America/Lima", hour: "2-digit", minute: "2-digit" })
                        }
                    />
                    <ChartTooltip
                        content={
                            <ChartTooltipContent
                                labelFormatter={(v) =>
                                    new Date(v as number).toLocaleString("es-PE", { timeZone: "America/Lima" })
                                }
                            />
                        }
                    />
                    <Line dataKey="expertis" type="monotone" stroke="var(--color-expertis)" strokeWidth={2} dot={false} />
                    <Line dataKey="bpo" type="monotone" stroke="var(--color-total)" strokeWidth={2} dot={false} />
                </LineChart>
            </ChartContainer>
        </ChartCard>
    );
}
