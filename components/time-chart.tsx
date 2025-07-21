"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface TimeChartProps {
  data: Array<{
    date: string
    totalTime: number
    productiveTime: number
  }>
}

export function TimeChart({ data }: TimeChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
    "Total Time": Math.round(item.totalTime / (1000 * 60)), // Convert to minutes
    "Productive Time": Math.round(item.productiveTime / (1000 * 60)),
    "Unproductive Time": Math.round((item.totalTime - item.productiveTime) / (1000 * 60)),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value, name) => [`${value} min`, name]} labelFormatter={(label) => `Day: ${label}`} />
        <Legend />
        <Bar dataKey="Productive Time" stackId="a" fill="#10b981" />
        <Bar dataKey="Unproductive Time" stackId="a" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  )
}
