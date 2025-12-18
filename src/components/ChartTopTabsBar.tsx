"use client";

import * as React from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    Cell, // ✅
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { ChartCard } from "./ChartCard";
type Item = { usuario: string; tabs: number; agencia: string | null };
const chartConfig = {
    expertis: { label: "Expertis", color: "var(--chart-2)" },
    bpo: { label: "BPO", color: "var(--chart-1)" },
} satisfies ChartConfig;
// ✅ decide el color según agencia
function colorPorAgencia(agencia: string | null) {
    const a = (agencia ?? "").toLowerCase();

    if (a.includes("expertis")) return "var(--color-expertis)";
    if (a.includes("bpo")) return "var(--color-bpo)";
    return "var(--color-total)"; // fallback
}

export function ChartTopTabsBar({
    devices,
    top = 10,
    title = "Top usuarios por pestañas",
    description = "Usuarios con más pestañas abiertas",
}: {
    devices: {
        usuario: string;
        agencia: string | null;
        conexiones: { socketId: string; ultConex: string }[];
    }[];
    top?: number;
    title?: string;
    description?: string;
}) {
    const data = React.useMemo<Item[]>(() => {
        return [...devices]
            .map((d) => ({
                usuario: d.usuario,
                tabs: d.conexiones?.length ?? 0,
                agencia: d.agencia,
            }))
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
                        tickFormatter={(v) => String(v).split(" ")[0]}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

                    {/* ✅ Color por barra usando Cell */}
                    <Bar dataKey="tabs" radius={6}>
                        {data.map((entry, idx) => (
                            <Cell
                                key={`${entry.usuario}-${idx}`}
                                fill={colorPorAgencia(entry.agencia)}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ChartContainer>
        </ChartCard>
    );
}
