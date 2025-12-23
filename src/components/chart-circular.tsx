"use client";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";

type Props = {
    fecha?: string;
    vistas?: number;   // total
    bpo?: number;      // parte BPO
    expertis?: number; // parte Expertis
    footerText?: string;
};

export function ChartRadialShape({
    vistas = 0,
    bpo = 0,
    expertis = 0,
}: Props) {
    const total = Number.isFinite(vistas) && vistas > 0 ? vistas : (bpo + expertis);

    const chartData = [
        {
            name: "Vistas",
            bpo,
            expertis,
        },
    ];

    const chartConfig = {
        bpo: { label: "BPO", color: "var(--chart-1)" },
        expertis: { label: "Expertis", color: "var(--chart-2)" },
    } satisfies ChartConfig;
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="space-y-1">
                    <CardTitle>Distribución por agencia</CardTitle>
                    <CardDescription>Expertis vs BPO</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square w-full max-w-[250px]"
                >
                    <RadialBarChart
                        data={chartData}
                        startAngle={90}
                        endAngle={-270}   // 👈 círculo completo
                        innerRadius={80}
                        outerRadius={130}
                    >
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                            <Label
                                content={({ viewBox }) => {
                                    if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                                    const cx = viewBox.cx as number;
                                    const cy = viewBox.cy as number;

                                    return (
                                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                                            <tspan x={cx} y={cy - 10} className="fill-foreground text-2xl font-bold">
                                                {total.toLocaleString()}
                                            </tspan>
                                            <tspan x={cx} y={cy + 12} className="fill-muted-foreground">
                                                Vistas
                                            </tspan>
                                        </text>
                                    );
                                }}
                            />
                        </PolarRadiusAxis>
                        <RadialBar
                            dataKey="bpo"
                            stackId="a"
                            cornerRadius={8}
                            fill="var(--chart-1)"
                            className="stroke-transparent stroke-2"
                        />
                        <RadialBar
                            dataKey="expertis"
                            stackId="a"
                            cornerRadius={8}
                            fill="var(--chart-2)"
                            className="stroke-transparent stroke-2"
                        />
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
