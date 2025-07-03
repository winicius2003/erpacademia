"use client"

import { Line, LineChart, XAxis, YAxis, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
    { day: "Seg", checkins: 222 },
    { day: "Ter", checkins: 289 },
    { day: "Qua", checkins: 237 },
    { day: "Qui", checkins: 173 },
    { day: "Sex", checkins: 209 },
    { day: "Sáb", checkins: 310 },
    { day: "Dom", checkins: 180 },
]

const chartConfig = {
  checkins: {
    label: "Check-ins",
    color: "hsl(var(--accent))",
  },
}

export function DailyPresenceChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickCount={6}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Line
          dataKey="checkins"
          type="natural"
          stroke="var(--color-checkins)"
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  )
}
