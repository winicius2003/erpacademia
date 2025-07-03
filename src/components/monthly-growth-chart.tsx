"use client"

import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "Janeiro", members: 186 },
  { month: "Fevereiro", members: 305 },
  { month: "Março", members: 237 },
  { month: "Abril", members: 273 },
  { month: "Maio", members: 209 },
  { month: "Junho", members: 250 },
]

const chartConfig = {
  members: {
    label: "Novos Membros",
    color: "hsl(var(--primary))",
  },
}

export function MonthlyGrowthChart() {
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
        <YAxis />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="members" fill="var(--color-members)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
