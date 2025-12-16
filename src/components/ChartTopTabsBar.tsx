"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { ChartCard } from "./ChartCard";

type Item = { usuario: string; tabs: number };

const chartConfig = {
    tabs: { label: "Pestañas", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ChartTopTabsBar({
    devices,
    top = 10,
    title = "Top usuarios por pestañas",
    description = "Usuarios con más pestañas abiertas",
}: {
    devices: { usuario: string; conexiones: { socketId: string; ultConex: string }[] }[];
    top?: number;
    title?: string;
    description?: string;
}) {
    const data = React.useMemo<Item[]>(() => {
        return [...devices]
            .map((d) => ({ usuario: d.usuario, tabs: d.conexiones?.length ?? 0 }))
            .sort((a, b) => b.tabs - a.tabs)
            .slice(0, top);
    }, [devices, top]);

    return (
        <ChartCard title={title} description={description}>
            <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
                <BarChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="usuario"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        interval={0}
                        tickFormatter={(v) => String(v).split(" ")[0]} // primer nombre para no saturar
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="tabs" fill="var(--color-tabs)" radius={6} />
                </BarChart>
            </ChartContainer>
        </ChartCard>
    );
}
