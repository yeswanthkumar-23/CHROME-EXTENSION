"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface ProductivityChartProps {
  data: Array<{
    date: string
    totalTime: number
    productiveTime: number
  }>
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
    productivity: item.totalTime > 0 ? Math.round((item.productiveTime / item.totalTime) * 100) : 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip formatter={(value) => [`${value}%`, "Productivity"]} labelFormatter={(label) => `Day: ${label}`} />
        <Line
          type="monotone"
          dataKey="productivity"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
