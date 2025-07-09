
"use client"

import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Dummy data for the chart
const chartData = [
  { month: "Fev", novos: 15, renovacoes: 30, desistencias: 5 },
  { month: "Mar", novos: 20, renovacoes: 35, desistencias: 8 },
  { month: "Abr", novos: 18, renovacoes: 40, desistencias: 7 },
  { month: "Mai", novos: 25, renovacoes: 38, desistencias: 10 },
  { month: "Jun", novos: 22, renovacoes: 42, desistencias: 6 },
  { month: "Jul", novos: 30, renovacoes: 45, desistencias: 4 },
]

const chartConfig = {
  novos: {
    label: "Novos Alunos",
    color: "hsl(var(--chart-1))",
  },
  renovacoes: {
    label: "Renovações",
    color: "hsl(var(--chart-2))",
  },
  desistencias: {
    label: "Desistências",
    color: "hsl(var(--destructive))",
  },
}

export function MemberActivityChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
                top: 20,
                right: 20,
                left: 0,
            }}
        >
            <CartesianGrid vertical={false} />
            <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            />
            <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            />
            <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
            />
            <Legend />
            <Bar dataKey="novos" fill="var(--color-novos)" radius={4} />
            <Bar dataKey="renovacoes" fill="var(--color-renovacoes)" radius={4} />
            <Bar dataKey="desistencias" fill="var(--color-desistencias)" radius={4} />
        </BarChart>
    </ChartContainer>
  )
}
