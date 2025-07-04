"use client"

import { Bar, Line, ComposedChart, XAxis, YAxis, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  realizado: {
    label: "Receita Realizada",
    color: "hsl(var(--chart-1))",
  },
  previsto: {
    label: "Receita Prevista",
    color: "hsl(var(--chart-2))",
  },
}

export function ProjectedRevenueChart({ data }) {
  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <ComposedChart
        accessibilityLayer
        data={data}
        margin={{
          left: 0,
          right: 0,
          top: 5
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
          tickCount={4}
          tickFormatter={(value) => `R$${value/1000}k`}
        />
        <Tooltip
          content={<ChartTooltipContent 
            formatter={(value, name) => `R$ ${value.toFixed(2)}`}
            indicator="dot"
          />}
        />
        <Bar dataKey="realizado" fill="var(--color-realizado)" radius={4} />
        <Line 
            dataKey="previsto" 
            stroke="var(--color-previsto)" 
            strokeWidth={2} 
            dot={{ r: 5, fill: "var(--color-previsto)" }} 
            activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ChartContainer>
  )
}
