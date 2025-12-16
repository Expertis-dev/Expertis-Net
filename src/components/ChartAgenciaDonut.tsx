"use client";

import * as React from "react";
import { Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { ChartCard } from "./ChartCard";

type Row = { agencia: "EXPERTIS" | "BPO" | "OTROS"; value: number };

const chartConfig = {
    EXPERTIS: { label: "Expertis", color: "var(--chart-1)" },
    BPO: { label: "BPO", color: "var(--chart-2)" },
    OTROS: { label: "Otros", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function ChartAgenciaDonut({
    devices,
    title = "Distribución por agencia",
    description = "Expertis vs BPO vs Otros",
}: {
    devices: { agencia?: string }[];
    title?: string;
    description?: string;
}) {
    const data = React.useMemo<Row[]>(() => {
        let expertis = 0, bpo = 0, otros = 0;
        for (const d of devices) {
            const a = (d.agencia ?? "").toUpperCase();
            if (a.startsWith("EXPERTIS")) expertis++;
            else if (a.startsWith("BPO")) bpo++;
            else otros++;
        }
        return [
            { agencia: "EXPERTIS", value: expertis },
            { agencia: "BPO", value: bpo },
            { agencia: "OTROS", value: otros },
        ];
    }, [devices]);

    return (
        <ChartCard title={title} description={description}>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[240px]">
                <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="agencia" />} />
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="agencia"
                        innerRadius={60}
                        outerRadius={90}
                        strokeWidth={6}
                        fill="var(--color-EXPERTIS)"
                    />
                </PieChart>
            </ChartContainer>
        </ChartCard>
    );
}
