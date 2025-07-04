"use client"

import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "Janeiro", revenue: 38250 },
  { month: "Fevereiro", revenue: 41300 },
  { month: "Março", revenue: 42100 },
  { month: "Abril", revenue: 44500 },
  { month: "Maio", revenue: 43900 },
  { month: "Junho", revenue: 45231 },
]

const chartConfig = {
  revenue: {
    label: "Receita",
    color: "hsl(var(--primary))",
  },
}

export function RevenueChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis 
            tickFormatter={(value) => `R$ ${value / 1000}k`}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
