"use client"

import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "January", members: 186 },
  { month: "February", members: 305 },
  { month: "March", members: 237 },
  { month: "April", members: 273 },
  { month: "May", members: 209 },
  { month: "June", members: 250 },
]

const chartConfig = {
  members: {
    label: "New Members",
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
