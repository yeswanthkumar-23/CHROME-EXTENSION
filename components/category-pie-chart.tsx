"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface CategoryPieChartProps {
  data: {
    productive: number
    unproductive: number
    neutral: number
  }
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const chartData = [
    { name: "Productive", value: data.productive, color: "#10b981" },
    { name: "Unproductive", value: data.unproductive, color: "#ef4444" },
    { name: "Neutral", value: data.neutral, color: "#94a3b8" },
  ]

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
